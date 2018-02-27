let grid, score;

const GSIZE = 100,
      FONT_SIZES = [64, 64, 48, 32],
      X_DIM = 4,
      Y_DIM = 4,
      INIT_TILES = [2, 2],
      GOAL_TILE = 2048;

function setup() {

  createCanvas(X_DIM * GSIZE * 1.05, Y_DIM * GSIZE * 1.05);

  score = 0;

  // Start a new X_DIM x Y_DIM game with INIT_TILES
  grid = new Grid(X_DIM, Y_DIM);
  INIT_TILES.forEach(tile_value => grid.add(tile_value));

}

function draw() {

  // Draw the grid and child cells
  background(GRID_STYLES.background);
  grid.draw();

  // Update score
  document.getElementById('score').textContent = score;
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
    console.log("Game Over!");
  }
  else if (grid.win) {
    console.log("You've won!");
  }
}
