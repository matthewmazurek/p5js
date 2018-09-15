class NeuralNetwork {
    // Model: input layer -> hidden layer -> output layer
    constructor(dims) {
        if (dims !== undefined) this.initializeParams(dims);
    }
    initializeParams(dims) {
        const [n_x, n_h, n_y] = dims;
        this.W1 = Matrix2D.random([n_h, n_x]);
        this.b1 = Matrix2D.zeros([n_h, 1]);
        this.W2 = Matrix2D.random([n_y, n_h]);
        this.b2 = Matrix2D.zeros([n_y, 1]);
    }
    forwardProp(X) {
        const Z1 = this.W1.dot(X).add(this.b1); // [n_h, n_x] x [n_x, m] = [n_h, m]
        const A1 = Z1.map(tanh.fn); // [n_h, m]
        const Z2 = this.W2.dot(A1).add(this.b2) // [n_y, n_h] x [n_h, m] = [n_y, m]
        const A2 = Z2.map(sigmoid.fn); // [n_y, m]
        const cache = { Z1, A1, Z2, A2 };
        return [A2, cache];
    }
    cost(A2, Y) {
        const m = A2.cols; // number of examples
        // cross-entropy cost
        const logProbs = A2.log().mult(Y).add(
            (Y.mult(-1).add(1)).mult((A2.mult(-1).add(1)).log())
        ) // [n_y, m]
        const cost = - logProbs.sum() / m;
        return cost;
    }
    backProp(cache, X, Y) {

        const m = X.cols;
        const { A1, A2 } = cache

        // dZ2 is derrived from the chain rule, using the sigmoid activation function
        // and the cross-entropy loss calculation
        const dZ2 = A2.sub(Y); // [n_y, m]
        const dW2 = dZ2.dot(A1.T).mult(1 / m); // [n_y, m] x [m, n_h] = [n_y, n_h]
        const db2 = dZ2.sum(0).mult(1 / m); // [n_y, 1]
        const dZ1 = this.W2.T.dot(dZ2).mult(A1.pow(2).mult(-1).add(1)); // ( [n_h, n_y] x [n_y, m] ) * [n_h, m] = [n_h, m]
        const dW1 = dZ1.dot(X.T).mult(1 / m); // [n_h, m] x [m, n_x] = [n_h, n_x]
        const db1 = dZ1.sum(0).mult(1 / m); // [n_h, 1]

        const grads = { dW1, db1, dW2, db2 };

        return grads;

    }
    updateParams(grads, learningRate) {
        const { dW1, db1, dW2, db2 } = grads;
        this.W1 = this.W1.sub(dW1.mult(learningRate));
        this.b1 = this.b1.sub(db1.mult(learningRate));
        this.W2 = this.W2.sub(dW2.mult(learningRate));
        this.b2 = this.b2.sub(db2.mult(learningRate));
    }

    backpropCheck(X, Y) {
        const deltaX = X.add(0.0001);
        const [A2, cache] = this.forwardProp(X);
        const cost = this.cost(A2, Y);
        const grads = this.backProp(cache, X, Y);

    }
    async train(X, Y, learningRate = 0.1, iterations = 1000, printCost = true) {
        let costHistory = [];
        for (let i = 0; i < iterations; i++) {
            const [A2, cache] = this.forwardProp(X);
            const cost = this.cost(A2, Y);
            if (i % 100 == 0 || i == iterations - 1) {
                costHistory.push(cost);
                if (printCost) console.log(`Cost after ${i} iterations: ${cost}`);
            }
            const grads = this.backProp(cache, X, Y);
            this.updateParams(grads, learningRate);
        }
        return costHistory;
    }
    predict(X) {
        const [A2, cache] = this.forwardProp(X);
        return A2;
    }
    mutate(fn) {
        this.W1 = this.W1.map(fn);
        this.b1 = this.b1.map(fn);
        this.W2 = this.W2.map(fn);
        this.b2 = this.b2.map(fn);
        return this;
    }
    static from(nn) {
        let res = new NeuralNetwork();
        // New NN, a copy of the one passed
        if (nn instanceof NeuralNetwork) {
            res.W1 = nn.W1.copy();
            res.b1 = nn.b1.copy();
            res.W2 = nn.W2.copy();
            res.b2 = nn.b2.copy();
        }
        // New NN from JSON objectx
        else {
            res.W1 = new Matrix2D(nn.W1.data);
            res.b1 = new Matrix2D(nn.b1.data);
            res.W2 = new Matrix2D(nn.W2.data);
            res.b2 = new Matrix2D(nn.b2.data);
        }
        return res;
    }
}

class ActivationFunction {
    constructor(fn, dfn) {
        this.fn = fn;
        this.dfn = dfn;
    }
}
const sigmoid = new ActivationFunction(
    x => 1 / (1 + Math.exp(-x)),
    y => y * (1 - y)
);
const tanh = new ActivationFunction(
    x => Math.tanh(x),
    y => 1 - (y * y)
);