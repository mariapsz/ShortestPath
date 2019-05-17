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

export default Place;