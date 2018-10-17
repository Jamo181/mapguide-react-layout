import * as React from "react";
import { GenericEvent } from "../api/common";
import { tr } from "../api/i18n";
import { DefaultComponentNames, PlaceholderComponent } from "../api/registry/component";
import { ActionType } from '../constants/actions';
import  SearchContainer  from "../containers/search";
import  PreviewContainer from './preview';

const SIDEBAR_WIDTH = 250;

const SidebarHeader = (props: any) => {
    const sbHeaderStyle: React.CSSProperties = {
        position: "absolute",
        top: 0,
        right: 0,
        height: 40,
        left: 0,
        margin: 0
    };
    sbHeaderStyle.paddingLeft = 10;
    return <h1 style={sbHeaderStyle} className="sidebar-header">
        {props.text}
        <span className="sidebar-close" onClick={props.onCloseClick}><i className="icon-left-open"></i></span>
    </h1>;
};

export type SidebarTab = "legend" | "tasks" | "selection" | "search" | "preview";

interface ISidebarProps {
    taskpane: boolean;
    legend: boolean;
    selection: boolean;
    busy: boolean;
    locale: string;
    position: "left" | "right";
    collapsed: boolean;
    activeTab: string;
    onExpand: () => void;
    onCollapse: () => void;
    onActivateTab: (tab: SidebarTab, collapsed?: boolean) => void;
    lastAction?: any;
    search?: boolean;
    preview?: boolean;
}

export class Sidebar extends React.Component<ISidebarProps, {}> {
    constructor(props: ISidebarProps) {
        super(props);
    }
    componentDidUpdate(prevProps: ISidebarProps) {
        const nextProps = this.props;
        const lastAction = nextProps.lastAction;
        if (lastAction != prevProps.lastAction) {
            switch (lastAction.type) {
                case ActionType.TASK_INVOKE_URL:
                    {
                        if(prevProps.taskpane){
                            nextProps.onActivateTab("tasks", false);
                        }
                    }
                    break;
                case ActionType.MAP_SET_SELECTION:
                    {
                        if(prevProps.selection){
                            nextProps.onActivateTab("selection", false);
                        }
                    }
                    break;
                case ActionType.PBPL_SHOW_URL:
                    {
                        if(prevProps.preview){
                            nextProps.onActivateTab("preview", false);
                        }
                        break;
                    }
            }
        }
    }
    private onActivateTasks = (e: GenericEvent) => {
        const { onActivateTab } = this.props;
        e.preventDefault();
        onActivateTab("tasks");
        return false;
    }
    private onActivateLegend = (e: GenericEvent) => {
        const { onActivateTab } = this.props;
        e.preventDefault();
        onActivateTab("legend");
        return false;
    }
    private onActivateSelection = (e: GenericEvent) => {
        const { onActivateTab } = this.props;
        e.preventDefault();
        onActivateTab("selection");
        return false;
    }
    private onActivateSearch = (e: GenericEvent) => {
        const { onActivateTab } = this.props;
        e.preventDefault();
        onActivateTab("search");
        return false;
    }
    private onActivatePreview = (e: GenericEvent) => {
        const { onActivateTab } = this.props;
        e.preventDefault();
        onActivateTab("preview");
        return false;
    }
    private onClickCollapse = (e: GenericEvent) => {
        const { onCollapse } = this.props;
        e.preventDefault();
        onCollapse();
        return false;
    }
    private onClickExpand = (e: GenericEvent) => {
        const { onExpand } = this.props;
        e.preventDefault();
        onExpand();
        return false;
    }
    render(): JSX.Element {
        const { position, busy, collapsed, activeTab } = this.props;
        return <div className={`sidebar ${collapsed ? "collapsed" : ""} sidebar-${position}`}>
            <div className="sidebar-tabs">
                <ul role="tablist">
                    <li>
                        {(() => {
                            if (busy === true) {
                                return <a>
                                    <div className="pt-spinner pt-small pt-intent-warning">
                                        <div className="pt-spinner-svg-container">
                                            <svg viewBox="0 0 100 100">
                                                <path className="pt-spinner-track" d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"></path>
                                                <path className="pt-spinner-head" d="M 94.5 50 A 44.5 44.5 0 0 0 50 5.5"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </a>;
                            } else {
                                if (collapsed) {
                                    return <a onClick={this.onClickExpand}><span className="pt-icon-standard pt-icon-menu-open" /></a>;
                                } else {
                                    return <a onClick={this.onClickCollapse}><span className="pt-icon-standard pt-icon-menu-closed" /></a>;
                                }
                            }
                        })()}
                    </li>
                    {(() => {
                        if (this.props.taskpane) {
                            return <li className={collapsed == false && activeTab == "tasks" ? "active" : ""}>
                                <a onClick={this.onActivateTasks} title={tr("TPL_SIDEBAR_OPEN_TASKPANE", this.props.locale)} role="tab"><span className="pt-icon-standard pt-icon-application" /></a>
                            </li>;
                        }
                    })()}
                    {(() => {
                        if (this.props.legend) {
                            return <li className={collapsed == false && activeTab == "legend" ? "active" : ""}>
                                <a onClick={this.onActivateLegend} title={tr("TPL_SIDEBAR_OPEN_LEGEND", this.props.locale)} role="tab"><span className="pt-icon-standard pt-icon-layers" /></a>
                            </li>;
                        }
                    })()}
                    {(() => {
                        if (this.props.selection) {
                            return <li className={collapsed == false && activeTab == "selection" ? "active" : ""}>
                                <a onClick={this.onActivateSelection} title={tr("TPL_SIDEBAR_OPEN_SELECTION_PANEL", this.props.locale)} role="tab"><span className="pt-icon-standard pt-icon-th" /></a>
                            </li>;
                        }
                    })()}
                    {(() => {
                        if (this.props.search) {
                            return <li className={collapsed == false && activeTab == "search" ? "active" : ""}>
                                <a onClick={this.onActivateSearch} title="Search" role="tab"><span className="pt-icon-standard pt-icon-search" /></a>
                            </li>;
                        }
                    })()}
                    {(() => {
                        if (this.props.preview) {
                            return <li className={collapsed == false && activeTab == "preview" ? "active" : ""}>
                                <a onClick={this.onActivatePreview} title="Preview" role="tab"><span className="pt-icon-standard pt-icon-document" /></a>
                            </li>;
                        }
                    })()}
                    <li className="sidebar-separator"></li>
                </ul>
            </div>
            <div className="sidebar-content">
                {(() => {
                    if (this.props.taskpane) {
                        return <div className={`sidebar-pane ${activeTab == "tasks" ? "active" : ""}`}>
                            <SidebarHeader text={tr("TPL_TITLE_TASKPANE", this.props.locale)} onCloseClick={this.onClickCollapse} />
                            <div style={{ position: "absolute", top: 40, bottom: 0, right: 0, left: 0 }}>
                                <PlaceholderComponent id={DefaultComponentNames.TaskPane} locale={this.props.locale} />
                            </div>
                        </div>;
                    }
                })()}
                {(() => {
                    if (this.props.legend) {
                        return <div className={`sidebar-pane ${activeTab == "legend" ? "active" : ""}`}>
                            <SidebarHeader text={tr("TPL_TITLE_LEGEND", this.props.locale)} onCloseClick={this.onClickCollapse} />
                            <div style={{ position: "absolute", top: 40, bottom: 0, right: 0, left: 0, overflow: "auto" }}>
                                <PlaceholderComponent id={DefaultComponentNames.Legend} locale={this.props.locale} componentProps={{ inlineBaseLayerSwitcher: true }} />
                            </div>
                        </div>;
                    }
                })()}
                {(() => {
                    if (this.props.selection) {
                        return <div className={`sidebar-pane ${activeTab == "selection" ? "active" : ""}`}>
                            <SidebarHeader text={tr("TPL_TITLE_SELECTION_PANEL", this.props.locale)} onCloseClick={this.onClickCollapse} />
                            <div style={{ position: "absolute", top: 40, bottom: 0, right: 0, left: 0 }}>
                                <PlaceholderComponent id={DefaultComponentNames.SelectionPanel} locale={this.props.locale} />
                            </div>
                        </div>;
                    }
                })()}
                {(() => {
                    if (this.props.search) {
                        return <div className={`sidebar-pane ${activeTab == "search" ? "active" : ""}`}>
                            <SidebarHeader text="Search" onCloseClick={this.onClickCollapse} />
                            <div style={{ position: "absolute", top: 40, bottom: 0, right: 0, left: 0 }}>
                                <SearchContainer locale={this.props.locale} />
                            </div>
                        </div>;
                    }
                })()}
                {(() => {
                    if (this.props.preview) {
                        return <div className={`sidebar-pane ${activeTab == "preview" ? "active" : ""}`}>
                            <SidebarHeader text="Preview" onCloseClick={this.onClickCollapse} />
                            <div style={{ position: "absolute", top: 40, bottom: 0, right: 0, left: 0 }}>
                                <PreviewContainer />
                            </div>
                        </div>;
                    }
                })()}
            </div>
        </div>;
    }
}