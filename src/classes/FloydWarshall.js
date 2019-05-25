class Distance {
    weight;
    predecessor;

    constructor(weight, predecessor) {
        this.weight = weight;
        this.predecessor = predecessor;
    }
}

class FloydWarshall {
    adjacencyMatrix;
    distanceMatrix;

    constructor(adjacencyMatrix) {
        this.adjacencyMatrix = adjacencyMatrix;
        //fixed lost Infinity values in adjacencyMatrix during serialization
        //exchange null with Infinity
        let adjacencyMatrixLength = this.adjacencyMatrix.length;
        for (let i = 0; i < adjacencyMatrixLength; i++) {
            for (let j = 0; j < adjacencyMatrixLength; j++) {
                if (this.adjacencyMatrix[i][j] === null)
                    this.adjacencyMatrix[i][j] = Infinity;
            }
        }
        this.setDistanceMatrix();
    }

    initializeDistanceMatrix() {
        let adjacencyMatrixLength = this.adjacencyMatrix.length;
        this.distanceMatrix = Array(adjacencyMatrixLength).fill(Infinity).map(() => Array(adjacencyMatrixLength).fill(Infinity));
        for (let i = 0; i < adjacencyMatrixLength; i++) {
            for (let j = 0; j < adjacencyMatrixLength; j++) {
                let distance = this.adjacencyMatrix[i][j];
                let predecessor;
                if (distance !== Infinity && distance !== 0) {
                    predecessor = i;
                } else predecessor = null;
                this.distanceMatrix[i][j] = new Distance(distance, predecessor);
            }
        }
    }

    setDistanceMatrix() {

        this.distanceMatrix = this.adjacencyMatrix.map(row => row.slice());

        this.initializeDistanceMatrix();

        let distMatrixLength = this.distanceMatrix.length;
        for (let k = 0; k < distMatrixLength; k++) {
            let temp = this.distanceMatrix.map(row => row.slice());
            for (let i = 0; i < distMatrixLength; i++) {
                for (let j = 0; j < distMatrixLength; j++) {
                    if (temp[i][j].weight > temp[i][k].weight + temp[k][j].weight) {
                        this.distanceMatrix[i][j].weight = temp[i][k].weight + temp[k][j].weight;
                        this.distanceMatrix[i][j].predecessor = temp[k][j].predecessor;
                    }
                }
            }
        }
        console.log('dist',  this.distanceMatrix);
        console.table( this.adjacencyMatrix);
    }

    getShortestPath(startPointIdx, targetPointIdx) {
        let predecessor = targetPointIdx;
        let path = [];
        path.push(targetPointIdx);
        while (predecessor !== null) {
            predecessor = this.distanceMatrix[startPointIdx][predecessor].predecessor;
            if (predecessor !== null)
                path.push(predecessor);
        }
        console.log('Path ', path);
        return path;
    }
}

export default FloydWarshall;