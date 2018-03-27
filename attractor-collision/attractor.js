class Particle {

  constructor(x, y) {
    this.pos = createVector(x || random(width), y || random(height));
    this.prev = this.pos.copy();
    this.vel = createVector(); // p5.Vector.random2D();
    this.acc = createVector();
    this.lifeSpan = random(10) * frameRate();
  }

  get boundary() {
    return new Rectangle(this.pos.x, this.pos.y, PARTICLE_SIZE, PARTICLE_SIZE);
  }

  update() {

    // Save a copy of the previous position for drawing
    this.prev = this.pos.copy();

    // Update particle physics
    this.vel.add(this.acc);
    this.vel.limit(5);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifeSpan--;

  }

  draw() {

    stroke(255);
    strokeWeight(PARTICLE_SIZE / 2);
    line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);

    // Draw bounding box
    // stroke(0, 255, 0);
    // strokeWeight(1);
    // rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);

  }

  attractedTo(attractor) {

    // Attraction is in direction of attractor
    let force = p5.Vector.sub(attractor.pos, this.pos);

    // Attraction strength follows bounded inverse-square law
    let d = force.mag();
    d = constrain(d, 1, 50);
    let strength = ATTRACTION * attractor.m / (d * d);
    force.setMag(strength);

    // Change to repulsive force if too close
    if (d < PARTICLE_SIZE) force.mult(-1);

    // Update acceleration
    this.acc.add(force);

  }

  // Collision imparts a force on the particle that is proportional to the
  // tangential component of the colliding particle's velocity
  collideWith(p) {
    let force = p5.Vector.sub(p.pos, this.pos);
    let strength = p.vel.dot(force);
    force.setMag(-strength * HARDNESS);
    this.acc.add(force);
  }

}


class Attractor extends Particle {
  constructor(x, y) {
    super(x, y);
    this.vel = 0;
    this.acc = 0;
    this.m = 1;
  }
  draw() {
    noStroke();
    fill(0, 255, 0);
    ellipse(this.pos.x, this.pos.y, PARTICLE_SIZE / 2, PARTICLE_SIZE /2);
  }
}
