/**
 * matrix2d.js
 *
 * Matrix2d provides a simple immutable matrix data structure and associated
 * computation within JavaScript, including matrix arithmatic, broadcasting,
 * slicing, transposition, mapping, and shortcuts for matrix generation.
 *
 * @version 1.0.1
 * @date    2018-09-16
 *
 * @license MIT Copyright 2018 Matthew Mazurek (matthewmazurek@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

class Matrix2D {

    // Construct a new matrix given a 2D array
    // Matrix data is immutable
    constructor(arr2D) {
        this.data = arr2D;
        [this.rows, this.cols] = this.dims;
    }

    /****************************************************** 
    * NEW MATRIX CONSTRUCTION
    ******************************************************/
    
    // Construct a new matrix template of given dimentions
    // dims - an array of dimention sizes
    // d - the placeholder digit
    static fromDims(dims, d = 0) {
        return new Matrix2D(
            dims.reverse().reduce((e, dim) => {
                let res = [];
                if (e.length) {
                    for (let i = 0; i < dim; i++) res.push([...e]);
                } else {
                    res = Array.from({ length: dim }).fill(d);
                }
                return res;
            }, [])
        );
    }
    // Create a new matrix of given dimentions containing all zeros
    static zeros(dims) {
        return Matrix2D.fromDims(dims, 0);
    }
    // Create a new matrix of given dimentions containing all ones
    static ones(dims) {
        return Matrix2D.fromDims(dims, 1);
    }
    // Create a new matrix of given dimentions containing random numbers (-1 to 1)
    static random(dims) {
        return Matrix2D.fromDims(dims).map(() => Math.random() * 2 - 1);
    }
    // Creates a new matrix from a range of values
    // If only one parameter is provided, the range is [0, a]
    // If two parameters are provided, the range is [a, b]
    // The step is specified by c, or by default is 1
    static range(a, b, c) {
        if (a === undefined) throw Error('Must provide at least one parameter for range function.');
        let upper, lower, step = c || 1;
        upper = b !== undefined ? b : a;
        lower = b !== undefined ? a : 0;
        if (Math.sign(upper-lower) !== Math.sign(step)) throw Error('Infinite range loop error.');
        const res = [];
        for (let i = lower; (step > 0 && i <= upper) || (step < 0 && i >= upper); i += step) {
            res.push(i);
        }
        return Matrix2D.fromArray(res);
    }
    // Creates a new matrix from an array
    // If axis == 0, returns a column matrix
    // If axis == 1, returns a row matrix 
    static fromArray(arr, axis = 0) {
        if (axis !== 0 && axis !== 1)
            throw Error('Axis out of range (must be 0 or 1)');
        const res = new Matrix2D([arr]);
        return axis === 0 ? res.T : res;
    }
    // Returns a new matrix from an existing one, apply a mapping function, fn
    // Used in matrix.map
    static fromMatrix(m, fn) {
        return new Matrix2D(
            m.data.map((row, i) => row.map((val, j) => fn(val, [i, j])))
        );
    }
    // Returns a deep copy of the current matrix
    copy() {
        return this.mult(1);
    }

    /****************************************************** 
    * PROPERTY ACCESSORS
    ******************************************************/

    // Returns dimentions of the matrix as [rows, cols, ...]
    get dims() {
        let dims = [], el = this.data;
        while (el instanceof Array) {
            dims.push(el.length);
            el = el[0];
        }
        return dims;
    }

    // Lookup matrix data given an index array
    // idx is an array of indicies corresponding to the matrix dimentions
    lookup(idx) {
        return idx.reduce((data, i) => data[i], this.data);
    }

    // Returns a one-dimentional list of all matrix data in the format:
    // [{ data: number, idx: [row, col] }, ]
    // Supports matrix.forEach and matrix.map
    get dataList() {
        function loop(arr, idx = []) {
            let res = [];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] instanceof Array) {
                    res = res.concat(loop(arr[i], idx.concat([i])));
                } else {
                    res.push({ data: arr[i], idx: idx.concat([i]) });
                }
            }
            return res;
        }
        return loop(this.data);
    }
    // Returns a new matrix, a slice of the original matrix
    // given a by.row and/or by.col
    slice(by = {}) {
        let [row, col] = [by.row, by.col];
        let res = [];
        for (let i = 0; i < this.rows; i++) {
            if (row == undefined || row == i) {
                res.push([]);
                for (let j = 0; j < this.cols; j++) {
                    if (col == undefined || col == j) res[res.length - 1].push(this.data[i][j]);
                }
            }
        }
        return new Matrix2D(res);
    }
    // Helper function to access the first elements of the matrix
    // Useful if treating a matrix like a 1D vector
    get x() { return this.dataList[0].data; }
    get y() { return this.dataList[1].data; }
    get z() { return this.dataList[2].data; }


    /****************************************************** 
    * DATA ITERATORS
    ******************************************************/

    // Loops through all matrix data
    // f -  the function to be called for each data
    // eg. matrix.forEach((data, [row, col]) => {})
    forEach(fn) {
        this.dataList.forEach(e => {
            fn(e.data, e.idx);
        });
    }
    // Returns a new matrix, the result of applying fn to each element
    // eg. matrix.map((data, [row, col]) => {})
    map(fn) {
        return Matrix2D.fromMatrix(this, fn);
    }
    // Implements reduce over a matrix
    // Returns either a single value, the result of the reduction over the matrix
    // OR a matrix containing the result of reduction over a single axis, if specified
    // Usage: matrix.reduce((accumulator, current, [row, col]) => {}, initVal, axis)
    reduce(fn, initVal, axis) {
        if (axis !== undefined) {
            return Matrix2D.fromDims(
                [axis == 0 ? this.rows : 1, axis == 1 ? this.cols : 1]
            )
                .map((_, [row, col]) =>
                    this.slice(
                        axis == 0 ? { row } : { col }
                    ).dataList.reduce(
                        (acc, c, i) => fn(acc, c.data, (axis == 0 ? [row, i] : [i, col])),
                        initVal
                    )
                );
        }
        else return this.dataList.reduce((acc, c) => fn(acc, c.data, c.idx), initVal);
    }

    /****************************************************** 
    * MATRIX ARITHMETIC
    ******************************************************/

    // Returns a new matrix, either
    // the result of matrix addition of this matrix and given matrix, m
    // OR element wise addition of a constant
    // If dimentions of matrices do not match, will attempt to broadcast
    add(m, sub = false) {
        if (m instanceof Matrix2D) {
            if (sub) m = m.mult(-1);
            if (m.rows == this.rows && m.cols == this.cols) {
                // matrix addition
                return this.map((data, [row, col]) => data + m.lookup([row, col]));
            } else if (m.rows == this.rows && m.cols == 1) {
                // matrix cols broadcasted to fit this.cols
                return this.map((data, [row, col]) => data + m.lookup([row, 0]));
            } else if (m.cols == this.cols && m.rows == 1) {
                //  matrix rows broadcasted to fit this.cols
                return this.map((data, [row, col]) => data + m.lookup([0, col]));
            } else {
                // matrix dimention mismatch
                throw Error(`Matrix2D dimentions must match: ([${this.dims}] vs [${m.dims}])`);
            }
        } else {
            // element-wise addition
            return this.map((data) => data + m * (sub ? -1 : 1));
        }
    }
    // Returns a new matrix, either
    // the result of matrix substraction of this matrix and given matrix m
    // OR element wise subtraction of a constant
    sub(m) {
        return this.add(m, true);
    }
    // Returns a new matrix, the dot product of the current matrix and m
    dot(m) {
        if (m instanceof Matrix2D) {
            if (this.cols == m.rows) {
                // matrix multiplication (dot product)
                let res = Matrix2D.zeros([this.rows, m.cols]);
                for (let i = 0; i < this.rows; i++) for (let j = 0; j < m.cols; j++) for (let k = 0; k < this.cols; k++) {
                    res.data[i][j] += this.data[i][k] * m.data[k][j];
                }
                return res;
            }
            else throw Error(`Matrix2D dimentions not compatible for dot-product: ([${this.dims}] x [${m.dims}])`);
        }
        // element-wise multiplication
        else return this.map(data => data * m);
    }
    // Reutrns a new matrix, either element-wise multiplication of two matricies
    // or the element-wise multiplication of a constant
    mult(m) {
        if (m instanceof Matrix2D) {
            if (this.cols == m.cols && this.rows == m.rows)
                return this.map((data, idx) => data * m.lookup(idx));
            else
                throw Error(`Matrix2D dimentions not compatible for element-wise multiplication: ([${this.dims}] x [${m.dims}])`);
        } else {
            return this.map(data => data * m);
        }
    }
    div(m) {
        if (m instanceof Matrix2D) {
            if (this.cols == m.cols && this.rows == m.rows)
                return this.map((data, idx) => data / m.lookup(idx));
            else
                throw Error(`Matrix2D dimentions not compatible for element-wise division: ([${this.dims}] x [${m.dims}])`);
        } else {
            return this.map(data => data / m);
        }
    }
    // Returns the element-wise (natural) logarithym of the matrix
    log(b) {
        const denominator = b ? Math.log(b) : 1;
        return this.map((data) => Math.log(data) / denominator);
    }
    // Returns the element-wise power of the matrix
    pow(p) {
        return this.map((data) => data ** p);
    }
    // Returns the element-wise rounding of the matrix
    round() {
        return this.map((data) => Math.round(data));
    }
    // Returns a new matrix, either the result of summation along a given axis
    // or, if no axis is specified, the sum of the entire matrix
    sum(axis) {
        return this.reduce((acc, c) => acc + c, 0, axis);
    }

    /****************************************************** 
    * MATRIX OPS
    ******************************************************/

    // Reutrns the transposition of the current matrix
    get T() {
        let transpose = Array.from({ length: this.cols }).map(() => []);
        for (let i = 0; i < this.rows; i++) for (let j = 0; j < this.cols; j++) {
            transpose[j].push(this.data[i][j]);
        }
        return new Matrix2D(transpose);
    }
    // Returns a new matrix, the result of reshaping the current one
    reshape(dims) {
        if (dims.length !== 2)
            throw Error('Reshape dimentionality error: Only 2D-matrices are supported.');
        const [rows, cols] = dims;
        if (rows * cols !== this.rows * this.cols)
            throw Error('Reshape dimentionality error: Total matrix elements must be constant.');
        const data = this.dataList.map(el => el.data);
        
        function resizeArray(arr, dims) {
            const acc = [];
            if (dims.length == 0) return arr.shift();
            for (let i = 0; i < dims[0]; i++) {
                acc.push(resizeArray(arr, dims.slice(1)));
            }
            return acc;
        }
        return new Matrix2D(resizeArray(data, dims));
    }

    /****************************************************** 
    * LOGGING & DEBUGGING
    ******************************************************/

    // Console-friendly logging of matrix data
    print() {
        console.table(this.data);
    }
}