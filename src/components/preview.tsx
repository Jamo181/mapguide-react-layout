import * as React from 'react';
import * as Common from '../api/contracts/pbpl/planregister';

interface IPBPLPreviewProps {
    file?: Common.Plan;
    selectedUrl: string;
    isLoading?: boolean;
}


export class Preview extends React.Component<IPBPLPreviewProps>{
    constructor(props:IPBPLPreviewProps){
        super(props);
    }

    render(){
        let containerStyle: React.CSSProperties ={position: "absolute", 
        height: "100%",
        width: "100%",
        border: "none"};

        return <iframe src={this.props.selectedUrl} style={containerStyle} />
    }
    
}