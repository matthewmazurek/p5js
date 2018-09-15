let cube, matrix, ones;

let a = 0;

function setup() {

  createCanvas(400, 400);
  cube = new Cube();
  cube.draw();

  matrix = new Matrix2D([[1, 2, 3], [4, 5, 6]]);

}

function draw() {
  background(0);
  translate(width/2, height/2);
  cube.draw();
  a += (2*PI)/(5*60);

}

class Cube {

  constructor(r = 200, c = new Matrix2D([[0, 0, 0]])) {
    this.vs = this.unitVertices.map(v => v.sub(c));
    this.edges = this.unitEdges;
    this.r = r;

  }

  get unitVertices() {
    let v = [];
    let x = [-1, 1], y = [-1, 1], z = [-1, 1];
    x.forEach(i => y.forEach(j => z.forEach(k => {
      v.push(new Matrix2D([[i, j, k]]));
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

    const rotationXY = new Matrix2D([
      [cos(a), -sin(a), 0],
      [sin(a), cos(a), 0],
      [0, 0, 1]
    ]);

    const rotationXZ = new Matrix2D([
      [cos(a), 0, -sin(a)],
      [0, 1, 0],
      [sin(a), 0, cos(a)]
    ]);

    const rotationYZ = new Matrix2D([
      [1, 0, 0],
      [0, cos(a), -sin(a)],
      [0, sin(a), cos(a)]
    ]);

    function projection(pt) {
      const camera = 3;
      const dist = 1 / (camera - pt.z);
      return new Matrix2D([
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
        return this.map((data, row, col) => data + m.lookup(row, col));
      } else {
        throw Error('Matrix dimentions must match');
      }
    } else {
      return this.map((data) => data + m * (sub ? -1 : 1));
    }
  }

  sub(m) {
    return this.add(m, true);
  }

  mult(m) {
    if (m instanceof Matrix2D) {
      if (this.cols == m.rows) {
        let res = Matrix2D.zeros([this.rows, m.cols]);
        for (let i=0; i<this.rows; i++) for (let j=0; j<m.cols; j++) for (let k=0; k<this.cols; k++) {
          res.data[i][j] += this.data[i][k] * m.data[k][j];
        }
        return res;
      }
      else throw Error(`Matrix dimentions not compatible for multiplication ([${this.dims}] x [${m.dims}])`);
    }
    else return this.map(data => data * m);
  }

  get T() {
    let transpose = Array.from({length: this.cols}).map(() => []);
    for (let i = 0; i < this.rows; i++) for (let j = 0; j < this.cols; j++) {
      transpose[j].push(this.data[i][j]);
    }
    return new Matrix2D(transpose);
  }

  get x() { return this.dataList[0].data; }
  get y() { return this.dataList[1].data; }
  get z() { return this.dataList[2].data; }

}