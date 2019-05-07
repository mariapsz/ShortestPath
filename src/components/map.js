import React from "react";
import L from "leaflet";
import "leaflet-routing-machine"
import "leaflet.icon.glyph"


const style = {
    width: "100vh",
    height: "90vh",
};

class Place {
    constructor(name, latLng, connections) {
        this.name = name;
        this.latLng = latLng;
        this.connections = connections;
    }
}

const places = [
    new Place('Warszawa', L.latLng(52.227932, 21.012843), ['Łódź', 'Białystok']),
    new Place('Łódź', L.latLng(51.755869, 19.435534), ['Warszawa', 'Białystok']),
    new Place('Białystok', L.latLng(53.133148, 23.167585), ['Łódź', 'Warszawa']),
];


class Map extends React.Component {

    createAdjacencyMatrix() {
        let matrix = [];
        let rows = places.length;
        let columns = places.length;

        fill2DimensionsArray(matrix, rows, columns);

        function fill2DimensionsArray(arr, rows, columns) {
            for (let i = 0; i < rows; i++) {
                matrix.push([0]);
                for (let j = 0; j < columns; j++) {
                    matrix[i][j] = 0;
                }
            }
        }

        for (let j = 0; j < places.length; j++) {
            console.log('start: ' + j);
            for (let k = 0; k < places[j].connections.length; k++) {
                let connPlaceIdx = Map.getPlaceIndex(places[j].connections[k], places);
                let waypoints = [
                    places[j].latLng,
                    places[connPlaceIdx].latLng,
                ];

                let routeControl = L.Routing.control({
                    plan: L.Routing.plan(waypoints, {
                        createMarker: function (i, wp) {
                            return L.marker(wp.latLng, {
                                draggable: true,
                                icon: L.icon({
                                    iconUrl: 'dot.png',
                                    shadowUrl: 'dot.png',
                                }),
                            });
                        },
                    }),
                }).addTo(this.map);

                routeControl.on('routesfound', function (e) {
                    let routes = e.routes;
                    let summary = routes[0].summary;
                    console.log(summary.totalDistance / 1000);
                    console.log('middle: ' + j);
                    matrix[j][connPlaceIdx] = summary.totalDistance / 1000;
                    console.log(matrix);
                    //total time is ' + Math.round(summary.totalTime % 3600 / 60) + ' minutes');
                });
            }
        }
    }

    static getPlaceIndex(name, array) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].name === name)
                return i;
        }
        return -1;
    }

    componentDidMount() {
        // create map
        this.map = L.map("map", {
            center: [51.55, 19.08],
            zoom: 6,
            layers: [
                L.tileLayer("https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png", {
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                })
            ],
        });

        // add layer
        this.layer = L.layerGroup().addTo(this.map);

        this.createAdjacencyMatrix();
    }


    render() {
        return <div id="map" style={style}/>;
    }
}

export default Map;
