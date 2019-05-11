import L from "leaflet";
import "leaflet-routing-machine";
import Road from './Road';

class RoadsMarker {
    places;

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
        let geoJsonLayer = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                if (layer instanceof L.Polyline) {
                    layer.setStyle({
                        'color': feature.properties.color
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
                    roads.push(this.places[placeIdx].targetPlaces[targetIdx].road.GeoJSON);
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
        let icon = L.divIcon();
        this.places.forEach((place) => {
            L.marker(RoadsMarker.LatLangToArray(place.latLng), {icon: icon}).addTo(map);
        })
    }

    GetPlaceIdx = (place) => {
        for (let i = 0; i < this.places.length; i++) {
            if (this.places[i].name === place.name)
                return i;
        }
        return -1;
    };

    static LatLangToArray(latLang) {
        return [latLang.lng, latLang.lat];
    }

    static LatLngObjectsArrayToArrayOfNumbers(LatLangObjectsArray) {
        let LatLangAsNumbers = [];
        for (let i = 0; i < LatLangObjectsArray.length; i++) {
            LatLangAsNumbers[i] = RoadsMarker.LatLangToArray(LatLangObjectsArray[i]);
        }
        return LatLangAsNumbers;
    }
}

export default RoadsMarker;