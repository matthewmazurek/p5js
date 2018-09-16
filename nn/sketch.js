let nn, history;
let data = [];
let X, Y;
let keyLabel;

function setup() {
    createP().html('<h1>Simple multi-layered neural network classifier</h1>');
    createCanvas(400, 400);
    nn = new NeuralNetwork([2, 8, 1]);

    X = new Matrix2D(data.map(dp => dp.x)).T;
    Y = new Matrix2D(data.map(dp => [dp.y])).T;

    createP(`Click and drag to add data points while holding either 'Z' or 'X'.`)
    createP(`The network will try to find a general solution to correctly classify the data.`)
    createP(`Click and hold to reveal correctly (green colored) classified data point.`)
    
    createButton('Load samaple data').mousePressed(loadData);
    createButton('Reset').mousePressed(reset);

    p = createP('');

}

function loadData() {
    reset();
    while (data.length < 100) data.push(new DataPoint);
}
function reset() {
    data = [];
    nn = new NeuralNetwork([2, 8, 1]);
}

function keyPressed() {
    if (keyCode == 90) keyLabel = 0;
    if (keyCode == 88) keyLabel = 1;
}
function keyReleased() {
    keyLabel = undefined;
}

function mouseDragged() {
    if (keyLabel !== undefined) {
        const x = (mouseX / width) * 2 - 1;
        const y = (mouseY / height) * 2 - 1;
        data.push(new DataPoint([x, y], keyLabel));
    }
}

function toggleTrain() {
    isTraining = !isTraining;
}

function draw() {

    if (data.length) {
        X = new Matrix2D(data.map(dp => dp.x)).T;
        Y = new Matrix2D(data.map(dp => [dp.y])).T;
        train(X, Y);
    }    

    background(0);
    noStroke();

    // Draw the shader graph
    let res = 10, max_i = this.width / res, max_j = this.height / res;
    for (let i = 0; i < this.width / res; i++) for (let j = 0; j < this.height / res; j++) {
        let X = Matrix2D.fromArray([
            map(i * res, 0, width, -1, 1),
            map(j * res, 0, height, -1, 1)
        ]);
        let Y = nn.predict(X).data[0];
        fill(Y * 255);
        rect(i * res, j * res, res, res);
    }

    // Darw the data points
    data.forEach(dp => dp.draw());

    // Update the cost and acucracy display
    if (history) {
        let latest = history[history.length - 1];
        p.html(`Cost: ${latest.cost} </br>
            Accuracy: ${latest.accuracy}`);
    }
}

async function train(X, Y) {
    history = await nn.train(X, Y, 0.5, 10, false);
}

class DataPoint {
    constructor(vec, val) {
        this.x = vec || [random() * 2 - 1, random() * 2 - 1];
        this.y = val !== undefined ? val : this.classify(this.x);
        this.pred == undefined;
    }
    predicted(nn) {
        return nn.predict(
            Matrix2D.fromArray(this.x)
        ).round().data[0];
    }
    classify(data) {
        const [x, y] = data;
        const theta = Math.atan(y / x);
        const div = 3;
        const sector = Math.floor(theta / (Math.PI / div));
        return (sector % 2 == 0) ? 1 : 0;
    }
    draw() {
        stroke(1);
        if (this.y == 0) {
            fill(0);
            stroke(255);
        }
        else if (this.y == 1) {
            fill(255);
            stroke(0);
        }
        if (mouseIsPressed && this.predicted(nn) == this.y) fill(0, 255, 0);
        const [posx, posy] = this.x.map(data => map(data, -1, 1, 0, width));
        ellipse(posx, posy, 5, 5);
    }
}