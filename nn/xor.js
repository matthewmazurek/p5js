let nn, X = [], Y = [], pred;

let training_data = [
    {
        inputs: [0, 0],
        outputs: [0]
    },
    {
        inputs: [0, 1],
        outputs: [1]
    },
    {
        inputs: [1, 0],
        outputs: [1]
    },
    {
        inputs: [1, 1],
        outputs: [0]
    },
];

function setup() {
    createCanvas(400, 400);
    nn = new NeuralNetwork([2, 2, 1]);
    training_data.forEach(data => {
        X.push(data.inputs);
        Y.push(data.outputs);
    });
    X = new Matrix2D(X).T;
    Y = new Matrix2D(Y).T;
}

function predict(arr) {
    let X = new Matrix2D([arr]).T;
    return nn.predict(X).data[0];
}

function draw() {

    background(0);

    nn.train(X, Y, 1, 50, false);

    const res = 10;
    for (let i = 0; i < width / res; i++) for (let j = 0; j < height / res; j++) {
        let x1 = i * res / width;
        let x2 = j * res / height;
        let y = predict([x1, x2]);
        fill(y * 255);
        rect(i * res, j * res, res, res);
    }

    // noLoop();

}