// 2048
// Original game by https://gabrielecirulli.github.io/2048/
// Inspired by Daniel Shiffman @shiffman
// Tutorial video https://www.youtube.com/watch?v=JSn-DJU8qf0
// Dependencies: grid.js, cell.js, styles.js

let grid, score = 0, bestscore = 0;

const GSIZE = 120,
      X_DIM = 4,
      Y_DIM = 4,
      INIT_TILES = [2, 2],
      GOAL_TILE = 2048;

function setup() {

  // create the p5js canvas and embed it in the parent DOM element
  let cnv = createCanvas(X_DIM * GSIZE, Y_DIM * GSIZE);
  cnv.parent('p5js-canvas');

  // add onclick functionality for new game button
  let newGame_btn = document.getElementById('restart-btn');
  newGame_btn.addEventListener("click", init);

  // start a new game
  init();

}

// Prevent default scrolling behaviour of arrow keys
window.addEventListener("keydown", e => {
  if([37, 38, 39, 40].indexOf(e.keyCode) > -1) e.preventDefault()
}, false);

function draw() {

  // Draw the grid and its tiles
  background(GRID_STYLES.background);
  grid.draw();

}

function init() {

  // Reset score
  getBestScore();
  setScore(0);

  // Clear game message
  displayMessage(undefined);

  // Start a new X_DIM x Y_DIM game with INIT_TILES
  grid = new Grid(X_DIM, Y_DIM);
  INIT_TILES.forEach(tile_value => grid.add(tile_value));

}

function setScore(val) {

  let score_el = document.getElementById('score');
  let bestscore_el = document.getElementById('bestscore');

  score = val;

  // Update best score
  if (score && score > bestscore) {
    bestscore = score;
    if (typeof(Storage) !== "undefined") localStorage.setItem("bestscore", bestscore);
  }

  score_el.textContent = score;
  bestscore_el.textContent = bestscore;

}

// Attempts to retrieve bestscore from the local storage variable
function getBestScore() {
  bestscore = (typeof(Storage) !== "undefined") ?
    localStorage.getItem("bestscore") || 0 : 0;
  bestscore = Math.max(score, bestscore);
}


function keyPressed() {

  let dir = undefined;
  if (keyCode === LEFT_ARROW) dir = 'left';
  if (keyCode === RIGHT_ARROW) dir = 'right';
  if (keyCode === UP_ARROW) dir = 'up';
  if (keyCode === DOWN_ARROW) dir = 'down';

  // On arrow-key press, perform one turn of play and add a new tile
  if (dir) {
    grid.operate(dir);
    grid.add();
  }

  // Check if game is over
  if (grid.gameOver) {
    displayMessage("Game Over!");
  }
  else if (grid.win) {
    displayMessage("You've won!");
  }
}

// Display game message on banner above the grid
function displayMessage(msg) {
  let notice = document.getElementById('notice');
  if (msg) {
    notice.children.item('p').innerHTML = `<strong>${msg}</strong>`;
    notice.style.display = 'block';
  }
  else {
    // hide game displayMessage
    notice.style.display = 'none';
  }
}
