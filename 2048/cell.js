// Cell object
//   * Cell.i - The x-coordinate of the tile
//   * Cell.j  - The y-coordinate of the tile
//   * Cell.grid - References the parent Grid object
//   * Cell.w - The value of the tile (default is 0)
class Cell {

  constructor(i, j, grid, w) {
    this.i = i;
    this.j = j;
    this.w = w || 0;
    this.grid = grid;
    this.x = this.i * GSIZE;
    this.y = this.j * GSIZE;
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

  updatePos() {
    let speed = 0.25;
    this.x = round(lerp(this.x, this.i * GSIZE, speed));
    this.y = round(lerp(this.y, this.j * GSIZE, speed));
  }

  // Each Cell is responsible for drawing itself (tile and grid border)
  // The borders are fixed, while the tiles translate with tweening
  // Theses methods are called by the tile's parent Grid
  drawTile() {
    this.updatePos();
    push();
      translate((width - (GSIZE * X_DIM)) / 2, (height - (GSIZE * Y_DIM)) / 2);
      noStroke();
      fill(TILE_STYLES[this.w].background);
      rect(this.x, this.y, GSIZE, GSIZE, GSIZE/10);
      if (this.w != 0) {
        textAlign(CENTER, CENTER);
        textSize(TILE_STYLES[this.w].size);
        fill(TILE_STYLES[this.w].color);
        noStroke();
        text(this.w, this.x + GSIZE/2, this.y + GSIZE/2);
      }
    pop();
  }

  drawBorder() {
    push();
      translate((width - (GSIZE * X_DIM)) / 2, (height - (GSIZE * Y_DIM)) / 2);
      strokeWeight(GSIZE/20);
      stroke(GRID_STYLES.stroke_color);
      noFill();
      rect(this.i * GSIZE, this.j * GSIZE, GSIZE, GSIZE, GSIZE/10);
    pop();
  }

}
