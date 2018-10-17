import * as React from 'react';
import { connect } from "react-redux";
import { showURL } from "../actions/pbpl";
import { IApplicationState, ReduxDispatch, IPBPLReducerState } from "../api/common";
import { Preview } from '../components/preview';
import { stat } from 'fs-extra';
import { Plan } from '../api/contracts/pbpl/planregister';

export interface IPBPLPreviewContainerStateConnected{
    pbpl: IPBPLReducerState;
    selectedURL:string;
}

export interface IPBPLPreviewContainerDispatch {
    showURL: (selectedUrl:string) => void;
}

function mapStateToProps(state: Readonly<IApplicationState>): Partial<IPBPLPreviewContainerStateConnected> {
    return {
        pbpl:state.pbpl,
        selectedURL:state.pbpl.selectedURL,
        
    };
}


function mapDispatchToProps(dispatch: ReduxDispatch): Partial<IPBPLPreviewContainerDispatch> {
    return {
        showURL: (selectedUrl:string) => dispatch(showURL(selectedUrl))
    };
}

export type PBPLPreviewContainerProps = Partial<IPBPLPreviewContainerStateConnected> & Partial<IPBPLPreviewContainerDispatch>;

export class PreviewContainer extends React.Component<PBPLPreviewContainerProps>{
    constructor(props: any) {
        super(props);
    }

    componentDidMount(){
        
    }

    private onShowURL = (selectedURL:string) => {
        const { showURL } = this.props;
        if (showURL) {
            showURL(selectedURL);
        }
    }
    

    public render(): JSX.Element {
        return (<Preview selectedUrl={(this.props.selectedURL=== undefined ? "": this.props.selectedURL)} />)
    }
}
export default connect(mapStateToProps, mapDispatchToProps as any /* HACK: I dunno how to type thunked actions for 4.0 */)(PreviewContainer);