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
    new Place('Szczecin', L.latLng(53.444738, 14.524450), ['Gorzów Wielkopolski', 'Gdańsk', 'Bydgoszcz', 'Poznań']),
    new Place('Poznań', L.latLng(52.410637, 16.918623), [ 'Szczecin', 'Gorzów Wielkopolski', 'Wrocław', 'Bydgoszcz','Gdańsk' ,'Łódź', 'Opole']),
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
    new Place('Lublin', L.latLng(51.234893, 22.570755), ['Łódź', 'Warszawa', 'Białystok' ,'Rzeszów', 'Kielce']),
    new Place('Bydgoszcz', L.latLng(53.121995, 18.018519), ['Warszawa', 'Białystok', 'Olsztyn', 'Gdańsk', 'Szczecin', 'Poznań', 'Łódź']),
    new Place('Wrocław', L.latLng(51.107865, 17.029611), ['Gorzów Wielkopolski', 'Poznań', 'Łódź', 'Opole']),
];


class Map extends React.Component {

    createAdjacencyMatrix(callback) {
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
                //console.log('k: ' + k);
                let connPlaceIdx = Map.getPlaceIndex(places[j].connections[k], places);
                console.log('connPlaceIdx: ' + connPlaceIdx);
                if (matrix[connPlaceIdx][j] !== 0) {
                    console.log('czemu tu nigdy nie wchodzi? ;/');
                    matrix[j][connPlaceIdx] = matrix[connPlaceIdx][j];
                } else {
                  //  console.log(matrix);
                 //   console.log('connPlaceIdx: ' + connPlaceIdx + ' j: ' + j);
                  //  console.log(matrix[connPlaceIdx][j]);
                    let waypoints = [
                        places[j].latLng,
                        places[connPlaceIdx].latLng,
                    ];
                    callback();
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
                    callback();

                    routeControl.on('routesfound', function (e) {
                        let routes = e.routes;
                        let summary = routes[0].summary;
                        //console.log(summary.totalDistance / 1000);
                        //console.log('middle: ' + j);
                        matrix[j][connPlaceIdx] = summary.totalDistance / 1000;
                        //console.log(matrix);
                        //total time is ' + Math.round(summary.totalTime % 3600 / 60) + ' minutes');
                    });
                    callback();
                }
            }
        }
        return matrix;
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

        console.log(this.createAdjacencyMatrix(function () {
            console.log('funkcja callback');
        }));
    }


    render() {
        return <div id="map" style={style}/>;
    }
}

export default Map;
