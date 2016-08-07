import * as React from "react";
import { isMenu } from "../utils/type-guards";
import FlyoutWrapper from "@aneves/react-flyout";
import * as uuid from "node-uuid";

export const TOOLBAR_BACKGROUND_COLOR = "#f0f0f0";
export const DEFAULT_TOOLBAR_HEIGHT = 29;
const TOOLBAR_STYLE = {
    backgroundColor: TOOLBAR_BACKGROUND_COLOR,
    border: "1px solid rgb(240, 240, 240)"
};
const TOOLBAR_ITEM_STYLE = {
    display: "inline-block",
    border: `1px solid ${TOOLBAR_BACKGROUND_COLOR}`
};
const TOOLBAR_ITEM_STYLE_HOVERED = {
    display: "inline-block",
    border: "1px solid rgb(153, 181, 202)"
};

function getIcon(relPath: string): string {
    return `stdicons/${relPath}`;
}

function getIconStyle(enabled: boolean, height: number): React.CSSProperties {
    const imgStyle: React.CSSProperties = {
        verticalAlign: "middle",
        lineHeight: height 
    };
    if (!enabled) {
        imgStyle.opacity = 0.4;
    }
    return imgStyle;
}

function getItemStyle(enabled: boolean, selected: boolean, height: number, isMouseOver: boolean): React.CSSProperties {
    const pad = ((height - 16) / 2);
    const vertPad = 6;
    const style: React.CSSProperties = {
        display: "inline-block",
        //height: height,
        paddingLeft: pad,
        paddingRight: pad,
        paddingTop: vertPad,
        paddingBottom: vertPad
    };
    if (enabled && (isMouseOver === true || selected)) {
        style.cursor = "pointer";
        style.border = "1px solid rgb(153, 181, 202)";
        style.paddingLeft = pad - 1; //To compensate for border
        style.paddingRight = pad - 1; //To compensate for border
        style.paddingTop = vertPad - 1; //To compensate for border
        style.paddingBottom = vertPad - 1; //To compensate for border
    }
    return style;
}

function getToolbarSeparatorItemStyle(height: number): React.CSSProperties {
    const vertPad = 6;
    const style: React.CSSProperties = {
        display: "inline-block",
        borderLeft: "1px solid black",
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 2,
        marginRight: -2
    };
    return style;
}

function getMenuItemStyle(enabled: boolean, selected: boolean, height: number, isMouseOver: boolean): React.CSSProperties {
    const pad = ((height - 16) / 2);
    const vertPad = 6;
    const style: React.CSSProperties = {
        //height: height,
        paddingLeft: pad,
        paddingRight: pad,
        paddingTop: vertPad,
        paddingBottom: vertPad
    };
    if (enabled && (isMouseOver === true || selected)) {
        style.cursor = "pointer";
        style.border = "1px solid rgb(153, 181, 202)";
        style.paddingLeft = pad - 1; //To compensate for border
        style.paddingRight = pad - 1; //To compensate for border
        style.paddingTop = vertPad - 1; //To compensate for border
        style.paddingBottom = vertPad - 1; //To compensate for border
    }
    return style;
}

interface IFlyoutMenuChildItemProps {
    item: IItem|IMenu;
    onInvoked?: () => void;
}

class FlyoutMenuChildItem extends React.Component<any, any> {
    private fnMouseLeave: (e) => void;
    private fnMouseEnter: (e) => void;
    private fnClick: (e) => void;
    constructor(props) {
        super(props);
        this.fnClick = this.onClick.bind(this);
        this.fnMouseEnter = this.onMouseEnter.bind(this);
        this.fnMouseLeave = this.onMouseLeave.bind(this);
        this.state = {
            isMouseOver: false
        };
    }
    private onClick(e) {
        const { item, onInvoked } = this.props;
        item.invoke();
        if (onInvoked != null) {
            onInvoked();
        }
    }
    private onMouseLeave(e) {
        this.setState({ isMouseOver: false });
    }
    private onMouseEnter(e) {
        this.setState({ isMouseOver: true });
    }
    render(): JSX.Element {
        const { item } = this.props;
        const height = DEFAULT_TOOLBAR_HEIGHT;
        const selected = item.selected != null ? item.selected() : false;
        const enabled = item.enabled != null ? item.enabled() : true;
        const imgStyle = getIconStyle(enabled, height);
        const style = getMenuItemStyle(enabled, selected, height, this.state.isMouseOver);
        return <li className="noselect" title={item.tooltip} onMouseEnter={this.fnMouseEnter} onMouseLeave={this.fnMouseLeave} onClick={this.fnClick}>
            <div style={style}>
                <img style={imgStyle} src={getIcon(item.icon)} /> {item.label}
            </div>
        </li>;
    }
}

interface IFlyoutMenuItemProps {
    height: number;
    menu: IMenu;
}

class FlyoutMenuItem extends React.Component<IFlyoutMenuItemProps, any> {
    private fnMouseLeave: (e) => void;
    private fnMouseEnter: (e) => void;
    private fnClick: (e) => void;
    private fnChildInvoked: () => void;
    private flyoutId: string;
    constructor(props) {
        super(props);
        this.fnClick = this.onClick.bind(this);
        this.fnMouseEnter = this.onMouseEnter.bind(this);
        this.fnMouseLeave = this.onMouseLeave.bind(this);
        this.fnChildInvoked = this.onChildInvoked.bind(this);
        this.state = {
            isMouseOver: false,
            isFlownOut: false
        };
        this.flyoutId = uuid.v4();
    }
    private onClick(e) {
        e.preventDefault();
        this.setState({ isFlownOut: !this.state.isFlownOut });
        return false;
    }
    private onMouseLeave(e) {
        this.setState({ isMouseOver: false });
    }
    private onMouseEnter(e) {
        this.setState({ isMouseOver: true });
    }
    private onChildInvoked() {
        this.setState({ isFlownOut: false, isMouseOver: false });
    }
    render(): JSX.Element {
        const { height, menu } = this.props;
        const selected = menu.selected != null ? menu.selected() : false;
        const enabled = menu.enabled != null ? menu.enabled() : true;
        const imgStyle = getIconStyle(enabled, height);
        const style = getItemStyle(enabled, selected, height, this.state.isMouseOver);
        return <div className="has-flyout noselect" onMouseEnter={this.fnMouseEnter} onMouseLeave={this.fnMouseLeave} onClick={this.fnClick} style={style} title={menu.tooltip}>
            <div data-flyout-id={`flyout-${this.flyoutId}`}>
                <img style={imgStyle} src={getIcon(menu.icon || ((this.state.isFlownOut) ? "icon_menuarrowup.gif" : "icon_menuarrow.gif"))} /> {menu.label}
            </div>
            <FlyoutWrapper id={`flyout-${this.flyoutId}`} open={this.state.isFlownOut} options={{ type: "dropdown", align: menu.flyoutAlign }}>
                <ul className="mg-flyout-menu-content">
                {this.props.menu.childItems.map((item, index) => <FlyoutMenuChildItem key={index} item={item} onInvoked={this.fnChildInvoked} />)}
                </ul>
            </FlyoutWrapper>
        </div>;
    }
}

interface IToolbarSeparatorProps {
    height: number;
}

class ToolbarSeparator extends React.Component<IToolbarSeparatorProps, any> {
    constructor(props) {
        super(props);
    }
    render(): JSX.Element {
        const style = getToolbarSeparatorItemStyle(this.props.height);
        return <div className="noselect" style={style}>{'\u00a0'}</div>;
    }
}

interface IToolbarButtonProps {
    height: number;
    item: IItem;
}

class ToolbarButton extends React.Component<IToolbarButtonProps, any> {
    fnMouseLeave: (e) => void;
    fnMouseEnter: (e) => void;
    fnClick: (e) => void;
    constructor(props) {
        super(props);
        this.fnMouseEnter = this.onMouseEnter.bind(this);
        this.fnMouseLeave = this.onMouseLeave.bind(this);
        this.fnClick = this.onClick.bind(this);
        this.state = {
            isMouseOver: false
        };
    }
    onMouseLeave(e) {
        this.setState({ isMouseOver: false });
    }
    onMouseEnter(e) {
        this.setState({ isMouseOver: true });
    }
    onClick(e) {
        e.preventDefault();
        const { item } = this.props;
        const enabled = item.enabled != null ? item.enabled() : true;
        if (enabled) {
            item.invoke();
        }
        return false;
    }
    render(): JSX.Element {
        const { height, item } = this.props;
        const selected = item.selected != null ? item.selected() : false;
        const enabled = item.enabled != null ? item.enabled() : true;
        const imgStyle = getIconStyle(enabled, height);
        const style = getItemStyle(enabled, selected, height, this.state.isMouseOver);
        return <div className="noselect" onMouseEnter={this.fnMouseEnter} onMouseLeave={this.fnMouseLeave} style={style} title={item.tooltip} onClick={this.fnClick}>
            <img style={imgStyle} src={getIcon(item.icon)} />
        </div>;
    }
}

export interface IItem {
    label?: string;
    tooltip?: string;
    icon?: string;
    invoke?: () => void;
    enabled?: () => boolean;
    selected?: () => boolean;
    isSeparator?: boolean;
}

export interface IMenu extends IItem {
    childItems: IItem[];
    flyoutAlign?: string;
}

export interface IToolbarProps {
    childItems: IItem[];
    containerStyle?: React.CSSProperties;
}

export class Toolbar extends React.Component<IToolbarProps, any> {
    constructor(props) {
        super(props);
    }
    render(): JSX.Element {
        const { containerStyle, childItems } = this.props;
        const height = containerStyle != null 
            ? (containerStyle.height || DEFAULT_TOOLBAR_HEIGHT)
            : DEFAULT_TOOLBAR_HEIGHT; 
        return <div style={containerStyle} className="noselect">
            {childItems.map((item, index) => {
                if (isMenu(item)) {
                    return <FlyoutMenuItem key={index} height={height} menu={item} />;
                } else if (item.isSeparator === true) {
                    return <ToolbarSeparator key={index} height={height} />;
                } else {
                    return <ToolbarButton key={index} height={height} item={item} />;
                }
            })}
        </div>;
    }
}