import React from "react";
import './traceSummary.css';
import L from "leaflet";

class TraceSummary extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {
        return <div className='traceSummaryContainer'>
            {this.props.roadsMarker && this.props.roadsMarker.startPointMarker && this.props.roadsMarker.currentTrace ? this.getTraceInfo() : ''}
        </div>
    }

    getTraceInfo() {
        let results = [];
        results.push(<div>{this.props.roadsMarker.startPointMarker.options.title}</div>);
        let places = this.props.roadsMarker.places;
        let tracePlacesIdx = this.props.roadsMarker.currentTrace;
        console.log('trace: ', tracePlacesIdx);
        let tracePlacesLength = tracePlacesIdx.length;

        for (let i = 0; i < tracePlacesLength - 1; i++) {
            let nextPlaceName = this.props.roadsMarker.places[tracePlacesIdx[i + 1]].name;
            let distance = this.props.roadsMarker.places[i].targetPlaces.find((place) => {
                return place.name === nextPlaceName
            }).road.distance;
            results.push(<div>
                <div>{distance} km</div>
                <div>{nextPlaceName}</div>
            </div>);
        }

        return results;
    }
}

export default TraceSummary;