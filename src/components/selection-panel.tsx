import * as React from "react";
import { SelectedFeatureSet, SelectedFeature, LayerMetadata, SelectedLayer, FeatureProperty } from "../api/contracts/query";
import { Toolbar, IItem, DEFAULT_TOOLBAR_SIZE, TOOLBAR_BACKGROUND_COLOR } from "./toolbar";
import { tr as xlate, DEFAULT_LOCALE } from "../api/i18n";
import { GenericEvent } from "../api/common";
import {
    SPRITE_CONTROL,
    SPRITE_CONTROL_180,
    SPRITE_ICON_ZOOMSELECT
} from "../constants/assets";
import { safePropAccess } from '../utils/safe-prop';
import * as xml2js from "xml2js";

export interface ISelectedFeatureProps {
    selectedFeature: SelectedFeature;
    selectedLayer: LayerMetadata;
    locale: string;
    allowHtmlValues: boolean;
    cleanHTML?: (html: string) => string;
    onSupportingFileClick?:(selectedURL: string) => void;
}

const DefaultSelectedFeature = (props: ISelectedFeatureProps) => {
    const { selectedFeature, selectedLayer, locale, allowHtmlValues, cleanHTML, onSupportingFileClick } = props
    const featureProps = [] as FeatureProperty[]
    for (const lp of selectedLayer.Property) {
        const matches = selectedFeature.Property.filter(fp => fp.Name === lp.DisplayName);
        if (matches.length === 1) {
            featureProps.push(matches[0])
        }
    }
    return <table className="selection-panel-property-grid pt-table pt-condensed pt-bordered">
        <thead>
            <tr>
                <th>{xlate("SELECTION_PROPERTY", locale)}</th>
                <th>{xlate("SELECTION_VALUE", locale)}</th>
            </tr>
        </thead>
        <tbody>
        {featureProps.map(prop => {
            if ((prop.Name == "Supporting Files") && (prop.Value != null)) {
                return PBPLComponentInfo_SupportingFiles(prop, props);
            }else if((prop.Name == "Report Link") && (prop.Value != null)){
                return PBPLReportLink(prop, props);
            }else if((prop.Name == "Parcel Lot/Plan" || prop.Name == "Primary Parcel Lot/Plan") && (prop.Value != null)){
                return PBPLSurveyPlanLink(prop, props);
            }else{
                return <tr key={prop.Name}>
                    <td>{prop.Name}</td>
                    {(() => {
                        let value = prop.Value
                        if (allowHtmlValues) {
                            if (cleanHTML) {
                                value = cleanHTML(value)
                            }
                            return <td dangerouslySetInnerHTML={{ __html: value }} />
                        } else {
                            return <td>{prop.Value}</td>
                        }
                    })()}
                </tr>
            }
        })}
        </tbody>
    </table>
};

const PBPLReportLink = (prop: FeatureProperty, props: ISelectedFeatureProps) => {
    const {onSupportingFileClick} = props

    function onFeatureSupportingFileClick(selectedURL:string){
        if (onSupportingFileClick){
            onSupportingFileClick(selectedURL)
        }
    }
    let value = prop.Value;
    return <tr key={prop.Name}>
        <td>{prop.Name}</td>
        <td><span className="pt-button pt-minimal pt-icon-box" title={prop.Value} onClick={() => onFeatureSupportingFileClick("https://objective.portbris.com.au/#/documents/" + prop.Value + "/details")} style={{ fontSize: "xx-small" }}>{prop.Value}</span></td>
    </tr>
    
}

const PBPLSurveyPlanLink = (prop: FeatureProperty, props: ISelectedFeatureProps) => {
    const {onSupportingFileClick} = props

    function onFeatureSupportingFileClick(selectedURL:string){
        if (onSupportingFileClick){
            onSupportingFileClick(selectedURL)
        }
    }
    let value = prop.Value;
    let plan = (prop.Value.indexOf("/")>-1?prop.Value.split("/")[1]:prop.Value);
    return <tr key={prop.Name}>
        <td>{prop.Name}</td>
        <td><span className="pt-button pt-minimal pt-icon-map" title={prop.Value} onClick={() => onFeatureSupportingFileClick("http://gisdata/spatial_data/pdfs/" + plan + ".pdf")} style={{ fontSize: "xx-small" }}>{prop.Value}</span></td>
    </tr>
    
}

const PBPLComponentInfo_SupportingFiles = (prop: FeatureProperty, props: ISelectedFeatureProps) => {
    const {onSupportingFileClick} = props
    
    function onFeatureSupportingFileClick(selectedURL:string){
        if (onSupportingFileClick){
            onSupportingFileClick(selectedURL);
        }
    }

    var supportingFiles = [] as any[];
                    xml2js.parseString(prop.Value,
                        function (err:string, result:any) {
                            supportingFiles = result.ComponentInfo_SupportingFiles.SupportingFile;
                        }
                    )
    return <tr key={prop.Name}>
        <td colSpan={2}>
            <table className="selection-panel-property-grid pt-table pt-condensed pt-striped" style={{ fontSize: "xx-small" }}>
                <caption>Supporting Files</caption>
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Status</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    {supportingFiles.map((supportingFile, i) => {
                        var fileName: string | null;
                        fileName = supportingFile.FileName[0].match(new RegExp(/[^/]*$/))[0];
                        
                        // =.exec(supportingFile.file[0])[0];
                        //if(fileName == null){ 
                        //    fileName = "";
                        //};
                        //fileName = "somestring";
                        if (supportingFile.FileType == "Image") {
                            return <tr><td><span className="pt-button pt-minimal pt-icon-media" title={supportingFile.FileName[0]} onClick={() => onFeatureSupportingFileClick("http://gisdata/spatial_data/imagery/terrain" + supportingFile.FileName[0])} style={{ fontSize: "xx-small" }}>{fileName}</span></td><td>{supportingFile.FileStatus[0]}</td><td>{supportingFile.FileComment[0]}</td></tr>;
                        } else if (supportingFile.FileType == "Plan") {
                            return <tr><td><span className="pt-button pt-minimal pt-icon-map" title={supportingFile.FileName[0]} onClick={() => onFeatureSupportingFileClick("http://gisdata/spatial_data/pdfs/" + supportingFile.FileName[0] + ".pdf")} style={{ fontSize: "xx-small" }}>{fileName}</span></td><td>{supportingFile.FileStatus[0]}</td><td>{supportingFile.FileComment[0]}</td></tr>;
                        } else if (supportingFile.FileType == "Survey") {
                            return <tr><td><span className="pt-button pt-minimal pt-icon-map" title={supportingFile.FileName[0]} onClick={() => onFeatureSupportingFileClick("http://gisdata/spatial_data/pdfs/" + supportingFile.FileName[0]) + ".pdf"} style={{ fontSize: "xx-small" }}>{fileName}</span></td><td>{supportingFile.FileStatus[0]}</td><td>{supportingFile.FileComment[0]}</td></tr>;
                        } else if (supportingFile.FileType == "record") {
                            return <tr><td><span className="pt-button pt-minimal pt-icon-document" title={supportingFile.FileName[0]} onClick={() => onFeatureSupportingFileClick(supportingFile.FileName[0])} style={{ fontSize: "xx-small" }}>{fileName}</span></td><td>{supportingFile.FileStatus[0]}</td><td>{supportingFile.FileComment[0]}</td></tr>;
                        } else if (supportingFile.FileType == "Objective" || supportingFile.FileType == "Document") {
                            return <tr><td><span className="pt-button pt-minimal pt-icon-box" title={supportingFile.FileName[0]} onClick={() => onFeatureSupportingFileClick("https://objective.portbris.com.au:8443/id:" + supportingFile.FileName[0] + "/document/versions/latest")} style={{ fontSize: "xx-small" }}>{fileName}</span> <span className="pt-button pt-minimal pt-icon-info-sign" title={supportingFile.file[0]} onClick={() => this.openDocumentUrlInModal("https://objective.portbris.com.au/#/documents/" + supportingFile.file[0] + "/details")}></span></td><td>{supportingFile.FileStatus[0]}</td><td>{supportingFile.FileComment[0]}</td></tr>;
                        }
                    })}
                </tbody>
            </table>
        </td>
    </tr>;
}

/**
 * SelectionPanel component props
 *
 * @export
 * @interface ISelectionPanelProps
 */
export interface ISelectionPanelProps {
    locale?: string;
    selection: SelectedFeatureSet;
    onRequestZoomToFeature: (feat: SelectedFeature) => void;
    onShowSelectedFeature: (layerId: string, featureIndex: number) => void;
    maxHeight?: number;
    selectedFeatureRenderer?: (props: ISelectedFeatureProps) => JSX.Element;
    /**
     * Controls whether HTML values are allowed be rendered in property values
     * 
     * @since 0.11
     * @type {boolean}
     * @memberof ISelectionPanelProps
     */
    allowHtmlValues: boolean;
    /**
     * If allowHtmlValues = true, defines a custom function for sanitizing the given HTML string
     * to guard against cross-site scripting attacks. You are strongly recommended to provide
     * a santitization function if your HTML property values come from an un-trusted source
     * 
     * @since 0.11
     * @memberof ISelectionPanelProps
     */
    cleanHTML?: (html: string) => string;
    onSupportingFileClick?: (selectedURL: string) =>void;
    
}

interface ISelectionPanel {
    locale: string;
    canGoPrev(): boolean;
    canGoNext(): boolean;
    prevFeature(): void;
    nextFeature(): void;
    canZoomSelectedFeature(): boolean;
    zoomSelectedFeature(): void;
}

function buildToolbarItems(selPanel: ISelectionPanel): IItem[] {
    return [
        {
            iconClass: SPRITE_CONTROL_180,
            tooltip: xlate("SELECTION_PREV_FEATURE", selPanel.locale),
            enabled: () => selPanel.canGoPrev(),
            invoke: () => selPanel.prevFeature()
        },
        {
            iconClass: SPRITE_CONTROL,
            tooltip: xlate("SELECTION_NEXT_FEATURE", selPanel.locale),
            enabled: () => selPanel.canGoNext(),
            invoke: () => selPanel.nextFeature()
        },
        { isSeparator: true },
        {
            iconClass: SPRITE_ICON_ZOOMSELECT,
            tooltip: xlate("SELECTION_ZOOMTO_FEATURE", selPanel.locale),
            enabled: () => selPanel.canZoomSelectedFeature(),
            invoke: () => selPanel.zoomSelectedFeature()
        }
    ];
}

const SELECTION_TOOLBAR_STYLE: React.CSSProperties = { float: "right", height: DEFAULT_TOOLBAR_SIZE };
const SELECTION_PANEL_TOOLBAR_STYLE: React.CSSProperties = { height: DEFAULT_TOOLBAR_SIZE, backgroundColor: TOOLBAR_BACKGROUND_COLOR };
const LAYER_COMBO_STYLE: React.CSSProperties = { float: "left", height: DEFAULT_TOOLBAR_SIZE };
const FloatClear = () => <div style={{ clear: "both" }} />;

/**
 * Displays attributes of selected features with the ability to zoom in on selected features
 *
 * @export
 * @class SelectionPanel
 * @extends {React.Component<ISelectionPanelProps, any>}
 */
export class SelectionPanel extends React.Component<ISelectionPanelProps, any> {
    private selectionToolbarItems: IItem[];
    constructor(props: ISelectionPanelProps) {
        super(props);
        this.state = {
            selectedLayerIndex: -1,
            featureIndex: -1
        };
        this.selectionToolbarItems = buildToolbarItems({
            locale: props.locale || DEFAULT_LOCALE,
            canGoPrev: this.canGoPrev.bind(this),
            canGoNext: this.canGoNext.bind(this),
            prevFeature: this.prevFeature.bind(this),
            nextFeature: this.nextFeature.bind(this),
            canZoomSelectedFeature: this.canZoomSelectedFeature.bind(this),
            zoomSelectedFeature: this.zoomSelectedFeature.bind(this)
        });
    }
    private getCurrentLayer() {
        if (this.props.selection == null)
            return null;
        return this.props.selection.SelectedLayer[this.state.selectedLayerIndex];
    }
    private getCurrentFeature() {
        const layer = this.getCurrentLayer();
        if (layer != null) {
            return layer.Feature[this.state.featureIndex];
        }
        return null;
    }
    private canGoPrev(): boolean {
        return this.state.featureIndex > 0;
    }
    private canGoNext(): boolean {
        const layer = this.getCurrentLayer();
        if (layer != null) {
            return this.state.featureIndex + 1 < layer.Feature.length;
        }
        return false;
    }
    private canZoomSelectedFeature(): boolean {
        const feat = this.getCurrentFeature();
        return feat != null && feat.Bounds != null;
    }
    private prevFeature() {
        const newIndex = this.state.featureIndex - 1;
        this.setState({ featureIndex: newIndex });
        const layer = this.getCurrentLayer();
        if (layer) {
            const layerId = layer["@id"];
            safePropAccess(this.props, "onShowSelectedFeature", func => func(layerId, newIndex));
        }
    }
    private nextFeature() {
        const newIndex = this.state.featureIndex + 1;
        this.setState({ featureIndex: newIndex });
        const layer = this.getCurrentLayer();
        if (layer) {
            const layerId = layer["@id"];
            safePropAccess(this.props, "onShowSelectedFeature", func => func(layerId, newIndex));
        }
    }
    private zoomSelectedFeature() {
        const feat = this.getCurrentFeature();
        if (feat) {
            this.props.onRequestZoomToFeature(feat);
        }
    }
    private setDefaultSelection(props: ISelectionPanelProps) {
        const { selection } = props;
        if (selection != null) {
            if ((selection.SelectedLayer || []).length > 0) {
                this.setState({ selectedLayerIndex: 0, featureIndex: 0 });
            }
        }
    }
    componentDidMount() {
        this.setDefaultSelection(this.props);
    }
    componentDidUpdate(prevProps: ISelectionPanelProps) {
        const nextProps = this.props;
        if (prevProps.selection != nextProps.selection) {
            this.setDefaultSelection(nextProps);
        }
    }
    private onSelectedLayerChanged = (e: GenericEvent) => {
        this.setState({ selectedLayerIndex: e.target.value, featureIndex: 0 });
    }

    // private onSupportingFileClick = (e:GenericEvent)=>{
    //    alert(e)
    // }


    render(): JSX.Element {
        const { selection, selectedFeatureRenderer, allowHtmlValues, cleanHTML, onSupportingFileClick } = this.props;
        let locale = this.props.locale || DEFAULT_LOCALE;
        let feat: SelectedFeature | undefined;
        let meta: LayerMetadata | undefined;
        if (selection != null && this.state.selectedLayerIndex >= 0 && this.state.featureIndex >= 0) {
            const selLayer = selection.SelectedLayer[this.state.selectedLayerIndex];
            feat = selLayer.Feature[this.state.featureIndex];
            meta = selLayer.LayerMetadata;
        }
        let selBodyStyle: React.CSSProperties | undefined;
        if (this.props.maxHeight) {
            selBodyStyle = {
                overflowY: "auto",
                maxHeight: this.props.maxHeight - DEFAULT_TOOLBAR_SIZE
            };
        } else {
            selBodyStyle = {
                overflow: "auto",
                position: "absolute",
                top: DEFAULT_TOOLBAR_SIZE,
                bottom: 0,
                right: 0,
                left: 0
            }
        }
        return <div>
            {(() => {
                if (selection != null && selection.SelectedLayer != null && selection.SelectedLayer.length > 0) {
                    return <div className="selection-panel-toolbar" style={SELECTION_PANEL_TOOLBAR_STYLE}>
                        <div className="pt-select selection-panel-layer-selector">
                            <select value={this.state.selectedLayerIndex} style={LAYER_COMBO_STYLE} onChange={this.onSelectedLayerChanged}>
                                {selection.SelectedLayer.map((layer: SelectedLayer, index: number) => {
                                    return <option key={`selected-layer-${layer["@id"]}`} value={`${index}`}>{layer["@name"]}</option>
                                })}
                            </select>
                        </div>
                        <Toolbar childItems={this.selectionToolbarItems} containerStyle={SELECTION_TOOLBAR_STYLE} />
                        <FloatClear />
                    </div>;
                }
            })()}
            <div className="selection-panel-body" style={selBodyStyle}>
                {(() => {
                    if (feat && meta) {
                        if (selectedFeatureRenderer) {
                            if(this.onSelectedLayerChanged !== undefined){
                                return selectedFeatureRenderer({ selectedFeature: feat, cleanHTML: cleanHTML, allowHtmlValues: allowHtmlValues, selectedLayer: meta, locale: locale, onSupportingFileClick: onSupportingFileClick  });
                            }
                        } else {
                            return <DefaultSelectedFeature selectedFeature={feat} cleanHTML={cleanHTML} allowHtmlValues={allowHtmlValues} selectedLayer={meta} locale={locale} onSupportingFileClick={onSupportingFileClick}  />;
                        }
                    } else if (selection == null || (selection.SelectedLayer || []).length == 0) {
                        return <div className="pt-callout pt-intent-primary pt-icon-info-sign">
                            <p className="selection-panel-no-selection">{xlate("NO_SELECTED_FEATURES", locale)}</p>
                        </div>;
                    }
                })()}
            </div>
        </div>;
    }
}