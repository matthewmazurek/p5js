let cube, matrix, ones;

function setup() {

  createCanvas(400, 400);

  cube4d = new Cube4D();
  matrix = new Matrix2D([[1, 2, 3], [4, 5, 6]]);

}

function draw() {
  background(0);
  translate(width/2, height/2);
  cube4d.draw();

}

class Cube {

  constructor(r = 200, c = new Matrix2D([[0, 0, 0]])) {
    this.vs = this.unitVertices; //.map(v => v.sub(c));
    this.edges = this.unitEdges;
    this.r = r;

  }

  get unitVertices() {
    let vs = [];
    let x = [-1, 1], y = [-1, 1], z = [-1, 1];
    x.forEach(i => y.forEach(j => z.forEach(k => {
      vs.push([i, j, k]);
    })));
    return new Matrix2D(vs);
  }

  get unitEdges() {
    let edges = [];
    for (let i=0; i<this.vs.rows-1; i++) for (let j=i; j<this.vs.rows; j++) {
      if (dist(this.vs.x(i), this.vs.y(i), this.vs.z(i), this.vs.x(j), this.vs.y(j), this.vs.z(j)) == 2) {
        edges.push([i, j]);
      }
    }
    return edges;
  }

  draw() {

    let angle = frameCount / 60;
    let projection = new Projection(this)
      // .rotate('rotation4dXY', angle)
      // .rotate('rotationXZ', angle)
      // .rotate('rotationXY', angle)
      // .perspective()
      .scale(this.r)
      .draw();

    console.log(projection);
    noLoop();

  }

}

class Cube4D extends Cube {
  constructor(r, c){
    super(r, c);
  }
  get unitVertices() {
    let vs = [];
    let w = [-1, 1], x = [-1, 1], y = [-1, 1], z = [-1, 1];
    w.forEach(h => x.forEach(i => y.forEach(j => z.forEach(k => {
      vs.push([w, i, j, k]);
    }))));
    return new Matrix2D(vs);
  }
}

class Matrix2D {

  constructor(arr2D) {
    this.data = arr2D;
    [this.rows, this.cols] = this.dims;
  }

  static fromDims(dims, d = 0) {
    return new Matrix2D(
      dims.slice(0, 2).reverse().reduce((e, dim) => {
        let res = [];
        if (e.length) {
          for (let i=0; i<dim; i++) res.push(e.slice(0));
        } else {
          res = Array.from({length: dim}).fill(d);
        }
        return res;
      }, [])
    );
  }

  static zeros(dims) {
    return Matrix2D.fromDims(dims, 0);
  }

  static ones(dims) {
    return Matrix2D.fromDims(dims, 1);
  }

  get dims() {
    let dims = [], el = this.data;
    while (el instanceof Array) {
      dims.push(el.length);
      el = el[0];
    }
    return dims;
  }

  lookup(row, col) {
    return this.data[row][col];
  }

  set(row, col, data) {
    this.data[row][col] = data;
  }

  get dataList() {
    let res = [];
    for (let i = 0; i < this.rows; i++) for (let j = 0; j < this.cols; j++) {
      res.push({data:this.data[i][j], row:i, col:j});
    }
    return res;
  }

  forEach(fn) {
    this.dataList.forEach(e => {
      fn(e.data, e.row, e.col);
    });
  }

  map(fn) {
    let res = Matrix2D.zeros(this.dims);
    this.dataList.forEach(e => {
      res.set(e.row, e.col, fn(e.data, e.row, e.col));
    });
    return res;
  }

  add(m, sub = false) {
    if (m instanceof Matrix2D) {
      if (m.rows == this.rows && m.cols == this.cols) {
        // matrix addition
        return this.map((data, row, col) => data + m.lookup(row, col));
      } else if (m.rows == this.rows && m.cols == 1) {
        // matrix cols broadcasted to fit this.cols
        return this.map((data, row, col) => data + m.lookup(row, 0));
      } else if (m.cols == this.cols && m.rows == 1) {
        //  matrix rows broadcasted to fit this.cols
        return this.map((data, row, col) => data + m.lookup(0, col));
      } else {
        // matrix dimention mismatch
        throw Error('Matrix dimentions must match');
      }
    } else {
      // element-wise addition
      return this.map((data) => data + m * (sub ? -1 : 1));
    }
  }

  sub(m) {
    return this.add(m, true);
  }

  mult(m) {
    if (m instanceof Matrix2D) {
      if (this.cols == m.rows) {
        // matrix multiplication (dot product)
        let res = Matrix2D.zeros([this.rows, m.cols]);
        for (let i=0; i<this.rows; i++) for (let j=0; j<m.cols; j++) for (let k=0; k<this.cols; k++) {
          res.data[i][j] += this.data[i][k] * m.data[k][j];
        }
        return res;
      }
      else throw Error(`Matrix dimentions not compatible for multiplication ([${this.dims}] x [${m.dims}])`);
    }
    // element-wise multiplication
    else return this.map(data => data * m);
  }

  get T() {
    let transpose = Array.from({length: this.cols}).map(() => []);
    for (let i = 0; i < this.rows; i++) for (let j = 0; j < this.cols; j++) {
      transpose[j].push(this.data[i][j]);
    }
    return new Matrix2D(transpose);
  }

  copy() {
    return this.mult(1);
  }

  slice(by = {}) {
    let [row, col] = [by.row, by.col];
    let res = [];
    for (let i=0; i<this.rows; i++) {
      if (row == undefined || row == i) {
        res.push([]);
        for (let j=0; j<this.cols; j++) {
          if (col == undefined || col == j) res[res.length-1].push(this.data[i][j]); 
        }
      }
    }
    return new Matrix2D(res);
  }

  x(row = 0) { return this.data[row][0]; }
  y(row = 0) { return this.data[row][1]; }
  z(row = 0) { return this.data[row][2]; }

}

class Projection {
  constructor(cube) {
    this.vs = cube.vs.copy();
    this.edges = cube.edges;
  }

  apply(m) {
    this.vs = this.vs.mult(m); // [8, 3] x [3, 3]
    return this;
  }
  scale(s) {
    this.vs = this.vs.mult(s);
    return this;
  }
  rotate(r, a) {
    return this.apply({
      rotationXY: new Matrix2D([
        [cos(a), -sin(a), 0],
        [sin(a), cos(a), 0],
        [0, 0, 1]
      ]),
      rotationXZ: new Matrix2D([
        [cos(a), 0, -sin(a)],
        [0, 1, 0],
        [sin(a), 0, cos(a)]
      ]),
      rotationYZ: new Matrix2D([
        [1, 0, 0],
        [0, cos(a), -sin(a)],
        [0, sin(a), cos(a)]
      ]),
      rotation4dXY: new Matrix2D([
        [cos(a), -sin(a), 0, 0],
        [sin(a), cos(a), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ])
    }[r]);
  }
  perspective(camera = 3) {
    let res = [];
    for (let i=0; i<this.vs.rows; i++) {
      const v = this.vs.slice({row: i});
      const dist = 1 / (camera - v.z());
      const perspective = new Matrix2D([
        [dist, 0, 0],
        [0, dist, 0]]);
      res.push(v.mult(perspective.T).data[0]) // [1, 3] x [3, 2]
    }
    this.vs = new Matrix2D(res);
    return this;
  }
  draw() {

    fill(255);
    stroke(255);

    for (let i=0; i<this.vs.rows; i++) {
      ellipse(this.vs.x(i), this.vs.y(i), 5);
      text(i, this.vs.x(i), this.vs.y(i));
    }

    this.edges.forEach(edge => {
        line(this.vs.x(edge[0]), this.vs.y(edge[0]), this.vs.x(edge[1]), this.vs.y(edge[1]));
      });
    return this;
  }
}
