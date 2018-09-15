let cube, matrix, ones;

let a = 0;

function setup() {

  createCanvas(400, 400);
  cube = new Cube();
  cube.draw();

  matrix = new Matrix([[1, 2, 3], [4, 5, 6]]);

}

function draw() {
  background(0);
  translate(width/2, height/2);
  cube.draw();
  a += (2*PI)/(5*60);

}

class Cube {

  constructor(r = 200, c = new Matrix([[0, 0, 0]])) {
    this.vs = this.unitVertices.map(v => v.sub(c));
    this.edges = this.unitEdges;
    this.r = r;

  }

  get unitVertices() {
    let v = [];
    let x = [-1, 1], y = [-1, 1], z = [-1, 1];
    x.forEach(i => y.forEach(j => z.forEach(k => {
      v.push(new Matrix([[i, j, k]]));
    })));
    return v;
  }

  get unitEdges() {
    let edges = [], vs = this.unitVertices;
    for (let i=0; i<vs.length-1; i++) for (let j=i; j<vs.length; j++) {
      if (dist(vs[i].x, vs[i].y, vs[i].z, vs[j].x, vs[j].y, vs[j].z) == 2) {
        edges.push([i, j]);
      }
    }
    return edges;
  }

  draw() {

    const rotationXY = new Matrix([
      [cos(a), -sin(a), 0],
      [sin(a), cos(a), 0],
      [0, 0, 1]
    ]);

    const rotationXZ = new Matrix([
      [cos(a), 0, -sin(a)],
      [0, 1, 0],
      [sin(a), 0, cos(a)]
    ]);

    const rotationYZ = new Matrix([
      [1, 0, 0],
      [0, cos(a), -sin(a)],
      [0, sin(a), cos(a)]
    ]);

    function projection(pt) {
      const camera = 3;
      const dist = 1 / (camera - pt.z);
      return new Matrix([
        [dist, 0, 0],
        [0, dist, 0]]
      );
    }

    let pts = this.vs
      .map(v => rotationYZ.mult(v.T))
      .map(v => rotationXY.mult(v))
      .map(v => projection(v).mult(v))
      .map(v => v.mult(this.r));

    fill(255);
    stroke(255);

    pts.forEach((p, i) => {
      // ellipse(p.x, p.y, 5);
      text(i, p.x, p.y)
    });

    this.edges.map(i => [pts[i[0]], pts[i[1]]])
      .forEach(edge => {
        line(edge[0].x, edge[0].y, edge[1].x, edge[1].y);
      });

  // noLoop();

  }

}

class Matrix {

  constructor(arr2D) {
    this.data = arr2D;
  }

  static fromDims(dims, d = 0) {
    return new Matrix(
      dims.reverse().reduce((e, dim) => {
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
    return Matrix.fromDims(dims, 0);
  }

  static ones(dims) {
    return Matrix.fromDims(dims, 1);
  }

  get dims() {
    let dims = [], el = this.data;
    while (el instanceof Array) {
      dims.push(el.length);
      el = el[0];
    }
    return dims;
  }

  lookup(idx) {
    return idx.reduce((data, i) => data[i], this.data);
  }

  set(idx, data) {
    let last = idx.pop();
    this.lookup(idx)[last] = data;
  }

  get dataList() {

    function loop(arr, idx = []) {
      let res = [];  
      for (let i=0; i<arr.length; i++) {
        if (arr[i] instanceof Array) {
          res = res.concat(loop(arr[i], idx.concat([i])));
        } else {
          res.push({data: arr[i], idx: idx.concat([i])});
        }
      }
      return res;
    }

    return loop(this.data);

  }

  forEach(fn) {
    this.dataList.forEach(e => {
      fn(e.data, e.idx);
    });
  }

  add(m, sub = false) {
    let res = Matrix.zeros(this.dims);
    if (m instanceof Matrix) {
      if (m.dims.every((d, i) => this.dims[i] == d)) {
        this.forEach((data, idx) => res.set(idx, data + m.lookup(idx)));
      } else {
        throw Error('Matrix dimentions must match');
      }
    } else {
      this.forEach((data, idx) => res.set(idx, data + m * (sub ? -1 : 1)));
    }
    return res;
  }

  sub(m) {
    return this.add(m, true);
  }

  mult(m) {
    let res;
    if (m instanceof Matrix) {
      let dimsA = this.dims, dimsB = m.dims;
      if (dimsA.length == 2 && dimsB.length == 2 && dimsA[1] == dimsB[0]) {
        res = Matrix.zeros([dimsA[0], dimsB[1]]);
        for (let i=0; i<dimsA[0]; i++) for (let j=0; j<dimsB[1]; j++) for (let k=0; k<dimsA[1]; k++) {
          res.data[i][j] += this.data[i][k] * m.data[k][j];
        }
      } else {
        throw Error(`Matrix dimentions not compatible for multiplication ([${dimsA}] x [${dimsB}])`);
      }
    } else {
      res = Matrix.zeros(this.dims);
      this.forEach((data, idx) => res.set(idx, data * m));
    }
    return res;
  }

  get T() {

    let dims = this.dims;
    let transpose = Array.from({length: dims[1]}).map(() => []);

    for (let i = 0; i < dims[0]; i++) for (let j = 0; j < dims[1]; j++) {
      transpose[j].push(this.data[i][j]);
    }

    return new Matrix(transpose);

  }

  get x() { return this.dataList[0].data; }
  get y() { return this.dataList[1].data; }
  get z() { return this.dataList[2].data; }

}