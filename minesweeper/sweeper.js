const size = 15, numMines = 20;
let ms;

function setup() {
  createCanvas(401, 401);
  ms = new Field(size, numMines);
  document.addEventListener('contextmenu', event => event.preventDefault());
}

function draw() {
  background(255);
  ms.draw();
}

function mouseReleased() {
  ms.click(mouseButton);
}

class Field {
  constructor(size, numMines) {
    this.size = size;
    this.numMines = numMines;
    this.score = {
      wins: 0,
      losses: 0
    }
    this.timer = {};
    // this.grid, this.mines, this.gameOver = false
    this.newGame();
  }
  newGame() {
    this.grid = this.newGrid(size);
    // setup timer
    this.timer.start = new Date();
    // we will place the mines once the user makes the first move
    this.mines = undefined;
    this.gameOver = false;
  }
  newGrid(size) {
    let w = floor(width/size);
    return Array.from({length: size}, (row, j) => Array.from({length: size}, (cell, i) => {
      return new Cell (i, j, w, this);
    }));
  }
  placeMines(safe) {
    this.mines = new Set();
    while (this.mines.size < this.numMines + (safe ? 1 : 0)) {
      let i = floor(random(this.size)), j = floor(random(this.size));
      this.mines.add(this.grid[j][i]);
    }
    this.mines.forEach(cell => cell.mine = safe == cell ? false : true);
  }
  click(btn) {
    this.grid.some(row => row.some(cell => cell.contains(mouseX, mouseY) ? (() => {
      this.move(cell, btn);
    })() || true : false));
  }
  move(cell, btn) {
    if (this.gameOver) this.newGame();
    else if (btn == 'left') {
      // place mines on first move
      if (!this.mines) this.placeMines(cell);
      // clicking on an unrevealed cell will reveal it
      if (!cell.revealed) cell.reveal();
      // clicking on a revealed cell will reveal its neighbours
      else cell.revealNeighbours();
      // check for win
      if (!this.gameOver && this.gridComplete) this.win();
    }
    else if (mouseButton == 'right') cell.flag();
  }
  draw() {
    this.grid.forEach(row => row.forEach(cell => cell.draw()));
    if (this.gameOver) {
      push()
        fill(0, 0, 0, 100);
        rect(0, 0, width, height);
        fill(255);
        textAlign(CENTER, CENTER);
        text(this.gameOverMsg, width / 2, height / 2);
    }
  }
  get gridComplete() {
    return this.grid.every(row => row.every(cell => cell.mine || cell.revealed));
  }
  finish(msg) {
    this.gameOver = true;
    this.timer.stop = new Date();
    let t = Math.ceil((this.timer.stop - this.timer.start)/1000);
    this.gameOverMsg = `${msg}
Time elapsed: ${t} sec
Wins: ${this.score.wins} | Losses: ${this.score.losses}`;
  }
  win() {
    this.score.wins++;
    this.finish('You win!');
  }
  lose() {
    this.score.losses++;
    this.finish('Hit a mine! Game over!');
  }
  
}

class Cell {
  constructor(i, j, w, field) {
    this.i = i;
    this.j = j;
    this.x = i * w;
    this.y = j * w;
    this.w = w;
    this.field = field;
    this.mine = false;
    this.revealed = false;
    this.flagged = false;
    this.nMines = undefined;
  }
  contains(x, y) {
    return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
  }
  reveal() {
    this.flagged = false;
    this.revealed = true;
    if (this.mine) this.field.lose();
    else if (this.neighbouringMines == 0) {
      this.neighbours.forEach(neighbour => {
        if (!neighbour.revealed && !neighbour.mine && !neighbour.flagged) {
          neighbour.reveal();
        }
      });
    }
    return true;
  }
  revealNeighbours() {
    this.neighbours.forEach(neighbour => {
      if (!this.field.gameOver && !neighbour.revealed && !neighbour.flagged) neighbour.reveal();
    });
  }
  flag() {
    this.flagged = this.flagged ^ (this.revealed ^ true);
  }
  get neighbours() {
    let res = [];
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        let J = this.j + j,
            I = this.i + i;
        if (i || j) res.push(this.field.grid[J] && this.field.grid[J][I]);
    }
    return res.filter(e => e);
  }
  get neighbouringMines() {
    this.nMines = this.nMines || this.neighbours
      .filter(cell => cell.mine)
      .length;
    return this.nMines;
  }
  draw() {
    
    let hw = this.w / 2;

    if (this.revealed) {
      
      noStroke();
      fill(220);
      rect(this.x, this.y, this.w, this.w);  
      
      // mine
      if (this.mine) {
        fill(0);
        ellipse(this.x + hw, this.y + hw, hw, hw);
      }
      
      // safe
      else {
        if (this.neighbouringMines > 0) {
          noStroke();
          fill(0);
          textSize(16);
          textAlign(CENTER, CENTER);
          text(this.neighbouringMines, this.x + hw, this.y + hw);
        }
      }
      
    } else if (this.flagged) {
      push()
        noStroke();
        fill(225, 0, 0);
        rectMode(CENTER);
        rect(this.x + hw, this.y + hw, hw / 2, hw / 2);
      pop();
      
    }

    // draw grid
    noFill();
    stroke(0);
    rect(this.x, this.y, this.w, this.w);
    
  }
}