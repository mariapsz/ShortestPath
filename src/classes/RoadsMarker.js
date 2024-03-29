import L from "leaflet";
import "leaflet-routing-machine";
import Road from './Road';

class RoadsMarker {
    places;
    floydWarshall;
    map;
    startPointName = null;
    targetPointName = null;
    currentTrace = null;
    markedRoads = [];
    startPointMarker = null;
    targetPointMarker = null;
    summaryComponentHandler;

    constructor(places, map, floydWarshall, summaryComponentHandler) {
        this.places = places;
        this.floydWarshall = floydWarshall;
        this.map = map;
        this.summaryComponentHandler = summaryComponentHandler;
    }

    start(summaryComponentHandler) {
        this.drawRoads(this.map);
        this.addMarkers(this.map);
    }

    addRoadsToTargetPlaces = () => {
        this.places.forEach((place) => {
            place.targetPlaces.forEach((targetPlace) => {
                let connectionIdx = this.getPlaceIdx(targetPlace);
                let waypoints = [place.latLng, this.places[connectionIdx].latLng];
                let control = L.routing.control({
                    waypoints,
                }).addTo(this.map);
                control.on('routeselected', (e) => {
                    let geoJSON = {
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": RoadsMarker.latLngObjectsArrayToArrayOfNumbers(e.route.coordinates)
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

    drawRoads() {
        let data = this.getGeoJSON();
        L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                if (layer instanceof L.Polyline) {
                    layer.setStyle({
                        'color': '#cc5127',
                        'weight': 1,
                    });
                }
            }
        }).addTo(this.map);
    }

    getGeoJSON = () => {
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

    downloadPlacesAsJSONFile = () => {
        function download(content, fileName, contentType) {
            let a = document.createElement("a");
            let file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }

        download(JSON.stringify(this.places), 'places.json', 'text/plain');
    };

    downloadAdjecencyMatrixsAsJSONFile = () => {
        function download(content, fileName, contentType) {
            let a = document.createElement("a");
            let file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }

        download(JSON.stringify(this.getAdjacencyMatrix()), 'adjecancyMatrix.json', 'text/plain');
    };

    addMarkers() {

        this.places.forEach((place) => {
            let icon = L.divIcon({
                html: `<div>${place.name}</div>`,
                className: 'div-icon',
                iconSize: null,
            });

            let marker = L.marker(RoadsMarker.latLangToArray(place.latLng), {icon, title: `${place.name}`});
            marker.addTo(this.map);
            marker.on('click', (event) => {
                this.setTrace(event);
                this.summaryComponentHandler(this);
            });
        });
    }

    setTrace(event) {
        let marker = event.target;

        if (this.startPointName === null) {
            this.startPointName = marker.options.title;
            if (this.startPointMarker !== null)
                this.removeCurrentStartPointMarker(this.map);
            if (this.targetPointMarker !== null)
                this.removeCurrentTargetPointMarker(this.map);
            this.setMarkerAsStartPointMarker(marker, this.map);
            if (this.currentTrace != null) {
                this.markedRoads.map((road) => road.remove());
                this.currentTrace = null;
            }
        } else if (this.targetPointName === null) {
            this.targetPointName = marker.options.title;
            this.setMarkerAsTargetPointMarker(marker, this.map);
            this.checkShortestPath(this.startPointName, this.targetPointName, this.map);
        }
    }

    removeCurrentStartPointMarker = () => {
        let defaultIcon = L.divIcon({
            html: `<div>${this.startPointMarker.options.title}</div>`,
            className: 'div-icon',
            iconSize: null,
        });
        let defaultMarker = L.marker(this.startPointMarker._latlng, {
            icon: defaultIcon,
            title: this.startPointMarker.options.title
        });
        defaultMarker.on('click', (event) => {
            this.setTrace(event, this.map);
            this.summaryComponentHandler(this);
        });
        this.startPointMarker.remove();
        this.startPointMarker = null;
        defaultMarker.addTo(this.map);
        console.log('Start: ', defaultMarker);
    };

    setMarkerAsStartPointMarker = (marker) => {
        let startIcon = L.divIcon({
            html: `<div>Start: </br>${marker.options.title}</div>`,
            className: 'div-icon endpoint',
            iconSize: null,
        });
        this.startPointMarker = L.marker(marker._latlng, {icon: startIcon, title: marker.options.title});
        marker.remove();
        this.startPointMarker.addTo(this.map);
    };

    removeCurrentTargetPointMarker = () => {
        console.log('title: ', this.targetPointMarker);
        let defaultIcon = L.divIcon({
            html: `<div>${this.targetPointMarker.options.title}</div>`,
            className: 'div-icon',
            iconSize: null,
        });
        let defaultMarker = L.marker(this.targetPointMarker._latlng, {
            icon: defaultIcon,
            title: this.targetPointMarker.options.title
        });
        defaultMarker.on('click', (event) => {
            this.setTrace(event, this.map);
            this.summaryComponentHandler(this);
        });
        this.targetPointMarker.remove();
        this.targetPointMarker = null;
        defaultMarker.addTo(this.map);
        console.log('target: ', defaultMarker);

    };

    setMarkerAsTargetPointMarker = (marker) => {
        let targetIcon = L.divIcon({
            html: `<div>Koniec: </br>${marker.options.title}</div>`,
            className: 'div-icon endpoint',
            iconSize: null,
        });
        this.targetPointMarker = L.marker(marker._latlng, {icon: targetIcon, title: marker.options.title});
        marker.remove();
        this.targetPointMarker.addTo(this.map);
    };

    getAdjacencyMatrix() {
        let adjacencyMatrix = Array(this.places.length).fill(Infinity).map(() => Array(this.places.length).fill(Infinity));
        const placesCount = this.places.length;

        for (let i = 0; i < placesCount; i++) {
            adjacencyMatrix[i][i] = 0;
            let targetPlacesCount = this.places[i].targetPlaces.length;
            for (let j = 0; j < targetPlacesCount; j++) {
                let targetPlaceIdx = this.getPlaceIdx(this.places[i].targetPlaces[j]);
                if (adjacencyMatrix[targetPlaceIdx][i] !== Infinity) {
                    adjacencyMatrix[i][targetPlaceIdx] = adjacencyMatrix[targetPlaceIdx][i];
                } else {
                    adjacencyMatrix[i][targetPlaceIdx] = this.places[i].targetPlaces[j].road.distance;
                }
            }
        }
        return adjacencyMatrix;
    }

    changeRoadColor(placesIndexes, color) {
        if (color === undefined)
            color = '#efe1c8';

        let placesCount = placesIndexes.length;
        for (let i = 0; i < placesCount - 1; i++) {
            let nextPlaceName = this.places[placesIndexes[i + 1]].name;
            let pointsList;
            let place = this.places[placesIndexes[i]].targetPlaces.find((place) => {
                return place.name === nextPlaceName
            });
            if (place !== undefined)
                pointsList = place.road.geoJSON.geometry.coordinates.map((row) => row.slice());
            else {
                let currentPlaceName = this.places[placesIndexes[i]].name;
                place = this.places[placesIndexes[i+1]].targetPlaces.find((place) => {
                    return place.name === currentPlaceName;
                });
                pointsList = place.road.geoJSON.geometry.coordinates.map((row) => row.slice());
            }
            RoadsMarker.reverseEachRowIn2DimArray(pointsList);
            let polyline = new L.Polyline(pointsList, {
                color: color,
                weight: 6,
                opacity: 0.3,
            }).addTo(this.map);
            this.markedRoads.push(polyline);
        }
    }

    checkShortestPath(startPointName, targetPointName) {
        let startPointIdx = this.places.findIndex(place => place.name === startPointName);
        let targetPointIdx = this.places.findIndex(place => place.name === targetPointName);
        this.currentTrace = this.floydWarshall.getShortestPath(startPointIdx, targetPointIdx);
        this.changeRoadColor(this.currentTrace);
        this.startPointName = null;
        this.targetPointName = null;
    }

    static reverseEachRowIn2DimArray(array) {
        let length = array.length;
        for (let i = 0; i < length; i++) {
            array[i] = array[i].reverse();
        }
    }

    getPlaceIdx = (place) => {
        for (let i = 0; i < this.places.length; i++) {
            if (this.places[i].name === place.name)
                return i;
        }
        return -1;
    };

    static latLangToArray(latLang) {
        return [latLang.lat, latLang.lng];
    }

    static latLangToArrayReversed(latLang) {
        return [latLang.lng, latLang.lat];
    }

    static latLngObjectsArrayToArrayOfNumbers(LatLangObjectsArray) {
        let LatLangAsNumbers = [];
        for (let i = 0; i < LatLangObjectsArray.length; i++) {
            LatLangAsNumbers[i] = RoadsMarker.latLangToArrayReversed(LatLangObjectsArray[i]);
        }
        return LatLangAsNumbers;
    }
}

export default RoadsMarker;