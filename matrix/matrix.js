var symbolSize = 20, streams = [];

function setup() {
  // createCanvas(window.innerWidth, window.innerHeight);
  createCanvas (800, 600);
  textSize(symbolSize);
  var x = 0, numStreams = width/symbolSize;
  for (var i=0; i<numStreams; i++) {
    streams.push(new Stream(x, random(-500, 500)));
    x += symbolSize;
  }
}

function draw() {
  background(0, 0, 0, 80);
  streams.forEach(function(stream) {
    stream.draw();
  });
}

class Symbol {
  constructor(x, y, speed, first) {
    this.x = x;
    this.y = y;
    this.value;
    this.speed = speed;
    this.interval = floor(random(2, 20));
    this.first = first && random(1) > 0.6;
    this.setRandom();
  }
  setRandom() {
    this.value = String.fromCharCode(
      0x30A0 + round(random(0, 96))
    );
  }
  rain() {
    this.y = this.y >= height ? 0 : this.y + this.speed;
  }
}

class Stream {
  constructor(x, y) {
    this.symbols = [];
    this.length = floor(random(15, 35));
    this.speed = random(2, 7);
    this.generateSymbols(x, y);
  }
  generateSymbols(x, y) {
    for (var i = 0; i < this.length; i++) {
      this.symbols.push(new Symbol(x, y, this.speed, i == 0));
      y -= symbolSize;
    }
  }
  draw() {
    this.symbols.forEach(function(symbol) {
      symbol.rain();
      if (symbol.first) fill(200, 255, 200, 200);
      else fill(0, 255, 70);
      text(symbol.value, symbol.x, symbol.y);
      if (frameCount % symbol.interval == 0) symbol.setRandom();
    });
  }
}