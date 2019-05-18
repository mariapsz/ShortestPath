import React from "react";
import './summary.css';
import TraceSummary from './traceSummary.js';
class Summary extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return <div className='summaryContainer'>
            <div>
                <div className='labelWrapper'>
                    <h2>
                        Program wyznaczający najkrótszą drogę pomiędzy wybranymi miejsowościami
                    </h2>
                </div>
                <div className='endpointsWrapper'>
                    <div className='endpoint'>
                        <label>Początek trasy:</label>
                        <div>{this.getStartPointName()}</div>
                    </div>
                    <div className='endpoint'>
                        <label>Koniec trasy:</label>
                        <div>{this.getTargetPointName()}</div>
                    </div>
                </div>
                <TraceSummary/>
            </div>

        </div>
    }

    getStartPointName = () => {
        console.log('this roads marker: ', this.props.roadsMarker);
        return this.props.roadsMarker ? this.props.roadsMarker.startPointMarker.options.title : '';
    };

    getTargetPointName = () => {
        return this.props.roadsMarker && this.props.roadsMarker.targetPointMarker ? this.props.roadsMarker.targetPointMarker.options.title : '';
    }
}

export default Summary;