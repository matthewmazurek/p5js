let ms;

function setup() {
  createCanvas(401, 401);
  ms = new MineSweeper(10, 10, 1);
  document.addEventListener('contextmenu', event => event.preventDefault());
}

function draw() {
  background(0);
  ms.draw();
}

function mouseReleased() {
  ms.click(mouseButton);
}

class MineSweeper {

  constructor(cols, rows, numMines) {
    this.cols = cols;
    this.rows = rows;
    this.w = floor(width / this.cols);
    this.h = floor(height / this.rows);
    this.numMines = numMines;
    this.mineSize = 0.5;
    this.textSize = 0.75;
    // this.cells = Array.from({length: this.height}, (i) => i);
    this.newGame();
  }

  newGame() {
    this.gameOver = false;
    this.mines = undefined;
    this.cells = Array.from({length: this.rows}, (row, j) => Array.from({length: this.cols}, (cell, i) => new Cell(i, j, this)));
    this.placeMines();
  }

  placeMines() {
    this.mines = new Set();
    while (this.mines.size < this.numMines) {
      let i = floor(random(this.cols)), j = floor(random(this.rows));
      this.mines.add(this.cells[j][i]);
    }
    this.mines.forEach(cell => cell.isMine = true);
  }

  click(btn) {
    this.cells.some(row => row.some(cell => cell.contains(mouseX, mouseY) ? (() => {
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

  get gridComplete() {
    return this.cells.every(row => row.every(cell => cell.isMine || cell.revealed));
  }

  win() {
    this.gameOver = true;
    console.log('You win!');
  }

  loose() {
    this.gameOver = true;
    this.cells.forEach(row => row.forEach(cell => cell.revealed = true));
    console.log('You loose!');
  }

  draw() {
    this.cells.forEach(row => row.forEach(cell => cell.draw()));
  }

}

class Cell {
  constructor(i, j, grid) {
    this.i = i;
    this.j = j;
    this.grid = grid;
    this.pos = {x: this.grid.w * this.i, y: this.grid.h * this.j};
    this.revealed = false;
    this.isMine = false;
    this.flagged = false;
    this.count = undefined;
  }

  get neighbours() {
    let res = [];
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        let J = this.j + j,
            I = this.i + i;
        if (i || j) res.push(this.grid.cells[J] && this.grid.cells[J][I]);
    }
    return res.filter(e => e);
  }

  contains(x, y) {
    return (x > this.pos.x && x < this.pos.x + this.grid.w &&
      y > this.pos.y && y < this.pos.y + this.grid.h);
  }

  reveal() {
    if (this.isMine) {
      this.grid.loose();
      return;
    }
    else {
      this.revealed = true;
      this.count = this.neighbours.filter(n => n.isMine).length;
      if(this.count == 0) this.neighbours.filter(n => !n.revealed).forEach(n => n.reveal());
    }
  }

  revealNeighbours() {
    this.neighbours.filter(n => !n.revealed && !n.flagged).forEach(n => n.reveal());
  }

  flag() {
    this.flagged = !this.flagged;
  }

  draw() {
    
    let c = {
      x: this.pos.x + this.grid.w / 2,
      y: this.pos.y + this.grid.h / 2
    };

    if (this.revealed) {

      fill('#ddd');
      rect(this.pos.x, this.pos.y, this.grid.w, this.grid.h);

      if (this.isMine) {
        fill('#555');
        ellipse(c.x, c.y, this.grid.w * this.grid.mineSize, this.grid.h * this.grid.mineSize);
      }
      else if(this.count) {

        let lineHeight = this.grid.w * this.grid.textSize;
        let tw = textWidth(this.count);

        fill('#000');
        textSize(lineHeight);
        text(this.count, c.x - tw / 2, c.y + lineHeight / 3);
      }
    }
    else {

      fill('#fff');
      rect(this.pos.x, this.pos.y, this.grid.w, this.grid.h);

      if(this.flagged) {
        fill('red');
        ellipse(c.x, c.y, this.grid.w * this.grid.mineSize, this.grid.h * this.grid.mineSize);
      }

    }
  }
}