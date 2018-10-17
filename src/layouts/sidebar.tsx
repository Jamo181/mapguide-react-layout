import * as React from "react";
import { PlaceholderComponent, DefaultComponentNames } from "../api/registry/component";
import ToolbarContainer from "../containers/toolbar";
import ViewerApiShim from "../containers/viewer-shim";
import ModalLauncher from "../containers/modal-launcher";
import FlyoutRegionContainer from "../containers/flyout-region";
import { connect } from "react-redux";
import { tr } from "../api/i18n";
import * as Constants from "../constants";
import {
    GenericEvent,
    IApplicationState,
    IViewerReducerState,
    IConfigurationReducerState,
    IViewerCapabilities,
    ITemplateReducerState
} from "../api/common";
import InitWarningDisplay from "../containers/init-warning-display";
import { ActionType } from '../constants/actions';
import { SidebarTab, Sidebar } from '../containers/sidebar'


export interface ISidebarLayoutState {
    viewer: IViewerReducerState;
    config: IConfigurationReducerState;
    capabilities: IViewerCapabilities;
    templateState: ITemplateReducerState;
    lastaction: any;
}

function mapStateToProps(state: Readonly<IApplicationState>): Partial<ISidebarLayoutState> {
    return {
        viewer: state.viewer,
        config: state.config,
        capabilities: state.config.capabilities,
        lastaction: state.lastaction,
        templateState: state.template
    };
}

function mapDispatchToProps() {
    return {

    };
}

export type SidebarLayoutProps = Partial<ISidebarLayoutState>;

export interface SidebarLayoutState {
    collapsed: boolean;
    activeTab: SidebarTab;
    collapsed2: boolean;
    activeTab2: SidebarTab;
}

export class SidebarLayout extends React.Component<SidebarLayoutProps, Partial<SidebarLayoutState>> {
    constructor(props: SidebarLayoutProps) {
        super(props);
        const { templateState } = props;
        let collapsed = false;
        let activeTab: SidebarTab = "tasks";
        let collapsed2 = false;
        let activeTab2: SidebarTab = "search";
        if (templateState) {
            collapsed = !(templateState.legendVisible || templateState.selectionPanelVisible || templateState.taskPaneVisible);
            if (templateState.legendVisible) {
                activeTab = "legend";
            } else if (templateState.selectionPanelVisible) {
                activeTab = "selection";
            }
        }
        this.state = {
            collapsed: collapsed,
            activeTab: activeTab,
            collapsed2: collapsed2,
            activeTab2: activeTab2
        };
    }
    private onCollapse = () => {
        this.setState({
            collapsed: true
        });
    }
    private onExpand = () => {
        this.setState({
            collapsed: false
        });
    }
    private onActivateTab = (tab: SidebarTab, collapsed?: boolean) => {
        if (typeof(collapsed) != 'undefined') {
            this.setState({
                activeTab: tab,
                collapsed: collapsed
            });
        } else {
            this.setState({
                activeTab: tab
            });
        }
    }
    private onCollapse2 = () => {
        this.setState({
            collapsed2: true
        });
    }
    private onExpand2 = () => {
        this.setState({
            collapsed2: false
        });
    }
    private onActivateTab2 = (tab: SidebarTab, collapsed?: boolean) => {
        if (typeof(collapsed) != 'undefined') {
            this.setState({
                activeTab2: tab,
                collapsed2: collapsed
            });
        } else {
            this.setState({
                activeTab2: tab
            });
        }
    }
    render(): JSX.Element {
        const { collapsed, activeTab, collapsed2, activeTab2 } = this.state;
        const { viewer, capabilities, config } = this.props;
        if (!viewer || !capabilities || !config) {
            return <div />;
        }
        const {
            hasTaskPane,
            hasStatusBar,
            hasNavigator,
            hasSelectionPanel,
            hasLegend,
            hasViewSize,
            hasToolbar
        } = capabilities;

        return <div style={{ width: "100%", height: "100%" }}>
            <Sidebar position="left"
                     busy={viewer.busyCount > 0}
                     legend={hasLegend}
                     selection={hasSelectionPanel}
                     taskpane={hasTaskPane}
                     locale={config.locale}
                     collapsed={collapsed || false}
                     activeTab={activeTab || "tasks"}
                     onCollapse={this.onCollapse}
                     onActivateTab={this.onActivateTab}
                     onExpand={this.onExpand}
                     lastAction={this.props.lastaction} />
            {(() => {
                if (hasToolbar) {
                    let top = 180;
                    if (!hasSelectionPanel) {
                        top -= 40;
                    }
                    if (!hasLegend) {
                        top -= 40;
                    }
                    if (!hasTaskPane) {
                        top -= 40;
                    }
                    return <div id="toolbar-region" style={{ top: top }}>
                        <ToolbarContainer id={Constants.WEBLAYOUT_TOOLBAR} containerClass="sidebar-toolbar" vertical={true} hideVerticalLabels={true} containerStyle={{ position: "absolute", left: 4, right: 6, zIndex: 100 }} />
                    </div>;
                }
            })()}
            {(() => {
                if (hasNavigator) {
                    return <PlaceholderComponent id={DefaultComponentNames.Navigator} locale={config.locale} />;
                }
            })()}
            {(() => {
                if (hasStatusBar) {
                    return <PlaceholderComponent id={DefaultComponentNames.MouseCoordinates} locale={config.locale} />;
                }
            })()}
            {(() => {
                if (hasStatusBar) {
                    return <PlaceholderComponent id={DefaultComponentNames.ScaleDisplay} locale={config.locale} />;
                }
            })()}
            {(() => {
                if (hasViewSize) {
                    return <PlaceholderComponent id={DefaultComponentNames.ViewSize} locale={config.locale} />;
                }
            })()}
            {(() => {
                if (hasStatusBar) {
                    return <PlaceholderComponent id={DefaultComponentNames.SelectedFeatureCount} locale={config.locale} />;
                }
            })()}
            <Sidebar position="right"
                     busy={viewer.busyCount > 0}
                     legend={false}
                     selection={false}
                     taskpane={false}
                     locale={config.locale}
                     collapsed={collapsed2 || false}
                     activeTab={activeTab2 || "tasks"}
                     onCollapse={this.onCollapse2}
                     onActivateTab={this.onActivateTab2}
                     onExpand={this.onExpand2}
                     lastAction={this.props.lastaction}
                     search={true} 
                     preview={true} />
            <PlaceholderComponent id={DefaultComponentNames.Map} locale={config.locale} />
            <ViewerApiShim />
            <ModalLauncher />
            <FlyoutRegionContainer />
            <InitWarningDisplay />
            <PlaceholderComponent id={DefaultComponentNames.PoweredByMapGuide} locale={config.locale} />
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps as any /* HACK: I dunno how to type thunked actions for 4.0 */)(SidebarLayout);