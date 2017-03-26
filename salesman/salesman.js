var cities;
var bruteForce;
var immutable;

function setup() {
  createCanvas(800, 800);
  frameRate(60);
  
  cities = new Cities(6);
  
  // Lexicographical permutation brute force
  bruteForce = new Optimize(cities, function(path) {
    var x = null, y = null;
    for (var i=path.length-1; i>=0; i--) {
      if (path[i] < path[i+1]) {
        x = i;
        break;
      }
    }
    if (x == null) path;
    for (var i=path.length; i>=0; i--) {
      if (path[x] < path[i]) {
        y = i;
        break;
      }
    }
    [path[x], path[y]] = [path[y], path[x]];
    var flip = path.splice(x+1);
    path = path.concat(flip.reverse());
    return path;
  });

  // Rotate
  immutable = new Optimize(cities, function(path) {
    return [].concat(path.splice(1), path);
  });
  
  
}

function draw() {
  background(51);
  cities.draw();
   bruteForce.draw();
   bruteForce.next();
//  immutable.draw();
//  immutable.next();
}

function Optimize(cities, fn) {
  
  this.cities = cities;
  this.path = new Path(this.cities.num());
  this.pathDistance = function() { return this.path.calcDistance(this.cities); };
  
  this.record = this.pathDistance();
  this.recordPath = new Path().update(this.path.idxs.slice(0));
  
  this.fn = fn;
  
  this.next = function() {
    this.path.update(this.fn(this.path.idxs));
    var distance = this.pathDistance();
    if (distance < this.record) {
      this.record = distance;
      this.recordPath.update(this.path.idxs.slice(0));
    }
  }
  
  this.draw = function() {
    this.path.draw(this.cities);
    this.recordPath.draw(this.cities, true);
  }
  
  this.print = function() {
    console.log('Current:', this.pathDistance(), this.path, 'Record', this.record, this.recordPath);
  }
  
}

function Cities(n) {
  
  this.locations = [];
  
  for (var i=0; i<n; i++) {
    var location = new p5.Vector(random(width), random(height));
    this.locations.push(location);
  }
  
  this.num = function () { return this.locations.length; }
  
  this.draw = function() {
    for (var i=0; i<this.locations.length; i++) {
      var location = this.locations[i];
      fill(150, 150, 255);
      noStroke();
      ellipse(location.x, location.y, 10, 10);
    }
  }
  
}

function Path(n) {
  
  this.idxs = new Array(n || 0)
    .fill(0)
    .map(function(_, i) {
      return i;
    });
  
  this.total = function(n) {
    n = n || this.idxs.length;
    return n == 1 ? 1 : n * this.total(n-1);
  }
  
  this.update = function(newIdxs) {
    this.idxs = newIdxs;
    return this;
  }
  
  this.draw = function(cities, highlight) {
    noFill();
    
    if (highlight) {
      strokeWeight(3);
      stroke(255, 255, 255, 200);
    }
    else {
      strokeWeight(1);
      stroke(255, 0, 255);
    }
    beginShape();
    for (var i=0; i<this.idxs.length; i++) {
      var location = cities.locations[this.idxs[i]];
      vertex(location.x, location.y);
    }
    endShape();
  }
  
  this.calcDistance = function(cities) {
    var distance = 0;
    for (var i=0; i<this.idxs.length-1; i++) {
      distance += dist(
        cities.locations[this.idxs[i]].x, cities.locations[this.idxs[i]].y,
        cities.locations[this.idxs[i+1]].x, cities.locations[this.idxs[i+1]].y
      );
    }
    return distance;
  }
  
  return this;
  
}