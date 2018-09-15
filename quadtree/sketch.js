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
  points = Array.from({length: 500}, () => {
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
  qtree.drawActive();

  let range = new Rectangle(mouseX, mouseY, 25, 25);
  // let range = new Circle(mouseX, mouseY, 10);
  
  // Draw look-up range
  range.draw()

  // Highlight point in look-up range
  // Using QuadTree.query to minimize search space
  strokeWeight(4);
  qtree.query(range).forEach(p => point(p.myx, p.myy));

}
