// Cell object
//   * Cell.i - The x-coordinate of the tile
//   * Cell.j  - The y-coordinate of the tile
//   * Cell.grid - References the parent Grid object
//   * Cell.val - The value of the tile (default is 0)
//   * Cell.highlight - Highlight tiling if part of a a winning sequence

class Cell {

  constructor(i, j, grid, val) {

    this.i = i;
    this.j = j;
    this.grid = grid;
    this.highlight = false;

    // Set initial value and location
    this.drop(val);

  }

  // Set value (default 0) and set animation position above the grid
  drop(val) {
    this.val = val || 0;
    this.x = this.i * GSIZE;
    this.y = -GSIZE;
  }

  // Animate the tile falling to target position
  updatePos() {
    let speed = 0.25;
    let targetX = this.i * GSIZE;
    let targetY = this.j * GSIZE;
    this.x = lerp(this.x, targetX, speed);
    this.y = lerp(this.y, targetY, speed);
  }

  // Three methods are used to draw the disks, borders, and highlights
  // Ordered drawing allows the disks to fall behind the borders and highlights above
  drawDisk() {

    // falling animation
    this.updatePos();

    let scale = 0.6;
    let color = STYLES.disk[this.val];
    noStroke();
    fill(color);
    ellipse(this.x, this.y, GSIZE * scale, GSIZE * scale);

  }

  drawBorder() {
    let scale = 0.75;
    stroke(STYLES.background);
    strokeWeight(10);
    noFill();
    ellipse(this.i * GSIZE, this.j * GSIZE, GSIZE * scale, GSIZE * scale);
  }

  drawHighlight() {
    let scale = 0.75;
    stroke(STYLES.highlight);
    strokeWeight(4);
    noFill();
    ellipse(this.i * GSIZE, this.j * GSIZE, GSIZE * scale, GSIZE * scale);
  }

}
