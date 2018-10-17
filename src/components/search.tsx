import { FormGroup, InputGroup, ControlGroup, Button, Label, TextArea, Spinner, ButtonGroup } from '@blueprintjs/core';
import * as React from 'react';
import * as Common from '../api/contracts/pbpl/planregister';
import { GenericEvent } from '../api/common';

interface ISearchProps {
    plans: Common.Plan[];
    isLoading: boolean;
    selectedPlan: Common.Plan;
    onClickSearch?: (plan:Common.Plan) => void;
    onClickReset?: () => void;
    onClickPlanRow?: (plan:Common.Plan) => void;
}

interface ISearchState {
    activeSearchCriteria: Common.Plan|null;
}

export class Search extends React.Component<ISearchProps, ISearchState>{
    
    constructor(props: ISearchProps) {
        super(props);

        this.state = {
            activeSearchCriteria: {}
        }
    }
    componentDidMount(){

    }

    componentWillReceiveProps(nextProps:ISearchProps){
        
    }

    componentDidUpdate(prevProps:ISearchProps, pervState:ISearchState){
        if(this.state.activeSearchCriteria != pervState.activeSearchCriteria)
            this.setState({activeSearchCriteria:this.state.activeSearchCriteria});
        else if(this.props.selectedPlan != prevProps.selectedPlan){
            this.setState({activeSearchCriteria:this.props.selectedPlan});
        }
    }

    componentWillUpdate(){
        
    }

    private onClickSearch = (e: GenericEvent) => {
        e.preventDefault()
        if (this.props.onClickSearch && this.state.activeSearchCriteria) {
            this.props.onClickSearch(this.state.activeSearchCriteria);
        }
    }

    private onSearchParamsChange = (e:React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()
        let existingSearch:Common.Plan | null = this.state.activeSearchCriteria;
        if (existingSearch == null){
            existingSearch = {};
        }

        if("PlanNum" == e.currentTarget.name ||
         "Title" == e.currentTarget.name ||
         "DrawnbyName" == e.currentTarget.name ||
         "LocalityName" == e.currentTarget.name ||
         "Comments" == e.currentTarget.name ||
         "Client" == e.currentTarget.name ||
         "FileRef" == e.currentTarget.name ||
         "DataSource" == e.currentTarget.name ||
         "facility_name" == e.currentTarget.name ||
         "taskid" == e.currentTarget.name ){
            existingSearch[e.currentTarget.name] = e.currentTarget.value;
            this.setState({activeSearchCriteria:existingSearch});
        }
    }

    private onClickReset = (e: GenericEvent) => {
        e.preventDefault();
        this.setState({activeSearchCriteria:null});
        
        
    }

    private onClickRowSelectPlan = (e: Common.Plan)=>{
        if(this.props.onClickPlanRow)
            this.props.onClickPlanRow(e);
    }

    render(): JSX.Element {
        let searchContainer: React.CSSProperties ={position: "absolute", 
            flexDirection: "column", 
            display: "flex",
            left:"0px",
            right:"0px",
            top:"0px",
            bottom:"0px"};


        let searchCSS: React.CSSProperties = {};
        searchCSS.paddingLeft = "4px";
        searchCSS.paddingRight = "4px";
        searchCSS.paddingTop = "2px";

        let searchInput: React.CSSProperties = {};
        searchInput.marginTop = "2px";
        searchInput.marginBottom = "2px";

        let searchBtn: React.CSSProperties = searchInput;
        //searchBtn.marginLeft ="2px";
        //searchBtn.marginRight ="2px";

        let textArea: React.CSSProperties = searchInput;
        textArea.resize = "none";
        
        return <div style={searchContainer} >
            <div style={searchCSS}>
            <form>
                <input onChange={this.onSearchParamsChange} name="PlanNum" className="pt-input pt-fill" style={searchInput} type="text" placeholder="Plan No ..." dir="auto" value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.PlanNum)} />
                <input onChange={this.onSearchParamsChange} name="Title" className="pt-input pt-fill" style={searchInput} type="text" placeholder="Title ..." dir="auto" value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.Title)} />
                
                <ControlGroup fill={true} vertical={false}>
                    <InputGroup onChange={this.onSearchParamsChange} name="facility_name" style={searchInput} placeholder="Facility ..." value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.facility_name)} />
                    <InputGroup onChange={this.onSearchParamsChange} name="DataSource" style={searchInput} placeholder="DataSource ..." value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.DataSource)}/>
                </ControlGroup>
                <ControlGroup fill={true} vertical={false}>
                    <InputGroup onChange={this.onSearchParamsChange} name="DataSource" style={searchInput} placeholder="File Ref ..." value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.FileRef)} />
                    <InputGroup onChange={this.onSearchParamsChange} name="DataSource" style={searchInput} placeholder="Task ID ..."  value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.taskid)}/>
                </ControlGroup>
                <ControlGroup fill={true} vertical={false}>
                    <InputGroup onChange={this.onSearchParamsChange} name="DataSource" style={searchInput} placeholder="Locality Name ..."  value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.LocalityName)}/>
                    <InputGroup onChange={this.onSearchParamsChange} name="DataSource" style={searchInput} placeholder="Locality Number ..."  value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.LocalityNumber)}/>
                </ControlGroup>
                <TextArea onChange={this.onSearchParamsChange} name="DataSource" fill={true} style={textArea} rows={2} placeholder="Comments ..."  value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.Comments)}/>
                <ControlGroup fill={true} vertical={false}>
                    <InputGroup onChange={this.onSearchParamsChange} name="DataSource" style={searchInput} placeholder="Client ..."  value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.Client)}/>
                    <InputGroup onChange={this.onSearchParamsChange} name="DataSource" style={searchInput} placeholder="Drawn By ..."  value={(this.state.activeSearchCriteria == null ? "" : this.state.activeSearchCriteria.DrawnbyName)}/>
                </ControlGroup>
                <ButtonGroup fill={true} vertical={false}>
                    <Button text="Reset" style={searchBtn} onClick={this.onClickReset}/> <Button text="Search" type={"submit"} style={searchBtn} onClick={this.onClickSearch} />
                </ButtonGroup>
                </form>

            </div>
            <div style={{overflow:"auto"}}>
                <table className="pt-table pt-interactive pt-condensed pt-striped" style={{width:'100%'}}>
                    <thead>
                        <tr>
                            <th>Plan No.</th>
                            <th>Title</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(()=>{
                            if(this.props.isLoading){
                                return <tr><td colSpan={2} style={{overflow:"hidden", textAlign:"center", backgroundColor:"transparent"}}><Spinner className="pt-large pt-fill" /><br/>Loading ...</td></tr>
                            }else{
                                
                                return this.props.plans.map(p => {
                                    const onClickRowSelectPlan = () => {this.onClickRowSelectPlan(p);};
                                    return <tr key={p.planid} onClick={onClickRowSelectPlan}><td>{p.PlanNum}</td><td>{p.Title}</td></tr>
                                }
                                )
                            }
                        })()}
                            
                            
                    </tbody>
                </table>
            </div>
        </div>;
    }
}