let particles = [], qtree, numParticles = 500;

const PARTICLE_SIZE = 4,
      PARTICLE_WOBBLE = 1,
      DRAW_QTREE = true;
      // NUM_PARTICLES = 1000;

function setup() {

  // frameRate(1);
  createCanvas(600, 600);

  // Instantiate quadtree and set mapping of (x, y) properties
  qtree = new QuadTree();

  $frameRate = createP();
  $withQuadTree = createCheckbox('use quadtree data structure', true);
  // $withQuadTree.checked(true);
  $withQuadTree.changed(function() {
    qtree = this.checked() ? new QuadTree() : undefined;
  });
  $numParticles = createP(`particles: ${numParticles}`);
  $numParticleSlider = createSlider(1, 1000, numParticles)
    .input(function() {
      numParticles = this.value();
      $numParticles.html(`particles: ${numParticles}`); 
    });

}


function draw() {

  background(51);

  // Ensure there are numParticles on screen
  while (particles.length < numParticles)
    particles.push(new Particle());

  while (particles.length > numParticles)
    particles.pop();

  // Update particles
  particles.forEachR((p, i) => p.update(i));

  // update QuadTree will re-register particles and positions
  if (qtree) qtree.update(...particles);

  // Draw QuadTree structure
  if (DRAW_QTREE && qtree) qtree.draw();

  // Draw particles
  particles.forEach(p => p.draw());

  // Update frame rate meter
  if(random() < 0.2) $frameRate.html(`framerate: ${Math.floor(frameRate())}`);

}

// Identical to starndard Array.forEach, but in reverse order
// Prevents indexing errors if elements are removed during loop
Array.prototype.forEachR = function(fn, self) {
  for (let i = this.length - 1; i >= 0; i--) {
    fn.apply(self, [this[i], i, this]);
  }
}

class Particle {
  constructor(o) {
    o = o || {};
    this.x = o.x || random(width);
    this.y = o.y || random(height);
    this.r = o.r || PARTICLE_SIZE;
  }
  wobble() {
    this.x += randomGaussian() * PARTICLE_WOBBLE;
    this.y += randomGaussian() * PARTICLE_WOBBLE;
  }
  get outOfBounds() {
    return (
      (this.x - this.r < 0 || this.x + this.r > width) ||
      (this.y - this.r < 0 || this.y + this.r > height)
    );
  }
  get collision() {
    let boundary = new Circle(this.x, this.y, this.r * 2),
        neighbours;
    if (qtree) {
      neighbours = qtree
        .query(boundary)
        .filter(p => p != this);
    }
    else {
      neighbours = particles
      .filter(p => p != this)
      .map(n => new Circle(n.x, n.y, n.r))
      .filter(n => boundary.contains(n));
    }
    return (neighbours.length);
  }
  update(i) {
    this.wobble();
    if (this.outOfBounds) particles.splice(i, 1);
  }
  draw() {
    let hasCollided = this.collision;
    hasCollided ? fill(255) : fill(255, 255, 255, 50);
    noStroke();
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }
}