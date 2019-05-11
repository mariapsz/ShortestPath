class Road {
    geoJSON;
    distance;
    time;

    constructor(geoJSON, distance, time) {
        this.geoJSON = geoJSON;
        this.distance = distance;
        this.time = time;
    }
}

export default Road;