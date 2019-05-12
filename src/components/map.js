import React from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet.icon.glyph";
import "./map.css";
import RoadsMarker from '../classes/RoadMarker.js'
import TargetPlace from '../classes/TargetPlace';

class Place {
    name;
    latLng;
    targetPlaces;

    constructor(name, latLng, targetPlaces) {
        this.name = name;
        this.latLng = latLng;
        this.targetPlaces = targetPlaces;
    }
}

const places = [
    new Place('Szczecin', L.latLng(53.444738, 14.524450), [new TargetPlace('Gorzów Wielkopolski'), new TargetPlace('Gdańsk'), new TargetPlace('Bydgoszcz'), new TargetPlace('Poznań')]),
    new Place('Poznań', L.latLng(52.410637, 16.918623), [new TargetPlace('Szczecin'), new TargetPlace('Gorzów Wielkopolski'), new TargetPlace('Wrocław'), new TargetPlace('Bydgoszcz'), new TargetPlace('Gdańsk'), new TargetPlace('Łódź'), new TargetPlace('Opole')]),
    new Place('Olsztyn', L.latLng(53.773239, 20.476377), [new TargetPlace('Gdańsk'), new TargetPlace('Białystok'), new TargetPlace('Warszawa'), new TargetPlace('Bydgoszcz')]),
    new Place('Kielce', L.latLng(50.864746, 20.628129), [new TargetPlace('Warszawa'), new TargetPlace('Lublin'), new TargetPlace('Kraków'), new TargetPlace('Łódź'), new TargetPlace('Rzeszów'), new TargetPlace('Katowice')]),
    new Place('Katowice', L.latLng(50.254167, 19.020610), [new TargetPlace('Kraków'), new TargetPlace('Opole'), new TargetPlace('Kielce'), new TargetPlace('Łódź')]),
    new Place('Gdańsk', L.latLng(54.379539, 18.622404), [new TargetPlace('Szczecin'), new TargetPlace('Poznań'), new TargetPlace('Bydgoszcz'), new TargetPlace('Olsztyn')]),
    new Place('Białystok', L.latLng(53.133148, 23.167585), [new TargetPlace('Lublin'), new TargetPlace('Warszawa'), new TargetPlace('Bydgoszcz'), new TargetPlace('Olsztyn')]),
    new Place('Rzeszów', L.latLng(50.031183, 22.003103), [new TargetPlace('Kraków'), new TargetPlace('Lublin'), new TargetPlace('Kielce')]),
    new Place('Opole', L.latLng(50.670958, 17.925569), [new TargetPlace('Wrocław'), new TargetPlace('Poznań'), new TargetPlace('Kraków'), new TargetPlace('Łódź')]),
    new Place('Warszawa', L.latLng(52.227932, 21.012843), [new TargetPlace('Łódź'), new TargetPlace('Białystok'), new TargetPlace('Kielce'), new TargetPlace('Bydgoszcz'), new TargetPlace('Lublin'), new TargetPlace('Olsztyn')]),
    new Place('Kraków', L.latLng(50.062435, 19.959979), [new TargetPlace('Katowice'), new TargetPlace('Rzeszów'), new TargetPlace('Kielce')]),
    new Place('Łódź', L.latLng(51.763257, 19.507721), [new TargetPlace('Warszawa'), new TargetPlace('Kielce'), new TargetPlace('Opole'), new TargetPlace('Katowice'), new TargetPlace('Wrocław'), new TargetPlace('Poznań'), new TargetPlace('Bydgoszcz')]),
    new Place('Gorzów Wielkopolski', L.latLng(52.733179, 15.241680), [new TargetPlace('Szczecin'), new TargetPlace('Poznań'), new TargetPlace('Wrocław')]),
    new Place('Lublin', L.latLng(51.234893, 22.570755), [new TargetPlace('Łódź'), new TargetPlace('Warszawa'), new TargetPlace('Białystok'), new TargetPlace('Rzeszów'), new TargetPlace('Kielce')]),
    new Place('Bydgoszcz', L.latLng(53.121995, 18.018519), [new TargetPlace('Warszawa'), new TargetPlace('Białystok'), new TargetPlace('Olsztyn'), new TargetPlace('Gdańsk'), new TargetPlace('Szczecin'), new TargetPlace('Poznań'), new TargetPlace('Łódź')]),
    new Place('Wrocław', L.latLng(51.107865, 17.029611), [new TargetPlace('Gorzów Wielkopolski'), new TargetPlace('Poznań'), new TargetPlace('Łódź'), new TargetPlace('Opole')]),
];


class Map extends React.Component {

    map;
    tempMap;


    RouterControlRoadsLinesToJSON = (JSONPath, places, map) => {

    };


    componentDidMount() {

        this.map = L.map("map", {
            center: [52.227932, 21.012843],
            zoom: 6,
            layers: [
                L.tileLayer("https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png", {
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }),
            ],
        });

        L.layerGroup().addTo(this.map);
        //let roadsMarker = new RoadsMarker(places);
        //roadsMarker.AddRoadsToTargetPlaces();
        //roadsMarker.DownloadObjectAsJSONFile();
        let places = require('../json/places.json');
        let roadsMarker = new RoadsMarker(places);
        roadsMarker.DrawRoads(this.map);
        roadsMarker.AddMarkers(this.map);
        console.log(roadsMarker);
        console.log(roadsMarker.GetAdjacencyMatrix());
        roadsMarker.ChangeRoadColor([0,2,1]);
    }


    render() {
        return <div>
            <div id="map"/>
            <div id="tempMap"/>
        </div>;
    }
}


export default Map;
