/**
 * map-viewer-base.tsx
 * 
 * This is the main map viewer component that wraps the OpenLayers 3 map viewer and its various APIs
 * 
 * This component is designed to be as "dumb" as possible, taking as much of its viewer directives from
 * the props given to it. It carries minimal component state. Where possible, relevant state is farmed off and 
 * managed by a higher level parent component
 * 
 * This component is usually wrapped by its "smart" sibling (src/containers/map-viewer.tsx), which is
 * redux aware and is responsible for flowing map state to the redux store (so any other interested
 * components will properly update) and flowing updated props back to this component to actually 
 * carry out the requested actions
 * 
 * NOTE: This component does not perfectly implement uni-directional data flow (sadly OpenLayers 3 is fighting
 * against us in some parts, and is prone to out-of-band updates to map state that we are not properly flowing back), 
 * thus it breaks certain debugging capabilities of redux such as "time travel"
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ol from "openlayers";
import { 
    IMapView,
    IExternalBaseLayer,
    DigitizerCallback,
    ActiveMapTool,
    Bounds,
    Coordinate,
    ImageFormat,
    RefreshMode,
    ClientKind,
    NOOP
} from "../api/common";
import {
    IApplicationContext,
    APPLICATION_CONTEXT_VALIDATION_MAP
} from "./context";
import * as Contracts from '../api/contracts';
import debounce = require("lodash.debounce");
import { areNumbersEqual } from '../utils/number';
import * as logger from '../utils/logger';
import { MgError, isSessionExpiredError } from '../api/error';
import { Client } from '../api/client';
import { QueryMapFeaturesResponse, FeatureSet } from '../api/contracts/query';
import { IQueryMapFeaturesOptions } from '../api/request-builder';
import { IInlineMenu, IItem, getEnabled, getIcon } from '../components/toolbar';
import { isMenu } from '../utils/type-guards';
import { tr } from "../api/i18n";
const isMobile = require("ismobilejs");
import { MenuComponent } from "./menu";
import { ContextMenuTarget, ContextMenu } from "@blueprintjs/core";
import { IMapViewerContextCallback, IMapViewerContextProps, MapViewerContext, MgLayerSet } from "./map-viewer-context";
import xor = require("lodash.xor");

export interface IMapViewerBaseProps extends IMapViewerContextProps {
    tool: ActiveMapTool;
    view?: IMapView;
    initialView?: IMapView;
    agentKind: ClientKind;
    featureTooltipsEnabled: boolean;
    stateChangeDebounceTimeout?: number;
    pointSelectionBuffer?: number;
    selectableLayerNames: string[];
    contextMenu?: IItem[];
    onRequestZoomToView?: (view: IMapView) => void;
    onQueryMapFeatures?: (options: Partial<IQueryMapFeaturesOptions>, callback?: (res: QueryMapFeaturesResponse) => void, errBack?: (err: any) => void) => void;
    onMouseCoordinateChanged?: (coords: number[]) => void;
    onBusyLoading: (busyCount: number) => void;
    onSessionExpired?: () => void;
    onBeginDigitization: (callback: (cancelled: boolean) => void) => void;
    overviewMapElementSelector?: () => (Element | null);
    showGroups: string[] | undefined;
    showLayers: string[] | undefined;
    hideGroups: string[] | undefined;
    hideLayers: string[] | undefined;
}

export function arrayChanged<T>(arr: T[] | undefined, other: T[] | undefined): boolean {
    if (arr && other) {
        return arr.length != other.length
            || xor(arr, other).length > 0;
    } else {
        return true;
    }
}

export function areViewsCloseToEqual(view: IMapView | undefined, otherView: IMapView | undefined): boolean {
    if (view && otherView) {
        return areNumbersEqual(view.x, otherView.x) &&
               areNumbersEqual(view.y, otherView.y) &&
               areNumbersEqual(view.scale, otherView.scale);
    } else {
        return false;
    }
}

export function areMapsSame(map: Contracts.RtMap.RuntimeMap, other: Contracts.RtMap.RuntimeMap): boolean {
    if (map != other) {
        return map.Name == other.Name;
    }
    return true;
}

const KC_ESCAPE = 27;

class SessionKeepAlive {
    private getSession: () => string;
    private client: Client;
    private interval: number;
    private timeoutID: number;
    constructor(getSession: () => string, client: Client, onSessionExpired: () => void) {
        this.getSession = getSession;
        this.client = client;
        this.client.getServerSessionTimeout(this.getSession()).then(tm => {
            this.interval = tm / 5 * 1000;  //Ping server 5 times each period. Timeout is returned in seconds.
            this.timeoutID = setTimeout(this.tick.bind(this), this.interval);
        }); 
    }
    private tick(): void {
        this.client.getServerSessionTimeout(this.getSession()).then(tm => {
            this.timeoutID = setTimeout(this.tick.bind(this), this.interval);
        });
    }
    public lastTry(): Promise<number> {
        return this.client.getServerSessionTimeout(this.getSession());
    }
}

function isMiddleMouseDownEvent(e: MouseEvent) {
    return (e && (e.which == 2 || e.button == 4 ));
}

function cloneExtent(bounds: Bounds): Bounds {
    return [
        bounds[0],
        bounds[1],
        bounds[2],
        bounds[3]
    ];
}

@ContextMenuTarget
export class MapViewerBase extends React.Component<IMapViewerBaseProps, any> {
    private fnMouseUp: GenericEventHandler;
    private fnMouseDown: GenericEventHandler;
    /**
     * Indicates if touch events are supported.
     */
    private _supportsTouch: boolean;
    /**
     * The internal OpenLayers map instance
     * 
     * @private
     * @type {ol.Map}
     */
    private _map: ol.Map;
    private _wktFormat: ol.format.WKT;
    private _zoomSelectBox: ol.interaction.DragBox;
    private _mapContext: MapViewerContext;
    private _client: Client;
    private _busyWorkers: number;
    private _triggerZoomRequestOnMoveEnd: boolean;
    private _keepAlive: SessionKeepAlive;
    private _contextMenuOpen: boolean;

    private _customLayers: { [name: string]: ol.layer.Base; };

    private fnKeyUp: GenericEventHandler;
    private fnKeyDown: GenericEventHandler;
    /**
     * This is a throttled version of _refreshOnStateChange(). Call this on any 
     * modifications to pendingStateChanges 
     * 
     * @private
     */
    private refreshOnStateChange: (props: IMapViewerBaseProps) => void;

    constructor(props: IMapViewerBaseProps) {
        super(props);
        this.refreshOnStateChange = debounce(this._refreshOnStateChange.bind(this), props.stateChangeDebounceTimeout || 500);
        this._wktFormat = new ol.format.WKT();
        this.fnKeyDown = this.onKeyDown.bind(this);
        this.fnKeyUp = this.onKeyUp.bind(this);
        this.fnMouseDown = this.onMouseDown.bind(this);
        this.fnMouseUp = this.onMouseUp.bind(this);
        this._busyWorkers = 0;
        this._triggerZoomRequestOnMoveEnd = true;
        this._supportsTouch = isMobile.phone || isMobile.tablet;
        this._contextMenuOpen = false;
        this._customLayers = {};
        this.state = {
            shiftKey: false,
            isMouseDown: false,
            digitizingType: null
        };
    }
    /**
     * DO NOT CALL DIRECTLY, call this.refreshOnStateChange() instead, which is a throttled version
     * of this method
     * @private
     */
    private _refreshOnStateChange(props: IMapViewerBaseProps) {
        const { map, showGroups, showLayers, hideGroups, hideLayers } = props;
        if (showGroups || showLayers || hideGroups || hideLayers) {
            this._mapContext.refreshOnStateChange(map, showGroups, showLayers, hideGroups, hideLayers);
        }
    }
    public scaleToResolution(scale: number): number {
        const activeLayerSet = this._mapContext.getLayerSet(this.props.map.Name);
        return activeLayerSet.scaleToResolution(scale);
    }
    public resolutionToScale(resolution: number): number {
        const activeLayerSet = this._mapContext.getLayerSet(this.props.map.Name);
        return activeLayerSet.resolutionToScale(resolution);
    }
    public getPointSelectionBox(point: Coordinate, ptBuffer: number): Bounds {
        const ll = this._map.getCoordinateFromPixel([point[0] - ptBuffer, point[1] - ptBuffer]);
        const ur = this._map.getCoordinateFromPixel([point[0] + ptBuffer, point[1] + ptBuffer]);
        return [ll[0], ll[1], ur[0], ur[1]];
    }
    private onContextMenuItemInvoked() {
        ContextMenu.hide();
    }
    public renderContextMenu(): JSX.Element {
        if (this.props.contextMenu) {
            return <MenuComponent items={this.props.contextMenu} onInvoked={this.onContextMenuItemInvoked.bind(this)} />;
        }
        return <noscript />;
    }
    private onMapClick(e: GenericEvent) {
        if (this.isDigitizing()) {
            return;
        }
        if (this.props.tool === ActiveMapTool.Select) {
            const ptBuffer = this.props.pointSelectionBuffer || 2;
            const box: Bounds | null = this.getPointSelectionBox(e.pixel, ptBuffer);
            if (box) {
                const geom = ol.geom.Polygon.fromExtent(box);
                const options = this.buildDefaultQueryOptions(geom);
                options.maxfeatures = 1;
                this.sendSelectionQuery(options);
            }
        }
    }
    private getSelectableLayers(): string[] {
        return this.props.selectableLayerNames || [];
    }
    private buildDefaultQueryOptions(geom: ol.geom.Geometry | string, reqQueryFeatures: number = 1 /* Attributes */): IQueryMapFeaturesOptions {
        const names = this.getSelectableLayers();
        let wkt: string;
        if (typeof geom === 'string') {
            wkt = geom;
        } else {
            wkt = this._wktFormat.writeGeometry(geom);
        }
        return {
            mapname: this.props.map.Name,
            session: this.props.map.SessionId,
            geometry: wkt,
            requestdata: reqQueryFeatures,
            layernames: names.length > 0 ? names.join(",") : undefined,
            persist: 1
        };
    }
    private onZoomSelectBox(e: GenericEvent) {
        const extent = this._zoomSelectBox.getGeometry();
        switch (this.props.tool) {
            case ActiveMapTool.Zoom:
                {
                    const ext = extent.getExtent();
                    this.onRequestZoomToView(this.getViewForExtent(ext));
                }
                break;
            case ActiveMapTool.Select:
                {
                    this.sendSelectionQuery(this.buildDefaultQueryOptions(extent));
                }
                break;
        }
    }
    private sendSelectionQuery(queryOpts?: IQueryMapFeaturesOptions, success?: (res: QueryMapFeaturesResponse) => void, failure?: (err: Error) => void) {
        if (queryOpts != null && queryOpts.layernames != null && queryOpts.layernames.length == 0) {
            return;
        }
        this.incrementBusyWorker();
        const qOrig: Partial<IQueryMapFeaturesOptions> = {
            mapname: this.props.map.Name,
            session: this.props.map.SessionId,
            persist: 1,
            selectionvariant: "INTERSECTS",
            selectioncolor: this.props.selectionColor,
            selectionformat: this.props.selectionImageFormat || "PNG8",
            maxfeatures: -1
        };
        const queryOptions: Partial<IQueryMapFeaturesOptions> = { ...qOrig, ...queryOpts };
        if (this.props.onQueryMapFeatures) {
            this.props.onQueryMapFeatures(queryOptions, res => {
                this.decrementBusyWorker();
                if (success) {
                    success(res);
                }
            }, err => {
                this.decrementBusyWorker();
                if (failure) {
                    failure(err);
                }
            });
        }
    }
    private zoomByDelta(delta: number) {
        const view = this._map.getView();
        if (!view) {
            return;
        }
        const currentResolution = view.getResolution();
        if (currentResolution) {
            this._map.beforeRender(ol.animation.zoom({
                resolution: currentResolution,
                duration: 250,
                easing: ol.easing.easeOut
            }));
            const newResolution = view.constrainResolution(currentResolution, delta);
            view.setResolution(newResolution);
        }
    }
    private _activeDrawInteraction: ol.interaction.Draw | null;
    private removeActiveDrawInteraction() {
        if (this._activeDrawInteraction) {
            this._map.removeInteraction(this._activeDrawInteraction);
            this._activeDrawInteraction = null;
            this.setState({ digitizingType: null });
        }
    }
    private cancelDigitization() {
        if (this.isDigitizing()) {
            this.removeActiveDrawInteraction();
            this._mapContext.clearMouseTooltip();
            //this._mouseTooltip.clear();
        }
    }
    private pushDrawInteraction<T extends ol.geom.Geometry>(digitizingType: string, draw: ol.interaction.Draw, handler: DigitizerCallback<T>, prompt?: string): void {
        this.props.onBeginDigitization(cancel => {
            if (!cancel) {
                this.removeActiveDrawInteraction();
                //this._mouseTooltip.clear();
                this._mapContext.clearMouseTooltip();
                if (prompt) {
                    //this._mouseTooltip.setText(prompt);
                    this._mapContext.setMouseTooltip(prompt);
                }
                this._activeDrawInteraction = draw;
                this._activeDrawInteraction.once("drawend", (e: GenericEvent) => {
                    const drawnFeature: ol.Feature = e.feature;
                    const geom: T = drawnFeature.getGeometry() as T;
                    this.cancelDigitization();
                    handler(geom);
                })
                this._map.addInteraction(this._activeDrawInteraction);
                this.setState({ digitizingType: digitizingType });
            }
        });
    }
    private onKeyDown(e: GenericEvent) {
        switch (e.keyCode) {
            case KC_ESCAPE:
                this.cancelDigitization();
                break;
        }
        this.setState({ shiftKey: e.shiftKey });
    }
    private onKeyUp(e: GenericEvent) {
        this.setState({ shiftKey: e.shiftKey });
    }
    private onMouseDown(e: GenericEvent) {
        if (!this.state.isMouseDown) {
            this.setState({
                isMouseDown: true
            });
        }
    }
    private onMouseUp(e: GenericEvent) {
        if (this.state.isMouseDown) {
            this.setState({
                isMouseDown: false
            });
        }
    }
    private onMouseMove(e: GenericEvent) {
        //if (this._mouseTooltip) {
        //    this._mouseTooltip.onMouseMove(e);
        //}
        this._mapContext.handleMouseTooltipMouseMove(e);
        if (this._contextMenuOpen) {
            return;
        }
        //if (this._featureTooltip && this._featureTooltip.isEnabled()) {
        //    this._featureTooltip.onMouseMove(e);
        //}
        this._mapContext.handleFeatureTooltipMouseMove(e);
        if (this.props.onMouseCoordinateChanged != null) {
            this.props.onMouseCoordinateChanged(e.coordinate);
        }
    }
    private incrementBusyWorker() {
        this._busyWorkers++;
        this.props.onBusyLoading(this._busyWorkers);
    }
    private decrementBusyWorker() {
        this._busyWorkers--;
        this.props.onBusyLoading(this._busyWorkers);
    }
    private onRequestZoomToView(view: IMapView): void {
        if (this.props.onRequestZoomToView != null) {
            this.props.onRequestZoomToView({
                x: view.x,
                y: view.y,
                scale: view.scale
            });
        }
    }
    private onImageError(e: GenericEvent) {
        this.decrementBusyWorker();
        this._keepAlive.lastTry().catch(err => {
            if (isSessionExpiredError(err)) {
                this.onSessionExpired();
            }
        });
    }
    protected createOLMap(options: olx.MapOptions): any {
        return new ol.Map(options);
    }
    private getCallback(): IMapViewerContextCallback {
        return {
            incrementBusyWorker: this.incrementBusyWorker.bind(this),
            decrementBusyWorker: this.decrementBusyWorker.bind(this),
            onImageError: this.onImageError.bind(this),
            onSessionExpired: this.onSessionExpired.bind(this),
            getSelectableLayers: this.getSelectableLayers.bind(this),
            getClient: () => this._client,
            isContextMenuOpen: () => this._contextMenuOpen,
            getAgentUri: () => this.props.agentUri,
            getAgentKind: () => this.props.agentKind,
            getMapName: () => this.props.map.Name,
            getSessionId: () => this.props.map.SessionId,
            isFeatureTooltipEnabled: this.isFeatureTooltipEnabled.bind(this)
        };
    }
    private applyView(layerSet: MgLayerSet, vw: IMapView) {
        this._triggerZoomRequestOnMoveEnd = false;
        layerSet.view.setCenter([vw.x, vw.y]);
        //Don't use this.scaleToResolution() as that uses this.props to determine
        //applicable layer set, but we already have that here
        layerSet.view.setResolution(layerSet.scaleToResolution(vw.scale));
        this._triggerZoomRequestOnMoveEnd = true;
    }
    // ----------------- React Lifecycle ----------------- //
    componentWillReceiveProps(nextProps: IMapViewerBaseProps) {
        // 
        // React (no pun intended) to prop changes
        //
        const props = this.props;
        if (nextProps.imageFormat != props.imageFormat) {
            logger.warn(`Unsupported change of props: imageFormat`);
        }
        if (nextProps.agentUri != props.agentUri) {
            logger.warn(`Unsupported change of props: agentUri`);
            this._client = new Client(nextProps.agentUri, nextProps.agentKind);
        }
        if (nextProps.agentKind != props.agentKind) {
            logger.warn(`Unsupported change of props: agentKind`);
            this._client = new Client(nextProps.agentUri, nextProps.agentKind);
        }
        let bChangedView = false;
        //map
        if (!areMapsSame(nextProps.map, props.map)) {
            const oldLayerSet = this._mapContext.getLayerSet(props.map.Name);
            const newLayerSet = this._mapContext.getLayerSet(nextProps.map.Name, true, nextProps);
            oldLayerSet.detach(this._map);
            newLayerSet.attach(this._map);
            //This would happen if we switch to a map we haven't visited yet
            if (!nextProps.view) {
                newLayerSet.view.fit(newLayerSet.extent, this._map.getSize());
                bChangedView = true;
            } else {
                const layerSet = this._mapContext.getLayerSet(nextProps.map.Name);
                this.applyView(layerSet, nextProps.view);
            }
        }
        //selectionColor
        if (nextProps.selectionColor && nextProps.selectionColor != props.selectionColor) {
            const layerSet = this._mapContext.getLayerSet(nextProps.map.Name);
            layerSet.updateSelectionColor(nextProps.selectionColor);
        }
        //featureTooltipsEnabled
        if (nextProps.featureTooltipsEnabled != props.featureTooltipsEnabled) {
            this._mapContext.enableFeatureTooltips(nextProps.featureTooltipsEnabled);
        }
        //externalBaseLayers
        if (nextProps.externalBaseLayers != null && 
            nextProps.externalBaseLayers.length > 0) {
            const layerSet = this._mapContext.getLayerSet(nextProps.map.Name);
            layerSet.updateExternalBaseLayers(nextProps.externalBaseLayers);
        }
        //Layer/Group visibility
        if (arrayChanged(nextProps.showGroups, props.showGroups) ||
            arrayChanged(nextProps.hideGroups, props.hideGroups) ||
            arrayChanged(nextProps.showLayers, props.showLayers) ||
            arrayChanged(nextProps.hideLayers, props.hideLayers)) {
            this.refreshOnStateChange(nextProps);
        }
        //view
        if (!areViewsCloseToEqual(nextProps.view, props.view)) {
            const vw = nextProps.view;
            if (vw != null && !bChangedView) {
                const layerSet = this._mapContext.getLayerSet(nextProps.map.Name);
                this.applyView(layerSet, vw);
            } else {
                logger.info(`Skipping zoomToView as next/current views are close enough or target view is null`);
            }
        }
        //overviewMapElement
        if (nextProps.overviewMapElementSelector) {
            this._mapContext.updateOverviewMap(nextProps.overviewMapElementSelector);
        }
    }
    componentDidMount() {
        const { map, agentUri, imageFormat } = this.props;
        const mapNode = ReactDOM.findDOMNode(this);

        this._client = new Client(this.props.agentUri, this.props.agentKind);
        this._keepAlive = new SessionKeepAlive(() => this.props.map.SessionId, this._client, this.onSessionExpired.bind(this));
        this._zoomSelectBox = new ol.interaction.DragBox({
            condition: (e) => !this.isDigitizing() && (this.props.tool === ActiveMapTool.Select || this.props.tool === ActiveMapTool.Zoom)
        });
        this._zoomSelectBox.on("boxend", this.onZoomSelectBox.bind(this));
        const mapOptions: olx.MapOptions = {
            logo: false,
            target: mapNode,
            //layers: layers,
            //view: view,
            controls: [
                new ol.control.Attribution(),
                new ol.control.Rotate()
            ],
            interactions: [
                new ol.interaction.DragRotate(),
                new ol.interaction.DragPan({
                    condition: (e) => {
                        const startingMiddleMouseDrag = e.type == "pointerdown" && isMiddleMouseDownEvent((e as any).originalEvent);
                        const enabled = (startingMiddleMouseDrag || this._supportsTouch || this.props.tool === ActiveMapTool.Pan);
                        //console.log(e);
                        //console.log(`Allow Pan - ${enabled} (middle mouse: ${startingMiddleMouseDrag})`);
                        return enabled;
                    }
                }),
                new ol.interaction.PinchRotate(),
                new ol.interaction.PinchZoom(),
                new ol.interaction.KeyboardPan(),
                new ol.interaction.KeyboardZoom(),
                new ol.interaction.MouseWheelZoom(),
                this._zoomSelectBox
            ]
        };
        this._map = this.createOLMap(mapOptions);
        this._map.on("pointermove", this.onMouseMove.bind(this));
        const callback = this.getCallback();
        this._mapContext = new MapViewerContext(this._map, callback);
        const activeLayerSet = this._mapContext.initLayerSet(this.props);
        activeLayerSet.attach(this._map);
        this._mapContext.initOverviewMap(activeLayerSet.projection, this.props.overviewMapElementSelector);
        document.addEventListener("keydown", this.fnKeyDown);
        document.addEventListener("keyup", this.fnKeyUp);

        this._map.on("click", this.onMapClick.bind(this));
        this._map.on("moveend", (e: GenericEvent) => {
            //HACK:
            //
            //What we're hoping here is that when the view has been broadcasted back up
            //and flowed back in through new view props, that the resulting zoom/pan 
            //operation in componentWillReceiveProps() is effectively a no-op as the intended
            //zoom/pan location has already been reached by this event right here
            //
            //If we look at this through Redux DevTools, we see 2 entries for Map/SET_VIEW
            //for the initial view (un-desirable), but we still only get one map image request
            //for the initial view (good!). Everything is fine after that.
            if (this._triggerZoomRequestOnMoveEnd) { 
                this.onRequestZoomToView(this.getCurrentView());
            } else {
                logger.info("Triggering zoom request on moveend suppresseed");
            }
        });
        
        if (this.props.initialView != null) {
            this.zoomToView(this.props.initialView.x, this.props.initialView.y, this.props.initialView.scale);
        } else {
            this._map.getView().fit(activeLayerSet.extent, this._map.getSize());
        }
    }
    render(): JSX.Element {
        const { map, tool } = this.props;
        const { isMouseDown } = this.state;
        const style: React.CSSProperties = { 
            width: "100%",
            height: "100%" 
        };
        if (this.isDigitizing()) {
            const dtype = this.state.digitizingType;
            switch (dtype) {
                case "Point":
                    style.cursor = `url(${getIcon("digitizePoint.cur")}), auto`;
                    //console.log(`cursor: ${style.cursor}`);
                    break;
                case "Line":
                    style.cursor = `url(${getIcon("digitizeLine.cur")}), auto`;
                    //console.log(`cursor: ${style.cursor}`);
                    break;
                case "LineString":
                    style.cursor = `url(${getIcon("digitizeLineString.cur")}), auto`;
                    //console.log(`cursor: ${style.cursor}`);
                    break;
                case "Rectangle":
                    style.cursor = `url(${getIcon("digitizeRectangle.cur")}), auto`;
                    //console.log(`cursor: ${style.cursor}`);
                    break;
                case "Polygon":
                    style.cursor = `url(${getIcon("digitizePolygon.cur")}), auto`;
                    //console.log(`cursor: ${style.cursor}`);
                    break;
                case "Circle":
                    style.cursor = `url(${getIcon("digitizeCircle.cur")}), auto`;
                    //console.log(`cursor: ${style.cursor}`);
                    break;
            }
        } else {
            switch (tool) {
                case ActiveMapTool.Pan:
                    if (isMouseDown) {
                        style.cursor = `url(${getIcon("grabbing.cur")}), auto`;
                        //console.log(`cursor: ${style.cursor}`);
                    } else {
                        style.cursor = `url(${getIcon("grab.cur")}), auto`;
                        //console.log(`cursor: ${style.cursor}`);
                    }
                    break;
                case ActiveMapTool.Zoom:
                    style.cursor = `url(${getIcon("zoomin.cur")}), auto`;
                    //console.log(`cursor: ${style.cursor}`);
                    break;
            }
        }
        if (map) {
            style.backgroundColor = `#${map.BackgroundColor.substring(2)}`;
        }
        return <div className="map-viewer-component" style={style} onMouseDown={this.fnMouseDown} onMouseUp={this.fnMouseUp} />;
    }
    componentWillUnmount() {

    }
    public getViewForExtent(extent: Bounds): IMapView {
        const scale = this.getScaleForExtent(extent);
        const center = ol.extent.getCenter(extent);
        return {
            x: center[0],
            y: center[1],
            scale: scale
        };
    }
    private onSessionExpired() {
        if (this.props.onSessionExpired != null) {
            this.props.onSessionExpired();
        }
    }
    private convertContextMenuItems(items: IItem[] | null | undefined): any[] {
        return (items || []).map(i => {
            if (i.isSeparator === true) {
                return '-';
            } else {
                let cb: (() => void) | undefined;
                let items: any[] | undefined;
                if (isMenu(i)) {
                    items = this.convertContextMenuItems(i.childItems)
                } else {
                    cb = () => {
                        if (getEnabled(i) && i.invoke) { //We have to do this because ol3-contextmenu current has no notion of disabled items
                            i.invoke();
                        }
                    };
                }
                return {
                    text: i.label,
                    icon: i.icon != null ? getIcon(i.icon) : null,
                    classname: getEnabled(i) === false ? "context-menu-item-disabled" : null,
                    callback: cb,
                    items: items
                }
            }
        });
    }
    private getScaleForExtent(bounds: Bounds): number {
        const activeLayerSet = this._mapContext.getLayerSet(this.props.map.Name);
        const mcsW = ol.extent.getWidth(bounds);
        const mcsH = ol.extent.getHeight(bounds);
        const size = this._map.getSize();
        const devW = size[0];
        const devH = size[1];
        const metersPerPixel = 0.0254 / activeLayerSet.dpi;
        const metersPerUnit = activeLayerSet.getMetersPerUnit();
        //Scale calculation code from AJAX viewer
        let mapScale: number;
        if (devH * mcsW > devW * mcsH)
            mapScale = mcsW * metersPerUnit / (devW * metersPerPixel); // width-limited
        else
            mapScale = mcsH * metersPerUnit / (devH * metersPerPixel); // height-limited
        return mapScale;
    }
    public getCurrentView(): IMapView {
        const ov = this.getOLView();
        const center = ov.getCenter();
        const scale = this.resolutionToScale(ov.getResolution());
        return {
            x: center[0],
            y: center[1],
            scale: scale
        };
    }
    public getCurrentExtent(): Bounds {
        return this._map.getView().calculateExtent(this._map.getSize());
    }
    public getOLView(): ol.View {
        return this._map.getView();
    }
    public zoomToView(x: number, y: number, scale: number): void {
        const view = this._map.getView();
        view.setCenter([x, y]);
        view.setResolution(this.scaleToResolution(scale));
    }
    public setSelectionXml(xml: string, queryOpts?: IQueryMapFeaturesOptions, success?: (res: QueryMapFeaturesResponse) => void, failure?: (err: Error) => void): void {
        //NOTE: A quirk of QUERYMAPFEATURES is that when passing in selection XML (instead of geometry), 
        //you must set the layerattributefilter to the full bit mask otherwise certain features in the
        //selection XML will not be rendered because they may not pass the layer attribute filter
        const reqQueryFeatures = 1; //Attributes
        this.incrementBusyWorker();
        const qOrig = {
            mapname: this.props.map.Name,
            session: this.props.map.SessionId,
            persist: 1,
            featurefilter: xml,
            selectioncolor: this.props.selectionColor,
            selectionformat: this.props.selectionImageFormat || "PNG8",
            maxfeatures: -1,
            requestdata: reqQueryFeatures
        };
        const queryOptions = { ...qOrig, ...queryOpts };
        if (this.props.onQueryMapFeatures) {
            this.props.onQueryMapFeatures(queryOptions, res => {
                this.decrementBusyWorker();
                if (success)
                    success(res);
            }, err => {
                this.decrementBusyWorker();
                if (failure)
                    failure(err);
            });
        }
    }
    public refreshMap(mode: RefreshMode = RefreshMode.LayersOnly | RefreshMode.SelectionOnly): void {
        this._mapContext.refreshMap(this.props.map.Name, mode);
    }
    public getMetersPerUnit(): number {
        const activeLayerSet = this._mapContext.getLayerSet(this.props.map.Name);
        return activeLayerSet.getMetersPerUnit();
    }
    public initialView(): void {
        const activeLayerSet = this._mapContext.getLayerSet(this.props.map.Name);
        this.onRequestZoomToView(this.getViewForExtent(activeLayerSet.extent));
    }
    public clearSelection(): void {
        this.setSelectionXml("");
    }
    public zoomDelta(delta: number): void {
        //TODO: To conform to redux uni-directional data flow, this should
        //broadcast the new desired view back up and flow it back through to this
        //component as new props
        this.zoomByDelta(delta);
    }
    public zoomToExtent(extent: Bounds): void {
        this.onRequestZoomToView(this.getViewForExtent(extent));
    }
    public isDigitizing(): boolean {
        return this._activeDrawInteraction != null;
    }
    public digitizePoint(handler: DigitizerCallback<ol.geom.Point>, prompt?: string): void {
        const draw = new ol.interaction.Draw({
            type: "Point"//ol.geom.GeometryType.POINT
        });
        this.pushDrawInteraction("Point", draw, handler, prompt || tr("DIGITIZE_POINT_PROMPT", this.props.locale));
    }
    public digitizeLine(handler: DigitizerCallback<ol.geom.LineString>, prompt?: string): void {
        const draw = new ol.interaction.Draw({
            type: "LineString", //ol.geom.GeometryType.LINE_STRING,
            minPoints: 2,
            maxPoints: 2
        });
        this.pushDrawInteraction("Line", draw, handler, prompt || tr("DIGITIZE_LINE_PROMPT", this.props.locale));
    }
    public digitizeLineString(handler: DigitizerCallback<ol.geom.LineString>, prompt?: string): void {
        const draw = new ol.interaction.Draw({
            type: "LineString", //ol.geom.GeometryType.LINE_STRING,
            minPoints: 2
        });
        this.pushDrawInteraction("LineString", draw, handler, prompt || tr("DIGITIZE_LINESTRING_PROMPT", this.props.locale));
    }
    public digitizeCircle(handler: DigitizerCallback<ol.geom.Circle>, prompt?: string): void {
        const draw = new ol.interaction.Draw({
            type: "Circle" //ol.geom.GeometryType.CIRCLE
        });
        this.pushDrawInteraction("Circle", draw, handler, prompt || tr("DIGITIZE_CIRCLE_PROMPT", this.props.locale));
    }
    public digitizeRectangle(handler: DigitizerCallback<ol.geom.Polygon>, prompt?: string): void {
        const geomFunc: ol.DrawGeometryFunctionType = (coordinates, geometry) => {
            if (!geometry) {
                geometry = new ol.geom.Polygon([]);
            }
            const start: any = coordinates[0];
            const end: any = coordinates[1];
            (geometry as any).setCoordinates([
                [start, [start[0], end[1]], end, [end[0], start[1]], start]
            ]);
            return geometry;
        }; 
        const draw = new ol.interaction.Draw({
            type: "LineString", //ol.geom.GeometryType.LINE_STRING,
            maxPoints: 2,
            geometryFunction: geomFunc
        });
        this.pushDrawInteraction("Rectangle", draw, handler, prompt || tr("DIGITIZE_RECT_PROMPT", this.props.locale));
    }
    public digitizePolygon(handler: DigitizerCallback<ol.geom.Polygon>, prompt?: string): void {
        const draw = new ol.interaction.Draw({
            type: "Polygon" //ol.geom.GeometryType.POLYGON
        });
        this.pushDrawInteraction("Polygon", draw, handler, prompt || tr("DIGITIZE_POLYGON_PROMPT", this.props.locale));
    }
    public selectByGeometry(geom: ol.geom.Geometry): void {
        this.sendSelectionQuery(this.buildDefaultQueryOptions(geom));
    }
    public queryMapFeatures(options: IQueryMapFeaturesOptions, success?: (res: QueryMapFeaturesResponse) => void, failure?: (err: Error) => void): void {
        this.sendSelectionQuery(options, success, failure);
    }
    public isFeatureTooltipEnabled(): boolean {
        //return this._featureTooltip.isEnabled();
        return this._mapContext.isFeatureTooltipEnabled();
    }
    public setFeatureTooltipEnabled(enabled: boolean): void {
        //this._featureTooltip.setEnabled(enabled);
        this._mapContext.enableFeatureTooltips(enabled);
    }
    public addLayer<T extends ol.layer.Base>(name: string, layer: T): T {
        if (this._customLayers[name]) {
            throw new MgError(`A layer named ${name} already exists`);
        }
        this._map.addLayer(layer);
        this._customLayers[name] = layer;
        return layer;
    }
    public removeLayer(name: string): ol.layer.Base | undefined {
        let layer: ol.layer.Base;
        if (this._customLayers[name]) {
            layer = this._customLayers[name];
            this._map.removeLayer(layer);
            delete this._customLayers[name];
            return layer;
        }
    }
    public getLayer<T extends ol.layer.Base>(name: string, factory: () => T): T {
        let layer: T;
        if (this._customLayers[name]) {
            layer = this._customLayers[name] as T;
        } else {
            layer = factory();
            this._customLayers[name] = layer;
            this._map.addLayer(layer);
        }
        return layer;
    }
    public addInteraction<T extends ol.interaction.Interaction>(interaction: T): T {
        this._map.addInteraction(interaction);
        return interaction;
    }
    public removeInteraction<T extends ol.interaction.Interaction>(interaction: T): void {
        this._map.removeInteraction(interaction);
    }
    public addOverlay(overlay: ol.Overlay): void {
        this._map.addOverlay(overlay);
    }
    public removeOverlay(overlay: ol.Overlay): void {
        this._map.removeOverlay(overlay);
    }
    public getProjection(): ol.ProjectionLike {
        return this._map.getView().getProjection();
    }
    public addHandler(eventName: string, handler: Function) {
        this._map.on(eventName, handler);
    }
    public removeHandler(eventName: string, handler: Function) {
        this._map.un(eventName, handler);
    }
    //------------------------------------//
}