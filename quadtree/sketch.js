let qtree, points = [];

class Point {
  constructor(x, y) {
    this.myx = x;
    this.myy = y;
  }
}

function setup() {

  createCanvas(800, 800);

  // Array of points
  points = Array.from({length: 3}, () => {
    let x = randomGaussian(width / 2, width / 8);
    let y = randomGaussian(height / 2, height / 8);
    return new Point(x, y);
  });

  // Instantiate quadtree and register points
  qtree = new QuadTree();
  qtree.setMapping({x: (p) => p.myx, y: (p) => p.myy})
  qtree.register(...points);

}

function draw() {

  background(0);
  stroke(255);

  // Draw all points
  strokeWeight(2);
  points.forEach(p => point(p.myx, p.myy));

  // Draw quadtree structure
  qtree.draw();

  // Draw look-up range
  stroke(0, 255, 0);
  rectMode(CENTER);
  let range = new Rectangle(mouseX, mouseY, 25, 25);
  rect(range.x, range.y, range.w * 2, range.h * 2);

  // Highlight point in look-up range
  // Using QuadTree.query to minimize search space
  strokeWeight(4);
  qtree.query(range).forEach(p => point(p.myx, p.myy));

}