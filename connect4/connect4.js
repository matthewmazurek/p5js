// Connect 4
// Inspired by Daniel Shiffman (@shiffman)
// Tutorial video https://www.youtube.com/watch?v=JSn-DJU8qf0
// Dependencies: grid.js, cell.js

let grid;

const W = 480, XDIM = 7, YDIM = 6, CONNECT = 4, PLAYERS = ['1', '2'];
const GSIZE = Math.round(W/XDIM); // Grid size is calculated based on fixed W and dimentions

const STYLES = {
  disk: {
    '0': '#AD1F4E',
    '1': '#12EAEA',
    '2': '#B0DB43',
    '3': '#E82A69'
  },
  background: '#9B1C46',
  light: '#0A2D54',
  color: '#F2AB91',
  highlight: '#FFF047'
};

function setup() {

  // create the p5js canvas and embed it in the parent DOM element
  let cnv = createCanvas(W, W * (YDIM/XDIM));
  cnv.parent('p5js-canvas');

  // add onclick functionality for new game button
  let newGame_btn = document.getElementById('restart-btn');
  newGame_btn.addEventListener("click", init);

  // start a new game
  init();

}

function draw() {

  // Draw the grid and its disks
  background(STYLES.background);
  grid.draw();

}

// Starts a new game
function init() {

  // Clear game message
  displayMessage(undefined);

  // Start a new XDIM x YDIM gamme
  grid = new Grid(XDIM, YDIM);

}

// Play next player's piece in the column clicked
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let I = floor(mouseX / width * XDIM), J = floor(mouseY / height * YDIM);
    grid.play(I);
  }
}

// Updates the turn display element
function setTurn(player) {

  let el_container = document.getElementById('turn-container');
  let el_text = document.getElementById('turn-text');

  el_container.style.background = STYLES.disk[player];
  el_text.textContent = `P${player} to play`;

}

// Display game message on banner above the grid
function displayMessage(msg) {

  let notice = document.getElementById('notice');

  if (msg) {
    notice.children.item('p').innerHTML = `${msg}`;
    notice.style.display = 'block';
  } else {
    // hide game displayMessage
    notice.style.display = 'none';
  }

}
