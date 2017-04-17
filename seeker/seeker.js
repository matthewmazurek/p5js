let genes, vehicles = [], vehicleId = 0; food = [], poison = [], verbose = false;

// DNA


function setup () {
  
  createCanvas(640, 360);

  genes = new DNA();
  genes.addGene('foodSeek', -1, 1);
  genes.addGene('foodPerception', 10, 300);
  genes.addGene('poisonSeek', -1, 1);
  genes.addGene('poisonPerception', 10, 300);
  genes.addGene('maxSpeed', 0, 8);
  genes.addGene('fecundity', 0.0005, 0.0025);
  genes.addGene('r', 3, 10);
  
  // vehicles
  while (vehicles.length < 10) new Vehicle(genes);
  
  while (food.length < 25) new Food();
  while (poison.length < 25) new Poison();
  
}

function draw () {
  
  background(51);
  let target = {pos: createVector(mouseX, mouseY)};
  fill(127);
  stroke(200);
  strokeWeight(2);
  ellipse(target.pos.x, target.pos.y, 48, 48);

  // add vehicles
  while (vehicles.length < 5) new Vehicle(genes);
  
  // add food and poison
//  while (food.length < 25) new Food();
//  while (poison.length < 25) new Poison();
  Food.spawn();
  Poison.spawn();
  
  // update vehicles
  vehicles.forEach((vehicle, i) => {
    
    vehicle.behaviours();
    vehicle.boundaries();
    vehicle.update();
    
    if (vehicle.expired) {
      new Food(vehicles[i].pos);
      vehicle.report(`expired at the age of ${vehicle.age}, after eating ${vehicle.itemsConsumed} food items and producing ${vehicle.numChildren} progeny.`);
      vehicles.splice(i, 1);
    }
    else vehicle.display();    
    
  })
  
  food.forEach(i => i.display());
  poison.forEach(i => i.display());
  
  
}

function mousePressed() {

  let closest = -1, record = 100;
  vehicles.forEach((vehicle, i) => {
    vehicle.selected = false;
    let dist = vehicle.pos.dist(createVector(mouseX, mouseY));
    if (dist < record) {
      record = dist;
      closest = i;
    }
  });
  if (closest > -1) vehicles[closest].selected = true;
  else {
    new Vehicle(genes, createVector(mouseX, mouseY));
  }
}

const sigma = x => 1 / (1 + exp(-x));


class Vehicle {
  constructor(genes, pos, dna) {
    
    this.acc = createVector(0, 0);
    this. vel = createVector(0, -2);
    this.pos = pos || createVector(random(width), random(height));
    
    // Genes
    //this.maxSpeed = (0, 6);
    //this.foodSeek = (-1, 1);
    //this.foodPerception = (30, 300);
    //this.poisonSeek = (-1, 1);
    //this.poisonPerception = (30, 300);
    //this.fecundity = (0, 0.001);
    //this.r = (3, 10);
    
    this.f
    this.maxForce = 0.2;

    this.selected = false;
    
    this.id = vehicleId++;
    this.health = 1;
    this.age = 0;
    this.numChildren = 0;
    this.itemsConsumed = 0;
    
    this.genes = genes;
    this.dna = dna || genes.randomDNA();
    genes.phenotype(this, this.dna);

    this.report('came into existence');
    
    vehicles.push(this);
    
  }
  
//  randomDNA() {
//    return Array.from({length: Object.keys(targetList).length * 2}, () => random(0, 1));
//  }
  
//  phenotype() {
//    this.dna.forEach((g, i) => {
//      switch (i % Object.keys(targetList).length) {
//        case 0: this.seekingForces.push(
//          map(g, 0, 1, -1, 1)
//        ); break;
//        case 1: this.perceptionRadii.push(
//          map(g, 0, 1, 10, 300)
//        ); break;
//      }
//    })
//  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.health -= 0.0025;
    this.age++;
    this.replicate();
  }
  
  replicate() {
    let prob = this.health * sigma(this.age/100) * this.fecundity;
    if (random() < prob) {
      let child = new Vehicle (this.genes, this.pos.copy(), this.genes.mutateDNA(this.dna));
      this.report(`replicated to produce child ID${child.id}`)
      child.vel = this.vel.copy().mult(-1);
      this.numChildren++;
    }
  }
  
  behaviours () {
    
    let steer;
    
    // food
    steer = this.eat(food, this.foodPerception);
    steer.mult(this.foodSeek);
    this.applyForce(steer);
    
    // poison
    steer = this.eat(poison, this.poisonPerception);
    steer.mult(this.poisonSeek);
    this.applyForce(steer);
    
  }
  
  seek(target) {
    let desired = p5.Vector.sub(target.pos, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  eat (targets, perception) {
    let closest = -1, record = Infinity;
    targets.forEach((f, i) => {
      let d = this.pos.dist(f.pos);
      if (d < record && d < perception) {
        closest = i;
        record = d;
      }
    });
    if (record < this.r) {
      this.health = min(this.health + targets[closest].nutrition, 1);
      this.itemsConsumed++;
      this.report(`consumed item with nutritional value ${targets[closest].nutrition}`);
      targets.splice(closest, 1);
    }
    return targets[closest] ? this.seek(targets[closest]) : createVector(0, 0);
  }
  
  get expired () {
    return this.health <= 0;
  }
  
  get outOfBounds() {
    return this.pos.x < 0 || this.pos.y < 0 || this.pos.x > width || this.pos.y > height;
  }
  
  get mouseOver() {
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) < 100;
  }
  
  boundaries() {
    
    if  (!this.outOfBounds) return;
    
    let desired = this.vel.copy();
    if (this.pos.x < 0) desired.x = this.maxSpeed;
    if (this.pos.x > width) desired.x = -this.maxSpeed;
    if (this.pos.y < 0) desired.y = this.maxSpeed;
    if (this.pos.y > height) desired.y = -this.maxSpeed;
    
    desired.normalize()
    desired.mult(this.maxSpeed);
    
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
    
  }
  
  report(...msg) {
    if (this.selected || verbose) console.log(`Vehicle ID${this.id}`, ...msg);
  }
  
  display() {

    let col = {
      maxHealth: color(0, 255, 0),
      minHealth: color(255, 0, 0),
      food: color(0, 255, 0),
      poison: color(255, 0, 0)
    };
    col.health = lerpColor(col.minHealth, col.maxHealth, this.health);
    
    push();
    translate(this.pos.x, this.pos.y);
    
    if (this.mouseOver || this.selected) {
      fill(255);
      noStroke();
      textSize(12);
      text(`ID: ${this.id} \nAGE: ${this.age} \nHEALTH: ${round(this.health * 100)}`, 25, 25);
    }
    
    rotate(this.vel.heading() + PI / 2);
    
    if (this.mouseOver || this.selected) {
      strokeWeight(1);
      noFill();
      
      // draw food indicators
      stroke(col.food);
      line(0, 0, 0, -this.foodSeek * 100);
      ellipse(0, 0, this.foodPerception*2, this.foodPerception*2);
      
      // draw poison indicators
      stroke(col.poison);
      line(0, 0, 0, -this.poisonSeek * 100);
      ellipse(0, 0, this.poisonPerception*2, this.poisonPerception*2);
      
    }
    
    stroke(200);
    fill(col.health);
    beginShape();
    vertex(0, -this.r*2);
    vertex(-this.r, this.r*2);
    vertex(this.r, this.r*2);
    endShape(CLOSE);
    
    
    
    pop();
    
    
  }
  
}


class Target {
  constructor(pos, nutrition, col, spawnRate, max) {
    this.pos = pos || createVector(random(width), random(height));
    this.nutrition = nutrition;
    this.col = col;
    this.spawnRate = spawnRate;
    this.max = max;
  }
  display() {
    fill(...this.col);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 6, 6);
  }
}

class Food extends Target{
  constructor(pos) {
    super(pos, 0.25, [0, 255, 0]);
    food.push(this);
  }
  static spawn() {
    if (random() < 0.05 && food.length <= 50) new Food();
  }
}

class Poison extends Target{
  constructor(pos) {
    super(pos ,-0.25, [255, 0, 0]);
    poison.push(this);
  }
  static spawn() {
    if (random() < 0.01 && poison.length <= 25) new Poison();
  }
}

class DNA {
  constructor() {
    this.genes = [];
  }
  addGene(name, min, max) {
    this.genes.push({name, min, max});
  }
  randomDNA() {
    return Array.from({length: this.genes.length}, () => random(0, 1));
  }
  phenotype(obj, dna) {
    this.genes.forEach((gene, i) => {
      obj[gene.name] = map(dna[i], 0, 1, gene.min, gene.max);
    });
  }
  mutateDNA(dna) {
    return dna.map(g => bound(g + normal(0, 0.05), 0, 1));
  }
  
}

const normal = (m = 0, sd = 1) => {
  let u = 1 - Math.random(), v = 1 - Math.random();
  return sd * Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) + m;
}

const bound = (x, mn, mx) => min(max(mn, x), mx);
