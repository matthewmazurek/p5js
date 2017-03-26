var cols, rows, grid = [],
    mazeColor, stackColor, highlightColor,
    current, stack = [];

var w = 20,
    drawCount = 0;


// ***** SETUP *****

function setup() {
  
  // frameRate(60);
  
  mazeColor = color(255);
  highlightColor = color(0, 255, 150);
  stackColor = color(0, 0, 255, 100);
  
  createCanvas(401, 401);
  cols = floor(width / w);
  rows = floor(height / w);

  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      grid.push(new Cell(i, j));
    }
  }

  current = grid[0];
  
}


// ***** DRAW *****

function draw() {
  
  current.visited = true;
  current.highlight = true;
  
  if (drawCount % 1 === 0) {
    background(51);
    grid.forEach(function (cell) {
      cell.show();
    });
  }
  current.highlight = false;
  
  var next = current.checkNeighbours();
  if (next) {
    stack.push(current);
    current.inStack = true;
    removeWalls(current, next);  
    current = next;
  } else {
    if (stack.length) {
      current = stack.pop();
      current.inStack = false;
    }
    else {
      // Final sketch
      background(255);
      grid.forEach(function (cell) {
        cell.show();
      });
      noLoop();
    }
  }
  
  drawCount++;
}


// ***** CELL *****

function Cell(i, j) {
  this.i = i;
  this.j = j;

  this.visited = false;
  this.inStack = false;
  this.highlight = false;
  
  this.x = this.i * w;
  this.y = this.j * w;
  
  this.sides = {
    top:    [this.x, this.y, this.x + w, this.y],
    right:  [this.x + w, this.y, this.x + w, this.y + w],
    bottom: [this.x, this.y + w, this.x + w, this.y + w],
    left:   [this.x, this.y, this.x, this.y + w]
  }
  
  this.walls = {
    top: true,
    right: true,
    bottom: true,
    left: true
  }
  
  this.checkNeighbours = function() {
    
    var neighbours = [
      grid[index(this.i, this.j - 1)],
      grid[index(this.i + 1, this. j)],
      grid[index(this.i, this.j + 1)],
      grid[index(this.i - 1, this.j)]           
    ]
    .filter(function(neighbour) { return neighbour && !neighbour.visited; });
    
    return neighbours.length ? neighbours[floor(random(0, neighbours.length))] : undefined;
    
  }
  
  this.show = function () {

    if (this.visited) {
      fill(mazeColor);
      noStroke();
      rect(this.x, this.y, w, w);
    }
    
    stroke(0);
    Object.keys(this.sides)
      .filter(function(side) { return this.walls[side]; }, this)
      .map(function(e) { return this.sides[e]; }, this)
      .forEach(function(side) { line(...side); });
    
    if (this.inStack) {
      fill(stackColor);
      noStroke();
      rect(this.x, this.y, w, w);
    }
    
    if (this.highlight) {
      fill(highlightColor);
      noStroke();
      rect(this.x, this.y, w, w);
    }
    
  }
}


// Returns the index of a 1D array from a 2D parameter, (i cols, j rows)
function index(i, j) { return i >= 0 && i < cols && j >= 0 && j < rows ? i + j * cols : -1; }

// Remove walls (current, next)
function removeWalls (a, b) {
  [a, b].forEach(function(c, i, arr) {
    c.walls.top = c.walls.top && c.j <= arr[(i+1) % arr.length].j;
    c.walls.right = c.walls.right && c.i >= arr[(i+1) % arr.length].i;
    c.walls.bottom = c.walls.bottom && c.j >= arr[(i+1) % arr.length].j;
    c.walls.left = c.walls.left && c.i <= arr[(i+1) % arr.length].i;
  });
}