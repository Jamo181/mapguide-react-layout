import * as React from 'react';
import { connect } from "react-redux";
import { PBPLDBRequestBuilder } from '../api/builders/pbpl/planRegister';
import * as Common from '../api/contracts/pbpl/planregister';
import * as PBPLActions from "../actions/pbpl";
import {Search} from '../components/search';
import {
    ICommand,
    ReduxDispatch,
    IPBPLReducerState,
    IApplicationState
} from "../api/common";

export interface IPBPLSearchProps {
    locale: string;
    maxHeight?: number;
}

interface IPBPLSearchState {
    
    plans: Common.Plan[];
    selectedPlan: Common.Plan;
    
    isUpdating: boolean;
}

interface IPBPLSearchStateConnected{
    pbpl: IPBPLReducerState;
    selectedURL: string;

}

function mapStateToProps(state: Readonly<IApplicationState>): Partial<IPBPLSearchStateConnected> {
    return {
        pbpl:state.pbpl,
        selectedURL:state.pbpl.selectedURL,
    };
}

export interface IPBPLSearchContainerDispatch {
    showURL: (selectedURL: string) => void;
}

function mapDispatchToProps(dispatch: ReduxDispatch): Partial<IPBPLSearchContainerDispatch> {
    return {
        showURL: (selectedURL) => dispatch(PBPLActions.showURL(selectedURL)),
    };
}

export type PBPLSearchProps = IPBPLSearchProps & Partial<IPBPLSearchStateConnected> & Partial<IPBPLSearchContainerDispatch>;

export class SearchContainer extends React.Component<PBPLSearchProps, IPBPLSearchState>{
    constructor(props: PBPLSearchProps) {
        super(props);
        
         this.state = {
            plans: [],
            isUpdating: false,
            selectedPlan: {},
        };
        
    }

    private setSelectedPlan = (selectedPlan:Common.Plan) =>{
        const { showURL } = this.props;
        
        if (showURL) {
            showURL("http://gisdata/Spatial_Data/PDFS/" + selectedPlan.PlanNum +".pdf");
        }
        this.setState({selectedPlan:selectedPlan});
    }

    private clearSearch = () =>{
        this.setState({selectedPlan:{}});
    }

    private testThing() {
        
    }

    private searchPlans = (planSearch:Common.Plan) => {
        const planDBSearch:PBPLDBRequestBuilder = new PBPLDBRequestBuilder("http://vmgis01:8008/mapguide/pob/app_mex_test/php/query_planregister.php");
        this.setState({plans:[], isUpdating:true});
        planDBSearch.getPlans(planSearch).then((foundPlans:Common.Plan[])=> this.setState({plans: foundPlans, isUpdating:false}));
    }

    public render(): JSX.Element {
        return <div>
            {/* <button onClick={this.testClickHandler}>Test</button> */}
            <Search plans={this.state.plans} onClickReset={this.clearSearch} isLoading={this.state.isUpdating} onClickSearch={this.searchPlans} selectedPlan={this.state.selectedPlan} onClickPlanRow={this.setSelectedPlan} />
        </div>
    
    }
}
export default connect(mapStateToProps, mapDispatchToProps as any /* HACK: I dunno how to type thunked actions for 4.0 */)(SearchContainer);