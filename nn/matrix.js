class Matrix2D {

  // Construct a new matrix given a 2D array
  constructor(arr2D) {
    this.data = arr2D;
    [this.rows, this.cols] = this.dims;
  }

  // Construct a new matrix template of given dimentions
  // dims - an array of dimention sizes
  // d - the placeholder digit
  static fromDims(dims, d = 0) {
    return new Matrix2D(
      dims.reverse().reduce((e, dim) => {
        let res = [];
        if (e.length) {
          for (let i = 0; i < dim; i++) res.push(e.slice(0));
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

  // Returns an array of the dimentions of the matrix
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

  // Set the value of a matrix given a certain index array
  // idx is an array of indicies corresponding to the matrix dimentions
  set(idx, data) {
    let last = idx.pop();
    this.lookup(idx)[last] = data;
  }

  // Returns a one-dimentional list of all matrix data
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

  // Loops through all matrix data
  // f -  the function to be called for each data
  // eg. matrix.forEach((data, indx) => {})
  forEach(fn) {
    this.dataList.forEach(e => {
      fn(e.data, e.idx);
    });
  }

  // Returns a new matrix, the result of applying f to each element
  // eg. matrix.map((data, indx) => {})
  map(fn) {
    const m = Matrix2D.fromDims(this.dims);
    this.dataList.forEach(e => {
      m.set(e.idx, fn(e.data, e.idx));
    });
    return m;
  }

  // Returns a deep copy of the matrix
  copy() {
    return this.mult(1);
  }

  // Returns a new matrix, either
  // the result of matrix addition of this matrix and given matrix m
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

  // Reutrns the transposition of the current matrix
  get T() {
    let transpose = Array.from({ length: this.cols }).map(() => []);
    for (let i = 0; i < this.rows; i++) for (let j = 0; j < this.cols; j++) {
      transpose[j].push(this.data[i][j]);
    }
    return new Matrix2D(transpose);
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

  // Returns either new matrix, the result of summation along a given axis
  // or, if no axis is specified, the sum of the entire matrix
  sum(axis) {
    if (axis !== undefined) {
      return Matrix2D.fromDims(
        [axis == 0 ? this.rows : 1, axis == 1 ? this.cols : 1]
      )
        .map((_, [row, col]) =>
          this.slice(
            axis == 0 ? { row } : { col }
          ).dataList.reduce((acc, c) => acc + c.data, 0));
    }
    else return this.dataList.reduce((acc, c) => acc + c.data, 0);
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

  static fromArray(arr) {
    return new Matrix2D([arr]).T;
  }

  // Helper function to access the first elements of the matrix
  // Useful if treating a matrix like a vector of 1-3 dimentions
  get x() { return this.dataList[0].data; }
  get y() { return this.dataList[1].data; }
  get z() { return this.dataList[2].data; }

  print() {
    console.table(this.data);
  }
}