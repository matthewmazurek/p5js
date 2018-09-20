class NeuralNetwork {
    // Model: X -> [linear -> ReLU] x [L-1] -> [linear -> sigmoid] -> AL
    constructor(dims) {
        this.dims = dims;
        this.L = dims.length - 1;
        this.params = this.initializeParams(dims);
    }
    initializeParams(dims) {
        const params = {};
        for (let i = 1; i <= this.L; i++) {
            params['W' + i] = Matrix2D.random([dims[i], dims[i - 1]]);
            params['b' + i] = Matrix2D.random([dims[i], 1]);
        }
        return params;
    }
    linearForward(A, W, b) {
        const Z = W.dot(A).add(b);
        const cache = { A, W, b };
        return [Z, cache];
    }
    linearActivationForward(A_prev, W, b, activation) {
        const [Z, linear_cache] = this.linearForward(A_prev, W, b);
        const [A, activation_cache] = activation.fn(Z);
        const cache = { linear_cache, activation_cache };
        return [A, cache];
    }
    modelForward(X) {
        let A = X, cache, caches = [];
        // hidden layers [linear -> relu] x (L - 1)
        for (let i = 1; i < this.L; i++) {
            const A_prev = A;
            [A, cache] = this.linearActivationForward(
                A_prev, this.params['W' + i], this.params['b' + i], tanh
            );
            caches.push(cache);
        }
        // final layer [linear -> sigmoid]
        [A, cache] = this.linearActivationForward(
            A, this.params['W' + this.L], this.params['b' + this.L], sigmoid
        );
        caches.push(cache);
        return [A, caches];
    }
    linearBackward(dZ, cache) {
        const { A, W, b } = cache;
        const m = A.cols;
        const dW = dZ.dot(A.T).div(m);
        const db = dZ.sum(0).div(m);
        const dA_prev = W.T.dot(dZ);
        return [dA_prev, dW, db];
    }
    linearActivationBackward(dA, cache, activation) {
        const { linear_cache, activation_cache } = cache;
        const dZ = activation.dfn(dA, activation_cache);
        const [dA_prev, dW, db] = this.linearBackward(dZ, linear_cache);
        return [dA_prev, dW, db];
    }
    modelBackward(AL, Y, caches) {
        const grads = {};
        const m = AL.cols;
        // dAL is derrivative of cost fxn wrt AL (using cross-entropy loss)
        // dAL = - (Y/AL - (1-Y)/(1-AL))
        const dAL = Y.div(AL).sub(
            Y.mult(-1).add(1).div(
                AL.mult(-1).add(1)
            )
        ).mult(-1);
        // Lth layer (sigmoid -> linear)
        let current_cache = caches[this.L - 1];
        [grads['dA' + this.L], grads['dW' + this.L], grads['db' + this.L]] =
            this.linearActivationBackward(dAL, current_cache, sigmoid);
        //ith layer (ReLU -> linear)
        for (let i = this.L - 1; i > 0; i--) {
            current_cache = caches[i - 1];
            [grads['dA' + i], grads['dW' + i], grads['db' + i]] =
                this.linearActivationBackward(
                    grads['dA' + (i + 1)], current_cache, tanh
                );
        }
        return grads;
    }
    cost(AL, Y) {
        const m = AL.cols;
        // cross-entropy cost
        // = - sum ( Y*ln(AL) + (1-Y)*ln(1-AL) ) / m
        const logProbs = Y.mult(AL.log()).add(
            Y.mult(-1).add(1).mult(
                AL.mult(-1).add(1).log()
            )
        )
        const cost = - logProbs.sum() / m;
        return cost;
    }
    accuracy(A, Y) {
        const m = A.cols;
        const sum = A.round().reduce((acc, val, idx) => {
            return acc + (val == Y.lookup(idx))
        }, 0, 0).data[0];
        return sum / m;
    }
    updateParams(grads, learningRate) {
        const L = this.dims.length - 1;
        for (let i = 1; i <= L; i++) {
            this.params['W' + i] = this.params['W' + i].sub(grads['dW' + i].mult(learningRate));
            this.params['b' + i] = this.params['b' + i].sub(grads['db' + i].mult(learningRate));
        }
    }
    async train(X, Y, learningRate = 0.1, iterations = 1000, printCost = true) {
        const history = [];
        for (let i = 0; i < iterations; i++) {
            const [AL, caches] = this.modelForward(X);
            if (i % 100 == 0 || i == iterations - 1) {
                const cost = this.cost(AL, Y);
                const accuracy = this.accuracy(AL, Y);
                history.push({ cost, accuracy });
                if (printCost) console.log(`Iteration ${i}: Cost = ${cost}, Accuracy = ${accuracy}`);
            }
            const grads = this.modelBackward(AL, Y, caches);
            this.updateParams(grads, learningRate);
        }
        return history;
    }
    predict(X) {
        const [AL, cache] = this.modelForward(X);
        return AL;
    }
}

class ActivationFunction {
    constructor(name, fn, dfn) {
        this.name = name;
        this.fn = fn;
        this.dfn = dfn;
    }
}
const relu = new ActivationFunction(
    'relu',
    Z => {
        const A = Z.map(x => Math.max(0, x));
        const cache = { Z }
        return [A, cache];
    },
    (dA, cache) => {
        const { Z } = cache;
        const dZ = dA.mult(Z.map(x => x > 0 ? 1 : 0));
        return dZ;
    }
);
const sigmoid = new ActivationFunction(
    'sigmoid',
    Z => {
        const A = Z.mult(-1).exp().add(1).pow(-1);
        const cache = { A }
        return [A, cache];
    },
    (dA, cache) => {
        const { A } = cache;
        const dZ = dA.mult(A.mult(A.mult(-1).add(1)));

        return dZ;
    }
);
const tanh = new ActivationFunction(
    'tanh',
    Z => {
        const A = Z.map(x => Math.tanh(x));
        const cache = { A };
        return [A, cache];
    },
    (dA, cache) => {
        const { A } = cache;
        const dZ = dA.mult(A.mult(A).mult(-1).add(1));
        return dZ;
    }
);