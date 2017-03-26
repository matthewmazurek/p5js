var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Events = Matter.Events, Composite = Matter.Composite;
var engine, world, plinkos = [], pegs = [], bounds = [], wells = [], spaceX, spaceY, score = 0, gameOver = false;

// *************** SETTINGS ***************

var defaults = {
  cols: 11,
  rows: 10,
  plinkoSize: 0.4,
  pegSize: 0.2,
  maxPlinkos: 10,
  maxWellValue: 100,
  showTitle: false,
  showScore: true,
  auto: false,
  startWithIntro: true
}, settings;

// *************** SETUP ***************
function setup(options) {
  createCanvas(600,800);
  settings = Object.assign({}, defaults, options);
  settings.startWithIntro ? setupIntro() : setupGamePlay();
}

function setupIntro() {
  
  settings = Object.assign({}, defaults, {
    cols: 8,
    rows: 8,
    plinkoSize: 0.4,
    pegSize: 0.2,
    maxPlinkos: 100,
    showScore: false,
    showTitle: true,
    auto: true
  });

  engine = Engine.create();
  world = engine.world;
  spaceX = (width / settings.cols) * 1;
  spaceY = (height / settings.rows) * 0.65;
  
  // Setup pegs
  for (var j=0; j<settings.rows; j++) {
    for (var i=0; i<settings.cols; i++) {
      if (j % 2 && i == 0) continue;
      var x = (j % 2 ? 0 : spaceX / 2) + i * spaceX,
          y = spaceY * 2 + j * spaceY;
      new Peg(x, y);
    }
  }
  
}

function setupGamePlay() {
  
  gameOver = false;
  
  engine = Engine.create({
    enableSleeping: true
  });
  world = engine.world;
  plinkos = [];
  pegs = [];
  bounds = [];
  wells = [];
  spaceX = (width / settings.cols) * 1;
  spaceY = (height / settings.rows) * 0.65;
  
  // Setup bounds
  new Boundary(width/2, height-25, width, 50);
  for (var i=0; i<settings.cols; i++) {
    var w = 10,
        h = 150,
        x = i * spaceX + spaceX/2 - w/2;
    new Boundary(x + w/2, height - h/2, w, h);
  }
  
  // Setup pegs
  for (var j=0; j<settings.rows; j++) {
    for (var i=0; i<settings.cols; i++) {
      if (j % 2 && i == 0) continue;
      var x = (j % 2 ? 0 : spaceX / 2) + i * spaceX,
          y = spaceY * 2 + j * spaceY;
      new Peg(x, y);
    }
  }
  
  // Setup wells and well tracker
  var wellValues = Array(settings.cols-1).fill(settings.maxWellValue).map(function(e, i, a) {
    var midPoint = (a.length - 1) / 2;
    return e * Math.round(10 * (1 - Math.floor(Math.abs(midPoint - i))/(midPoint)))/10;
  });
  for (var i=1; i<settings.cols; i++) {
    var w = spaceX - 10,
        h = 75,
        x = i * spaceX - w/2;
    new Well(x + w/2, height - h/2 - 50, w, h, wellValues[i-1]);
  }
  
  var wellTracker = function(trigger) {
    return function(event) {
      var pairs = event.pairs;
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var a = pairs[i].bodyA,
            b = pairs[i].bodyB;
        wells.forEach(function(well) {
          if (a === well.body || b === well.body) {
            var plinko = a.label == 'Plinko' ? a : b.label == 'Plinko' ? b : null;
            if (plinko && !plinko.isSleeping) plinko.inWell = trigger ? well : null;
          }
        })
      }
    }
  }
  Events.on(engine, 'collisionStart', wellTracker(true));
  Events.on(engine, 'collisionEnd', wellTracker(false));
}

// *************** DRAW ***************

function draw() {
  
  // Check if Game Over
  if (settings.maxPlinkos - plinkos.length == 0 && worldIsSleeping()) {
    gameOver = true;
    setupIntro();
  }
  
  // Add new plinko every n frames
  if (frameCount % 2 == 0 && plinkos.length < settings.maxPlinkos && settings.auto) {
    new Plinko();
  }
  
  // Physics
  Engine.update(engine);
  
  // Begin drawing to cavas
  background(0);
  
  // Draw Plinkos
  for (var i=plinkos.length-1; i>=0; i--) {
    var plinko = plinkos[i];
    if (plinko.outOfBounds()) {
      plinko.removeFromWorld();
      plinkos.splice(i,1);
    }
    plinko.show();
  }
  // Draw Pegs
  if (!gameOver) pegs.forEach(function(e) { e.show() });
  
  // Draw Bounds
  bounds.forEach(function(e) {e.show() });
  
  // Draw wells and well score
  wells.forEach(function(e) {e.show() });
  
  // Display plinkos left and score
  if (settings.showScore && !gameOver) {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    text("PLINKOS", 50, 10);
    textSize(32);
    text(settings.maxPlinkos - plinkos.length, 50, 24);

    score = plinkos
      .map(function(plinko) { return plinko.score })
      .reduce(function(a, b){ return a + b }, 0);
    textAlign(RIGHT, TOP);
    textSize(12);
    text("SCORE", width - 50, 10);
    textSize(32);
    text(score, width - 50, 24);
  }
  
  // Game Over
  if (gameOver) {
    fill(255);
    textAlign(CENTER, BOTTOM);
    textSize(86);
    text("GAME OVER", width / 2, height / 2 - 25);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("HIGH SCORE", width / 2, height / 2);
    textAlign(CENTER, TOP);
    textSize(64);
    text(score, width / 2, height / 2 + 5);
  }
  
  // Display title text
  if (settings.showTitle && !gameOver) {
    fill(255);
    textAlign(CENTER, BOTTOM);
    textSize(128);
    text("PLINKOS", width / 2, height - 10);
    textSize(12);
    text("- CLICK TO START -", width / 2, height - 10);
  }
}

// *************** GLOBAL METHODS ***************

function mouseClicked() {
  if (settings.startWithIntro) {
    reset();
    setup({startWithIntro: false});
  } else if(gameOver) {
    reset();
    setup();
  } else {
    if (plinkos.length < settings.maxPlinkos) {
      new Plinko(mouseX, 0);
    }
  }
  // prevent default
  return false;
}

function worldIsSleeping() {
  var bodies = Composite.allBodies(world);
  var sleeping = bodies.filter(function(body) { return body.isSleeping });
  return bodies.length === sleeping.length;
}

function reset() {
  plinkos.forEach(function(plinko) {
    plinko.removeFromWorld();  
  })
  plinkos = [];
  score = 0;
}

// *************** CLASSES ***************

class Circle {
  constructor (x,y,r, options) {
    var defaults = {restitution: 0.5, friction: 0};
    var settings = Object.assign({}, defaults, options);
    this.body = Bodies.circle(x, y, r, settings);
    this.r = r;
    World.add(world, this.body);
  }
  show() {
    var pos = this.body.position;
    push();
      translate(pos.x, pos.y);
      ellipse(0, 0, this.r * 2);
    pop();
  }
  removeFromWorld() {
    World.remove(world, this.body);
  }
}

class Rect {
  constructor(x, y, w, h, options) {
    var defaults = {isStatic: true};
    var settings = Object.assign({}, defaults, options);
    this.body = Bodies.rectangle(x, y, w, h, settings);
    this.w = w;
    this.h = h;
    World.add(world, this.body);
  }
  show() {
    var pos = this.body.position;
    push();
      translate(pos.x, pos.y);
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    pop();
  }
}

class Plinko extends Circle {
  constructor(x, y) {
    x = x || round(random(0, width)*0.9);
    y = y || 0;
    var options = {};
    super(x, y, spaceX / 2 * settings.plinkoSize, options);
    this.body.label = 'Plinko';
    this.body.inWell = null;
    this.hue = random(1, 255);
    plinkos.push(this);
  }
  show() {
    colorMode(HSB);
    fill(this.hue, 255, 255);
    colorMode(RGB);
    noStroke();
    super.show();
  }
  outOfBounds() {
    var pos = this.body.position;
    if (pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height) {
      return true;
    }
    return false;
  }
  get score() {
    return this.body.inWell ? this.body.inWell.value : 0;
  }
}

class Peg extends Circle {
  constructor (x, y) {
    super(x, y, settings.pegSize * spaceX / 2, {isStatic: true});
    pegs.push(this);
  }
  show() {
    fill(255, 255, 255, 200);
    noStroke();
    super.show();
  }
}

class Boundary extends Rect {
  constructor (x, y, w, h) {
    super(x, y, w, h);
    bounds.push(this);
  }
  show() {
    fill(255, 255, 255, 150);
    noStroke();
     super.show();
  }
}

class Well extends Rect {
  constructor (x, y, w, h, value) {
    var options = {isSensor: true};
    super(x, y, w, h, options);
    this.value = value;
    wells.push(this);
  }
  show() {
    var pos = this.body.position;
    fill(0, 255, 255, 100);
    noStroke();
    // super.show();
    fill(255);
    textSize(12);
    textAlign(CENTER, BOTTOM);
    text(this.value, pos.x, pos.y);
  }
}