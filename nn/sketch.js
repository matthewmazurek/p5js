let nn;
let data = [];
let X, Y;



function setup() {
    createCanvas(400, 400);
    nn = new NeuralNetwork([2, 4, 1]);
    while (data.length < 100) data.push(new DataPoint);

    X = new Matrix2D(data.map(dp => dp.x)).T;
    Y = new Matrix2D(data.map(dp => [dp.y])).T;

    // train();
    // updatePreds();
}

// class Graph {
//     constructor(res) {
//         this.res = res;
//         this.i_max = width / this.res;
//         this.j_max = height / this.res;
//         let graph = [];
//         for (let i = 0; i < this.i_max; i++) for (let j = 0; j < this.j_max; j++) {
//             graph.push([i / this.i_max, j / this.j_max]);
//         }
//         this.graph = new Matrix2D(graph).T;
//     }
//     draw() {
//         let Y = nn.predict(this.graph);
//         console.log(this.graph);
//         noLoop();
//         Y.forEach((e, idx) => {
//             let [i, j] = idx;
//             let col = e * 255;
//             fill(col);
//             console.log(idx, i, j, i * width, j * height, col);
//             rect(i * this.i_max, j * this.j_max, this.res, this.res);
//         });
//     }
// }

function draw() {
    background(0);
    train(X, Y);
    noStroke();
    let res = 20, max_i = this.width / res, max_j = this.height / res;
    for (let i = 0; i < max_i; i++) for (let j = 0; j < max_j; j++) {
        let X = new Matrix2D([[i / max_i], [j / max_j]]);
        let Y = nn.predict(X).data[0];
        fill(Y * 255);
        rect(i * res, j * res, res, res);
    }

    data.forEach(dp => dp.draw());
}

function train(X, Y) {
    nn.train(X, Y, 0.5, 100, false);
}

class DataPoint {
    constructor() {
        this.x = [random() * 2 - 1, random() * 2 - 1];
        this.y = this.classify(this.x);
    }
    classify(data) {
        const [x, y] = data;
        const theta = Math.atan(y / x);
        const div = 1;
        const sector = Math.floor(theta / (Math.PI / div));
        return (sector % 2 == 0) ? 1 : 0;
    }
    draw() {
        stroke(1);
        if (this.y == 0) fill(0);
        else if (this.y == 1) fill(255);
        // if (mouseIsPressed && this.pred !== undefined && this.pred == this.y) fill(0, 255, 0);
        const [posx, posy] = this.x.map(data => map(data, -1, 1, 0, width));
        ellipse(posx, posy, 5, 5);
    }
}