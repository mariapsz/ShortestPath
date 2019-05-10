import React from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet.icon.glyph";
import "./map.css";

const fs = require('fs');

class Place {
    constructor(name, latLng, connections) {
        this.name = name;
        this.latLng = latLng;
        this.connections = connections;
    }
}

const places = [
    new Place('Szczecin', L.latLng(53.444738, 14.524450), ['Gorzów Wielkopolski', 'Gdańsk', 'Bydgoszcz', 'Poznań']),
    new Place('Poznań', L.latLng(52.410637, 16.918623), ['Szczecin', 'Gorzów Wielkopolski', 'Wrocław', 'Bydgoszcz', 'Gdańsk', 'Łódź', 'Opole']),
    new Place('Olsztyn', L.latLng(53.773239, 20.476377), ['Gdańsk', 'Białystok', 'Warszawa', 'Bydgoszcz']),
    new Place('Kielce', L.latLng(50.864746, 20.628129), ['Warszawa', 'Lublin', 'Kraków', 'Łódź', 'Rzeszów', 'Katowice']),
    new Place('Katowice', L.latLng(50.254167, 19.020610), ['Kraków', 'Opole', 'Kielce', 'Łódź']),
    new Place('Gdańsk', L.latLng(54.379539, 18.622404), ['Szczecin', 'Poznań', 'Bydgoszcz', 'Olsztyn']),
    new Place('Białystok', L.latLng(53.133148, 23.167585), ['Lublin', 'Warszawa', 'Bydgoszcz', 'Olsztyn']),
    new Place('Rzeszów', L.latLng(50.031183, 22.003103), ['Kraków', 'Lublin', 'Kielce']),
    new Place('Opole', L.latLng(50.670958, 17.925569), ['Wrocław', 'Poznań', 'Kraków', 'Łódź']),
    new Place('Warszawa', L.latLng(52.227932, 21.012843), ['Łódź', 'Białystok', 'Kielce', 'Bydgoszcz', 'Lublin', 'Olsztyn']),
    new Place('Kraków', L.latLng(50.062435, 19.959979), ['Katowice', 'Rzeszów', 'Kielce']),
    new Place('Łódź', L.latLng(51.763257, 19.507721), ['Warszawa', 'Kielce', 'Opole', 'Katowice', 'Wrocław', 'Poznań', 'Bydgoszcz']),
    new Place('Gorzów Wielkopolski', L.latLng(52.733179, 15.241680), ['Szczecin', 'Poznań', 'Wrocław']),
    new Place('Lublin', L.latLng(51.234893, 22.570755), ['Łódź', 'Warszawa', 'Białystok', 'Rzeszów', 'Kielce']),
    new Place('Bydgoszcz', L.latLng(53.121995, 18.018519), ['Warszawa', 'Białystok', 'Olsztyn', 'Gdańsk', 'Szczecin', 'Poznań', 'Łódź']),
    new Place('Wrocław', L.latLng(51.107865, 17.029611), ['Gorzów Wielkopolski', 'Poznań', 'Łódź', 'Opole']),
];


class Map extends React.Component {

    map;
    tempMap;

    static GetPlaceIdx(placeName, array) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].name === placeName)
                return i;
        }
        return -1;
    }

    RouterControlRoadsLinesToJSON = (JSONPath, places, map) => {
        const roads = [];
        places.forEach(function (place) {
            place.connections.forEach(function (connection) {
                let connectionIdx = Map.GetPlaceIdx(connection, places);
                let waypoints = [place.latLng, places[connectionIdx].latLng];
                let control = L.routing.control({
                    waypoints,
                }).addTo(map);
                control.on('routeselected', (e) => {
                    let road = {
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": Map.ArrayOfLatLAngToArrayOfNumbers(e.route.coordinates)
                        },
                        "properties": {
                            "color": "red"
                        }
                    };
                    roads.push(road);
                });

            });
        });
        let data = {
            "type": "FeatureCollection",
            "features": roads,
        };


        setTimeout(() => {
                function download(content, fileName, contentType) {
                    let a = document.createElement("a");
                    let file = new Blob([content], {type: contentType});
                    a.href = URL.createObjectURL(file);
                    a.download = fileName;
                    a.click();
                }

                download(JSON.stringify(data), 'json.txt', 'text/plain');
            }
            , 30000);
    };


    static LatLangToArray(latLang) {
        return [latLang.lng, latLang.lat];
    }

    static ArrayOfLatLAngToArrayOfNumbers(LatLangArray) {
        let LatLangAsNumbers = [];
        for (let i = 0; i < LatLangArray.length; i++) {
            LatLangAsNumbers[i] = Map.LatLangToArray(LatLangArray[i]);
        }
        return LatLangAsNumbers;
    }

    componentDidMount() {

        //var geoJsonLayer = L.geoJson(data, {
        //    onEachFeature: function (feature, layer) {
        //        if (layer instanceof L.Polyline) {
        //            layer.setStyle({
        //                'color': feature.properties.color
        //            });
        //        }
        //    }
        //});
        //this.RouterControlRoadsLinesToJSON('asd');
        this.map = L.map("map", {
            center: [52.227932, 21.012843],
            zoom: 6,
            layers: [
                L.tileLayer("https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png", {
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }),
                //geoJsonLayer,
            ],
        });
//
        L.layerGroup().addTo(this.map);
//
        this.RouterControlRoadsLinesToJSON('asd', places, this.map);
        //console.log('Array: ', this.LatLangToArray(L.latLng(53.444738, 14.524450)));
        //console.log(L.latLng(53.444738, 14.524450));
//
//
        //this.tempMap = L.map("tempMap", {
        //    center: [51.55, 19.08],
        //    zoom: 6,
        //    layers: [
        //        L.tileLayer("https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png", {
        //            attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        //        })
        //    ],
        //});
        //L.layerGroup().addTo(this.tempMap);
        //let waypoints = [places[0], places[1]];
        //let control = L.routing.control({waypoints});
        //control.addTo(this.map);
        //control.on('routeselected', (e) => {
//
        //    setTimeout(() => {
        //        console.log('start adding: ');
        //        let myLines = [{
        //            "type": "LineString",
        //            "coordinates": this.ArrayOfLatLAngToArrayOfNumbers(e.route.coordinates),
        //        }];
        //        console.log('myLines: ' + myLines);
        //        L.geoJSON(myLines).addTo(this.tempMap);
        //    }, 5000);
        //});
    }


    render() {
        return <div>
            <div id="map"/>
            <div id="tempMap"/>
        </div>;
    }
}


export default Map;
