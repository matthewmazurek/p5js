let fb, birds = [], N, history = [], gen = 0, speed, player, myData, display_nn = true, stats = {};
function setup() {
  
  createCanvas(480, 640);

  speed = createSlider(1, 100, 1);
  speed.style('width', `${width - 50}`); 
  speed.position((width - speed.width) / 2, height - 25);

  N = 250; // population size
  fb = new FlappyBird();

  while (birds.length < N) birds.push(new Flappy(fb));

}

function trainTo(g) {
  console.log(`Training to generation ${g}...`);
  while (gen < g) {
    fb.update(false);
  }
  console.log('Training copmlete.');
}

function draw() {
  for (let i = 0; i < speed.value(); i++) {
    background(0);
    fb.update();
  }  
}

function keyPressed() {
  // if (keyCode == 32) player.flap();
}


function loadPopulation(file) {
  let pop = [];
  // json_file is expected to be an object array containing NeuralNetwork objects
  loadJSON(file, (json) => {
    Object.keys(json).forEach(key => {
      let obj = json[key];
      let nn = NeuralNetwork.from(obj);
      pop.push(new Flappy(fb, nn));
    });
    gen = 0;
    birds = pop;
  });
}

function savePopulation(pop) {
  return saveJSON(pop.map(bird => bird.nn));
}

class FlappyBird {
  constructor() {

    this.g = 0.5;
    this.f = 20;
    this.v = 2;
    this.pipeWidth = 40;
    this.pipeGap = 90;
    this.yMax = height - 100;
    this.pipesToLoad = 2;
    this.recordScore = 0;

    this.init();

  }
  init() {
    this.pipes = [];
    this.score = 0;
  }
  updateRecord(score) {
    this.recordScore = Math.max(this.recordScore, score);
  }
  update(updateCanvas = true) {

    this.score++;

    // load, update, and draw the pipes
    while (this.pipes.length < this.pipesToLoad) {
      const posX = this.pipes[0] && this.pipes[0].pos.x || width / 2;
      this.pipes.push(new Pipe(posX, this.v, this.pipeWidth, this.pipeGap));
    }
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      if (p.hasPassed) this.pipes.splice(i, 1);
      else {
        p.update();
        if (updateCanvas) p.draw();
      }
    }

    // update the birds
    const popAlive = birds.filter(bird => bird.alive);
    popAlive[0].updateStats = true;
    for (let bird of popAlive) {
      bird.think(this.pipes);
      bird.update();
      bird.constrain();
      bird.collide(this.pipes);
      if (updateCanvas) bird.draw();
    }

    // if all birds are dead... next generation!
    if (birds.filter(bird => bird.alive).length == 0) {
      gen++;
      // arrange birds by score, highest to lowest
      birds = birds.sort((a, b) => b.score - a.score);
      // genePool is top X%
      let genePool = birds.slice(0, Math.ceil(N / 10));
      let best = genePool[0];
      // set normalized fitness for each bird
      let topScore = best.score;
      genePool.forEach(bird => bird.fitness = bird.score ** 2 / topScore ** 2);
      // weighted random selection of birds to make up next gen
      let children = [];
      let fitnessSum = genePool.reduce((total, bird) => total += bird.fitness, 0);
      for (let i = 0; i < N; i++) {
        let r = Math.random() * fitnessSum;
        let choosen;
        for (let j = 0; j < genePool.length && r > 0; j++) {
          choosen = genePool[j];
          r -= genePool[j].fitness;
        }
        children.push(choosen.reproduce());
      }
      // Log the best bird and its lineage, update the record score
      history.push(best);
      this.updateRecord(best.score);
      // import the new generation
      birds = children;
      // reset
      this.init();
    }
 
    if (updateCanvas) this.showStats();

  }

  showStats() {
    fill(255);
    textSize(20);
    textAlign(LEFT);
    text(`Generation: ${gen}`, 25, height - 75);
    textAlign(RIGHT);
    text(`Score: ${this.score}`, width - 25, height - 75);
    textSize(16);
    text(`Record: ${this.recordScore}`, width - 25, height - 50);

    if (display_nn) {
      noStroke();
      fill(51, 200);
      rect(10, height / 2 - 25, width / 2 - 60, height / 2 - 75);
      fill(255);
      textSize(16);
      textAlign(LEFT);
      text('NN Details', 20, height / 2);
      textSize(12);
      text('Object ID', 20, height / 2 + 30);
      text('NN Inputs', 20, height / 2 + 80);
      // textSize(10);
      text('x_0:', 20, height / 2 + 100);
      text('x_1:', 20, height / 2 + 120);
      text('x_2:', 20, height / 2 + 140);
      text('x_3:', 20, height / 2 + 160);
      
      text('NN Output', 20, height / 2 + 190);
      text('y_0:', 20, height / 2 + 210);
      
      let meter_max = 120;
      
      fill(21);
      noStroke();
      rect(55, height / 2 + 100 - 6, meter_max, 5);
      rect(55, height / 2 + 120 - 6, meter_max, 5);
      rect(55, height / 2 + 140 - 6, meter_max, 5);
      rect(55, height / 2 + 160 - 6, meter_max, 5);
      rect(55, height / 2 + 210 - 6, meter_max, 5);
      
      fill(255, 200);
      if (stats.nn_id)
        text(stats.nn_id, 20, height / 2 + 50);
      if (stats.nn_input) {
        // console.log(stats.nn_input)
        let [x0, x1, x2, x3] = stats.nn_input.T.data[0];
        rect(55, height / 2 + 100 - 6, meter_max * x0, 5);
        rect(55, height / 2 + 120 - 6, meter_max * x1, 5);
        rect(55, height / 2 + 140 - 6, meter_max * x2, 5);
        rect(55, height / 2 + 160 - 6, meter_max * x3, 5);
      }
      if (stats.nn_output)
        if (stats.nn_output > 0.5) fill(0, 255, 0, 200);
        rect(55, height / 2 + 210 - 6, meter_max * stats.nn_output, 5);

    }
  }

}

class Flappy {
  constructor(fb, nn, parent) {
    this.fb = fb;
    this.nn = nn || new NeuralNetwork([4, 4, 1]);
    this.parent = parent || null;
    this.name = this.setName(parent ? parent.name : undefined);
    this.generation = gen;
    this.alive = true;
    this.score = 0;
    this.pos = createVector(width / 2, height / 2);
    this.vel = createVector(0);
    this.acc = createVector(0);
    this.r = 50;
    this.g = createVector(0, fb.g);
    this.f = createVector(0, -fb.f);
    this.updateStats = false;
  }
  setPlayer() { this.player = true; }
  setName(parentName) {
    return (parentName
      ? parentName.substring(0, 3)
      : 'AAA'.split('').map(l => String.fromCharCode(Math.random() * 26 + 65)).join(''))
    + '00'.split('').map(n => String.fromCharCode(Math.random() * 10 + 48)).join('');
  }
  lineage() {
    console.log(this);
    console.log(`Lineage '${this.name}' (gen = ${this.generation}, score = ${this.score})`);
    let parent = this.parent;
    while (parent != undefined) {
      console.log(`from ${parent.name} (gen = ${parent.generation}, score = ${parent.score})`);
      parent = parent.parent;
    }
    console.log('end of lineage.');
  }
  gravity() {
    this.acc.add(this.g);
  }
  flap() {
    this.acc.add(this.f);
  }
  constrain() {
    this.pos.y = constrain(this.pos.y, -this.r, this.fb.yMax);
  }
  collide(pipes) {
    if (
      this.pos.y >= this.fb.yMax ||
      pipes.some(p => p.collide(this))
    ) this.alive = false;
  }
  think(pipes) {

    const dist = pipe => pipe.pos.x - this.pos.x;
    const closestPipe = pipes
      .filter(p => dist(p) + p.w > 0)
      .sort((a, b) => dist(a) - dist(b))[0];

    pipes.forEach(pipe => pipe.setColor(0))
    closestPipe.setColor(1);

    const X = Matrix2D.fromArray([
      this.pos.y / this.fb.yMax,
      closestPipe.pos.x / width,
      (closestPipe.pos.y - closestPipe.gap) / this.fb.yMax,
      (closestPipe.pos.y + closestPipe.gap) / this.fb.yMax
    ]);
    const Y = this.nn.predict(X).data[0];

    if (this.updateStats) {
      stats.nn_id = this.name;
      stats.nn_input = X;
      stats.nn_output = Y;
    }

    if (Y > 0.5) this.flap();

  }
  update() {

    this.score++;
    this.gravity();

    this.vel.add(this.acc);
    this.vel.limit(10);
    this.pos.add(this.vel);

    this.constrain();

    this.acc.mult(0);

  }
  reproduce() {
    let mutStrength = 0.5;
    let child = new Flappy(
      this.fb,
      NeuralNetwork.from(this.nn).mutate(
        data => data + Math.randn(0, mutStrength)
      ),
      this
    );
    return child;
  }
  draw() {
    fill(255, 50);
    if (this.player) fill(0, 255, 0);
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
  }
}

class Pipe {
  constructor(prevX, gameVel, pipeWidth, pipeGap) {
    const startX = prevX + width / 1.5;
    const rangeY = [150, height - 250];
    this.pos = createVector(startX, random(...rangeY));
    this.w = pipeWidth;
    this.gap = pipeGap;
    this.v = gameVel;
    this.color = color(255, 255, 255);
  }
  get hasPassed() {
    return this.pos.x + this.w < 0;
  }
  collide(flappy) {
    return (
      (abs(flappy.pos.x - this.pos.x) < flappy.r / 2 + this.w) &&
      (abs(flappy.pos.y - this.pos.y) > this.gap - flappy.r / 2)
    );
  }
  update() {
    this.pos.x -= this.v;
  }
  setColor(a) {
    if (a) this.color = color(0, 255, 0);
    else this.color = color(255, 255, 255);
  }
  draw() {
    fill(this.color);
    rect(this.pos.x - this.w, 0, this.w * 2, this.pos.y - this.gap);
    rect(this.pos.x - this.w, this.pos.y + this.gap, this.w * 2, height - 100 - this.pos.y - this.gap);
  }
}

Math.randn = function(mean = 0, stdev = 1) {
	let x1, x2, rad, y1;
	do {
		x1 = 2 * this.random() - 1;
		x2 = 2 * this.random() - 1;
		rad = x1 * x1 + x2 * x2;
	} while(rad >= 1 || rad == 0);
	let c = this.sqrt(-2 * this.log(rad) / rad);
	return (x1 * c) * stdev + mean;
};