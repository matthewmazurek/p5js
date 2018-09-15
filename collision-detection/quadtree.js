class RegPoint {
  constructor(p, obj) {
    this.x = p.x;
    this.y = p.y;
    this.o = obj;
  }
}

class Circle {
  constructor(x,y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.r2 = this.r ** 2;
  }

  contains(p) {
    let d2 = (p.x - this.x) ** 2 + (p.y - this.y) ** 2;
    return d2 <= this.r2;
  }

  intersects(range) {

    let dist_x = Math.abs(range.x - this.x);
    let dist_y = Math.abs(range.y - this.y);

    let r = this.r, w = range.w, h = range.h;

    // no intersection
    if (dist_x > (r + w) || dist_y > (r + h)) return false;

    // intersection inside range
    if (dist_x <= w || dist_y <= h) return true;

    let d2 = (dist_x - w) ** 2 + (dist_y - h) ** 2;

    // intersection on edge of circle and range
    return d2 <= r ** 2;

  }

  draw() {
    stroke(0, 255, 0);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }

}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    return (
      point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }

  draw() {
    stroke(0, 255, 0);
    rectMode(CENTER);
    rect(this.x, this.y, this.w * 2, this.h * 2);
  }

}

class QuadTree {

  constructor(boundary, n, map) {
    this.boundary = boundary || new Rectangle(width/2, height/2, width/2, height/2);
    this.capacity = n || 4;
    this.points = [];
    this.child = [];
    this.map = map || {x: (p) => p.x, y: (p) => p.y};
  }

  getMapping(p) {
    return {x: this.map.x(p), y: this.map.y(p)};
  }

  setMapping(map) {
    this.map = map;
  }

  setQueryMode(mode) {
    this.query_mode = mode;
  }

  subdivide() {

    // children order: NW, NE, SW, SE
    let x = this.boundary.x, y = this.boundary.y, w = this.boundary.w, h = this.boundary.h;
    let child_boundaries = [
      new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2),
      new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2),
      new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2),
      new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2)
    ];

    this.child = child_boundaries.map(boundary => new QuadTree(boundary, this.capacity));

  }

  register(p) {


    // Register multiple points
    if (arguments.length > 1) {
      return Array.from(arguments).forEach(p => this.register(p));
    }

    // If passing in an object, convert to point with reference to original obect
    p = p instanceof RegPoint ? p : new RegPoint(this.getMapping(p), p);

    // Point outside boundary
    if (!this.boundary.contains(p)) {
      return false;
    }

    // Add point to quadtree
    if (this.points.length < this.capacity) {
      this.points.push(p);
    }

    // At maximum capacity; divide quadtree and pass point to child
    else {
      if (!this.child.length) this.subdivide();
      this.child.find(quadtree => quadtree.register(p));
    }

    return true;

  }

  update() {

    // Reset datastructure
    this.points = [];
    this.child = [];

    this.register(...arguments);

  }

  query(range, found) {

    found = found || [];

    // Return if boundary is outside of quadtree range
    if (!range.intersects(this.boundary)) return [];
    
    // For debugging and visualization
    this.active = true;

    // Find quadtree points inside range
    this.points.forEach(point => {
      if (range.contains(point)) found.push(point.o);
    });

    // Find child quadtree points inside range
    if (this.child) this.child.forEach(quadtree => quadtree.query(range, found));

    return found;

  }

  draw() {

    // Draw bounding box
    stroke(255);
    noFill();
    strokeWeight(1);
    rectMode(CENTER);
    rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);

    // Draw children
    if (this.child.length) this.child.forEach(quadtree => quadtree.draw());

  }

  drawActive() {

    if (this.active) {

      this.active = false;
      // Draw bounding box
      stroke(0, 255, 0);
      noFill();
      strokeWeight(1);
      rectMode(CENTER);
      rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);

      // Draw children
      if (this.child.length) this.child.forEach(quadtree => quadtree.drawActive());

    }

  }

}
