import L from "leaflet";
import "leaflet-routing-machine";
import Road from './Road';

class RoadsMarker {
    places;
    startPointName = null;
    targetPointName = null;
    currentTrace = null;
    markedRoads = [];
    startPointMarker = null;
    targetPointMarker = null;

    constructor(places) {
        this.places = places;
    }

    AddRoadsToTargetPlaces = () => {
        let map = L.map("map", {
            center: [52.227932, 21.012843],
            zoom: 6,
            layers: [
                L.tileLayer("https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png", {
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }),
            ],
        });

        this.places.forEach((place) => {
            place.targetPlaces.forEach((targetPlace) => {
                let connectionIdx = this.GetPlaceIdx(targetPlace);
                let waypoints = [place.latLng, this.places[connectionIdx].latLng];
                let control = L.routing.control({
                    waypoints,
                }).addTo(map);
                control.on('routeselected', (e) => {
                    let geoJSON = {
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": RoadsMarker.LatLngObjectsArrayToArrayOfNumbers(e.route.coordinates)
                        },
                        "properties": {
                            "color": "red"
                        }
                    };
                    let distance = e.route.summary.totalDistance / 1000;
                    let time = e.route.summary.totalTime;
                    targetPlace.road = new Road(geoJSON, distance, time);
                });
            });
        });
    };

    DrawRoads(map) {
        let data = this.GetGeoJSON();
        L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                if (layer instanceof L.Polyline) {
                    layer.setStyle({
                        'color': '#cc5127',
                        'weight': 1,
                    });
                }
            }
        }).addTo(map);
    }

    GetGeoJSON = () => {
        let roads = [];
        let ifAdded = Array(this.places.length).fill(0).map(() => Array(this.places.length).fill(0));

        for (let placeIdx = 0; placeIdx < this.places.length; placeIdx++) {
            for (let targetIdx = 0; targetIdx < this.places[placeIdx].targetPlaces.length; targetIdx++) {
                if (!ifAdded[targetIdx][placeIdx]) {
                    roads.push(this.places[placeIdx].targetPlaces[targetIdx].road.geoJSON);
                    ifAdded[placeIdx][targetIdx] = 1;
                }
            }
        }

        return {
            "type": "FeatureCollection",
            "features": roads,
        };
    };

    DownloadObjectAsJSONFile = () => {
        function download(content, fileName, contentType) {
            let a = document.createElement("a");
            let file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }

        download(JSON.stringify(this.places), 'json.txt', 'text/plain');
    };

    AddMarkers(map) {

        this.places.forEach((place) => {
            let icon = L.divIcon({
                html: `<div>${place.name}</div>`,
                className: 'div-icon',
                iconSize: null,
            });

            let marker = L.marker(RoadsMarker.LatLangToArray(place.latLng), {icon, title: `${place.name}`});
            marker.addTo(map);
            marker.on('click', (event) => {
                this.SetTrace(event, map);
            });
        });
    }

    SetTrace(event, map) {
        let marker = event.target;

        if (this.startPointName === null) {
            this.startPointName = marker.options.title;
            if (this.startPointMarker !== null)
                this.RemoveCurrentStartPointMarker(map);
            this.SetMarkerAsStartPointMarker(marker, map);
            if (this.currentTrace != null) {
                this.markedRoads.map((road) => road.remove());
                this.currentTrace = null;
            }
        } else if (this.targetPointName === null) {
            this.targetPointName = marker.options.title;
            if (this.targetPointMarker !== null)
                this.RemoveCurrentTargetPointMarker(map);
            this.SetMarkerAsTargetPointMarker(marker, map);
            this.checkRoad(this.startPointName, this.targetPointName, map);
        }
    }

    RemoveCurrentStartPointMarker = (map) => {
        let defaultIcon = L.divIcon({
            html: `<div>${this.startPointMarker.options.title}</div>`,
            className: 'div-icon',
            iconSize: null,
        });
        let changed = L.marker(this.startPointMarker._latlng, {icon: defaultIcon, title: this.startPointMarker.options.title});
        this.startPointMarker.remove();
        this.startPointMarker = null;
        changed.addTo(map);
    };

    SetMarkerAsStartPointMarker = (marker, map) => {
        let startIcon = L.divIcon({
            html: `<div>Start: </br>${marker.options.title}</div>`,
            className: 'div-icon',
            iconSize: null,
        });
        this.startPointMarker = L.marker(marker._latlng,{icon: startIcon, title: marker.options.title});
        marker.remove();
        this.startPointMarker.addTo(map);
    };

    RemoveCurrentTargetPointMarker = (map) => {
        console.log('title: ', this.targetPointMarker);
        let defaultIcon = L.divIcon({
            html: `<div>${this.targetPointMarker.options.title}</div>`,
            className: 'div-icon',
            iconSize: null,
        });
        let defaultMarker = L.marker(this.startPointMarker._latlng,{icon: defaultIcon, title: this.targetPointMarker.options.title});
        this.targetPointMarker.remove();
        this.targetPointMarker = null;
        defaultMarker.addTo(map);
    };

    SetMarkerAsTargetPointMarker = (marker, map) => {
        let targetIcon = L.divIcon({
            html: `<div>Koniec: </br>${marker.options.title}</div>`,
            className: 'div-icon',
            iconSize: null,
        });
        this.targetPointMarker = L.marker(marker._latlng,{icon: targetIcon, title: marker.options.title});
        marker.remove();
        this.targetPointMarker.addTo(map);
    };

    GetAdjacencyMatrix() {
        let adjacencyMatrix = Array(this.places.length).fill(0).map(() => Array(this.places.length).fill(0));
        const placesCount = this.places.length;

        for (let i = 0; i < placesCount; i++) {
            let targetPlacesCount = this.places[i].targetPlaces.length;
            for (let j = 0; j < targetPlacesCount; j++) {
                if (adjacencyMatrix[j][i] !== 0) {
                    adjacencyMatrix[i][j] = adjacencyMatrix[j][i];
                } else {
                    let targetPlaceIdx = this.GetPlaceIdx(this.places[i].targetPlaces[j]);
                    adjacencyMatrix[i][targetPlaceIdx] = this.places[i].targetPlaces[j].road.distance;
                }
            }
        }

        return adjacencyMatrix;
    }

    ChangeRoadColor(placesIndexes, map, color) {
        if (color === undefined)
            color = '#efe1c8';

        let placesCount = placesIndexes.length;
        for (let i = 0; i < placesCount - 2; i++) {
            let nextPlaceName = this.places[placesIndexes[i + 1]].name;
            let pointsList = this.places[i].targetPlaces.find((place) => {
                return place.name === nextPlaceName
            }).road.geoJSON.geometry.coordinates.map((row) => row.slice());
            RoadsMarker.ReverseEachRowIn2DimArray(pointsList);
            let test = Array.from(this.places[i].targetPlaces.find((place) => {
                return place.name === nextPlaceName
            }).road.geoJSON.geometry.coordinates);
            let polyline = new L.Polyline(pointsList, {
                color: color,
                weight: 6,
                opacity: 0.3,
            }).addTo(map);
            this.markedRoads.push(polyline);
        }
    }

    checkRoad(startPoint, targetPoint, map) {
        this.currentTrace = [0, 1, 5, 14];
        this.ChangeRoadColor(this.currentTrace, map);
        this.startPointName = null;
        this.targetPointName = null;
    }

    static ReverseEachRowIn2DimArray(array) {
        let length = array.length;
        for (let i = 0; i < length; i++) {
            array[i] = array[i].reverse();
        }
    }

    GetPlaceIdx = (place) => {
        for (let i = 0; i < this.places.length; i++) {
            if (this.places[i].name === place.name)
                return i;
        }
        return -1;
    };

    static LatLangToArray(latLang) {
        return [latLang.lat, latLang.lng];
    }

    static LatLangToArrayReversed(latLang) {
        return [latLang.lng, latLang.lat];
    }

    static LatLngObjectsArrayToArrayOfNumbers(LatLangObjectsArray) {
        let LatLangAsNumbers = [];
        for (let i = 0; i < LatLangObjectsArray.length; i++) {
            LatLangAsNumbers[i] = RoadsMarker.LatLangToArrayReversed(LatLangObjectsArray[i]);
        }
        return LatLangAsNumbers;
    }
}

export default RoadsMarker;