let particles = [], attractors = [], qtree;

const NUM_ATTRACTORS = 5,
      NUM_PARTICLES = 150,
      PARTICLE_SIZE = 10,
      ATTRACTION = 50,
      HARDNESS = 0.5;
      DRAW_QTREE = true;


function setup() {

  createCanvas(600, 600);

  // Instantiate quadtree and set mapping of (x, y) properties
  qtree = new QuadTree();
  qtree.setMapping({x: (p) => p.pos.x, y: (p) => p.pos.y});

  // Add attractors
  while (attractors.length < NUM_ATTRACTORS)
    attractors.push(new Attractor());

}


function draw() {

  background(51);

  // Top-up number of particles to max of NUM_PARTICLES
  while (particles.length < NUM_PARTICLES)
    particles.push(new Particle());

  // update QuadTree will re-register particles and positions
  qtree.update(...particles);

  // Update and draw each particle
  particles.forEachR(function(p, i) {

    // Remove particles at end of lifeSpan
    if (p.lifeSpan <= 0) particles.splice(i, 1);

    else {

      // Attract particle to ALL attractors
      attractors.forEach(attractor => p.attractedTo(attractor));

      // Particle collides with neighbours
      let neighbours = qtree.query(p.boundary);
      neighbours.forEach(neighbour => p.collideWith(neighbour));

      // Update particle physics and draw to screen
      p.update();
      p.draw();

    }

  });

  // Draw attractors to screen
  attractors.forEach(attractor => attractor.draw());

  // Draw QuadTree structure
  if (DRAW_QTREE) qtree.draw();

}

// Add attractor on mouse click
function mousePressed() {
  attractors.push(new Attractor(mouseX, mouseY));
}

// Identical to starndard Array.forEach, but in reverse order
// Prevents indexing errors if elements are removed during loop
Array.prototype.forEachR = function(fn, self) {
  for (let i = this.length - 1; i >= 0; i--) {
    fn.apply(self, [this[i], i, this]);
  }
}
