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
        let totalDistance = 0;
        results.push(<div className='placeName endpoint'>{this.props.roadsMarker.startPointMarker.options.title}</div>);
        let tracePlacesIdx = this.props.roadsMarker.currentTrace.reverse();
        console.log('trace: ', tracePlacesIdx);
        let tracePlacesLength = tracePlacesIdx.length;

        for (let i = 0; i < tracePlacesLength - 1; i++) {
            let nextPlaceName = this.props.roadsMarker.places[tracePlacesIdx[i + 1]].name;
            let nextPlace = this.props.roadsMarker.places[tracePlacesIdx[i]].targetPlaces.find((place) => {
                return place.name === nextPlaceName
            });
            let distance;
            if (nextPlace !== undefined)
                distance = nextPlace.road.distance;
            else {
                let currentPlaceName = this.props.roadsMarker.places[tracePlacesIdx[i]].name;
                distance = this.props.roadsMarker.places[tracePlacesIdx[i + 1]].targetPlaces.find((place) => {
                    return place.name === currentPlaceName
                }).road.distance;
            }
            totalDistance += distance;
            if (i + 1 !== tracePlacesLength - 1)
                results.push(<div>
                    <div className='distanceWrapper'>
                        <div className='arrow'>&#8595;</div>
                        <div className='distance'>{distance.toFixed(3)} km</div>
                    </div>
                    <div className='placeName'>{nextPlaceName}</div>
                </div>);
            else results.push(<div>
                <div className='distanceWrapper'>
                    <div className='arrow'>&#8595;</div>
                    <div className='distance'>{distance.toFixed(3)} km</div>
                </div>
                <div className='placeName endpoint'>{nextPlaceName}</div>
            </div>);
        }

        results.push(<div className='distanceWrapper totalDistance'>
            <label>Całkowity dystans: </label>
            <div className='placeName endpoint'>{totalDistance.toFixed(3)} km</div>
        </div>);
        return results;
    }
}

export default TraceSummary;