// Cell object
//   * Cell.i - The x-coordinate of the tile
//   * Cell.j  - The y-coordinate of the tile
//   * Cell.grid - References the parent Grid object
//   * Cell.w - The value of the tile (default is 0)
//   * Cell.style_code - Determines the styling of the tile as per styles.js
//   * Cell.hasMerged - Boolean to prevent multiple combines during one turn of play
class Cell {

  constructor(i, j, grid, w) {
    this.i = i;
    this.j = j;
    this.grid = grid;
    this.hasMerged = false;
    this.size = 1;
    this.updateValue(w);
  }
  
  updateValue(w) {
    
    this.w = w || 0;
    
    // Style code determines tile color, text size
    // Will start to loop after the 2048 tile
    this.style_code = w ? 2**(Math.log2(this.w/2) % 11 + 1) : 0;
    
    // Skip animation sequence if this tile is now blank
    if (this.w == 0) this.moveToTarget();
    
  }
  
  // Returns orthogonal neighbouring tiles
  get neighbours() {
    let res = [{
      j: -1,
      i: 0
    }, {
      j: 0,
      i: -1
    }, {
      j: 0,
      i: 1
    }, {
      j: 1,
      i: 0
    }].map(n => {
      let J = this.j + n.j,
        I = this.i + n.i;
      return this.grid.el[J] && this.grid.el[J][I];
    });
    return res.filter(e => e);
  }

  merge(n) {
    this.updateValue(this.w + n.w);
    this.hasMerged = true;
    this.size = 2;
    this.background = color('#fff');
  }

  // Tile positions are animated using linear interpolation every draw cycle
  updatePos() {
    let speed = 0.25;
    this.x = round(lerp(this.x, this.i * GSIZE, speed));
    this.y = round(lerp(this.y, this.j * GSIZE, speed));
  }

  updateSize() {
    let speed = 0.25;
    this.size = lerp(this.size, 1, speed);
  }

  // Likewise, the colors are animated to allow the 'burst' effect for new tiles
  updateColor(col) {
    if (col) this.background = color(col);
    else {
      let speed = 0.1;
      let targetFill = color(TILE_STYLES[this.style_code].background);
      this.background = lerpColor(color(this.background), targetFill, speed);
    }
  }

  // Immediately moves the tile to position and updates color, skipping any animation
  moveToTarget() {
    this.x = this.i * GSIZE;
    this.y = this.j * GSIZE;
    this.size = 1;
    this.background = color(TILE_STYLES.init_color);
  }
  
  // Each Cell is responsible for drawing itself (tile and grid border)
  // The borders are fixed, while the tiles translate with tweening
  // Theses methods are called by the tile's parent Grid
  drawTile() {
    
    // Animate position and color
    this.updatePos();
    this.updateSize();
    this.updateColor();
    
    // Tiles are drawn according to the styles.js style sheet
    push();
    translate((width - (GSIZE * X_DIM)) / 2, (height - (GSIZE * Y_DIM)) / 2);
    noStroke();
    fill(this.background);
    rectMode(CENTER);
    rect(this.x + GSIZE / 2, this.y + GSIZE / 2, this.size * GSIZE, this.size * GSIZE, GSIZE / 10);
    if (this.w != 0) {
      textAlign(CENTER, CENTER);
      textSize(TILE_STYLES[this.style_code].size)
      textFont(GRID_STYLES.font_face);
      fill(TILE_STYLES[this.style_code].color);
      noStroke();
      text(this.w, this.x + GSIZE / 2, this.y + GSIZE / 2);
    }
    pop();
  }

  // Borders are drawn separately to appear as if the tiles are sliding underneath
  drawBorder() {
    push();
    translate((width - (GSIZE * X_DIM)) / 2, (height - (GSIZE * Y_DIM)) / 2);
    strokeWeight(GSIZE / 10);
    stroke(GRID_STYLES.stroke_color);
    noFill();
    rect(this.i * GSIZE, this.j * GSIZE, GSIZE, GSIZE, GSIZE / 10);
    pop();
  }

}
