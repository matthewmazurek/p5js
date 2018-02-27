// Cell object
//   * Cell.i - The x-coordinate of the tile
//   * Cell.j  - The y-coordinate of the tile
//   * Cell.grid - References the parent Grid object
//   * Cell.w - The value of the tile (default is 0)
//   * Cell.hasMerged - Boolean to prevent multiple combines during one turn of play
class Cell {

  constructor(i, j, grid, w) {
    this.i = i;
    this.j = j;
    this.w = w || 0;
    this.grid = grid;
    this.hasMerged = false;
    this.moveToTarget();
  }

  // Returns orthogonal neighbouring tiles
  get neighbours() {
    let res = [{j: -1, i: 0}, {j: 0, i: -1}, {j: 0, i: 1}, {j: 1, i: 0}].map(n => {
      let J = this.j + n.j,
          I = this.i + n.i;
      return this.grid.el[J] && this.grid.el[J][I];
    });
    return res.filter(e => e);
  }

  // Tile positions are animated using linear interpolation every draw cycle
  updatePos() {
    let speed = 0.25;
    this.x = round(lerp(this.x, this.i * GSIZE, speed));
    this.y = round(lerp(this.y, this.j * GSIZE, speed));
  }

  // Likewise, the colors are animated to allow the 'burst' effect for new tiles
  updateColor(col) {
    if (col) this.background = color(col);
    else {
      let speed = 0.1;
      let targetFill = color(TILE_STYLES[this.w].background);
      this.background = lerpColor(color(this.background), targetFill, speed);
    }
  }

  // Immediately moves the tile to position and updates color, skipping any animation
  moveToTarget() {
    this.x = this.i * GSIZE;
    this.y = this.j * GSIZE;
    this.background = color(TILE_STYLES.init_color);
  }

  // Each Cell is responsible for drawing itself (tile and grid border)
  // The borders are fixed, while the tiles translate with tweening
  // Theses methods are called by the tile's parent Grid
  drawTile() {

    // Animate position and color
    this.updatePos();
    this.updateColor();

    // Tiles are drawn according to the styles.js style sheet
    push();
      translate((width - (GSIZE * X_DIM)) / 2, (height - (GSIZE * Y_DIM)) / 2);
      noStroke();
      fill(this.background);
      rect(this.x, this.y, GSIZE, GSIZE, GSIZE/10);
      if (this.w != 0) {
        textAlign(CENTER, CENTER);
        textSize(TILE_STYLES[this.w].size)
        textFont(GRID_STYLES.font_face);
        fill(TILE_STYLES[this.w].color);
        noStroke();
        text(this.w, this.x + GSIZE/2, this.y + GSIZE/2);
      }
    pop();
  }

  // Borders are drawn separately to appear as if the tiles are sliding underneath
  drawBorder() {
    push();
      translate((width - (GSIZE * X_DIM)) / 2, (height - (GSIZE * Y_DIM)) / 2);
      strokeWeight(GSIZE/10);
      stroke(GRID_STYLES.stroke_color);
      noFill();
      rect(this.i * GSIZE, this.j * GSIZE, GSIZE, GSIZE, GSIZE/10);
    pop();
  }

}
