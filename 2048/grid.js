// Grid object
//   * Grid.xdim - The x-dimention (width in tiles) of the grid
//   * Grid.ydim - The y-dimention (height in tiles) of the grid
//   * Grid.el - A 2D-array containing the grid tiles as Cell objects
class Grid {

  constructor(xdim, ydim) {

    // Dimentions of grid are independently controlled
    this.xdim = xdim;
    this.ydim = ydim;

    // Populate the grid elements with new Cells
    this.el = Array.from({
      length: ydim
    }, (row, j) => Array.from({
      length: xdim
    }, (cell, i) => {
      // new Cell with incides (i, j)
      return new Cell(i, j, this);
    }));

  }

  // Returns a flattened array of all grid elements (Cells)
  get el_list() {
    return [].concat.apply([], this.el);
  }

  // Add a new valued tile to the grid if space available
  add(w) {
    let options = this.el_list.filter(cell => cell.w == 0);
    if (options.length) {
      random(options).updateValue(w || (random(1) > 0.1 ? 2 : 4));
    }
  }

  // Set the game state from a 2D value array (for debugging purposes only)
  setGridFromArray(arr) {
    arr.forEach((row, j) => row.forEach((val, i) => {
      this.el[j][i].updateValue(val);
    }));
  }

  // Completes one turn of play, given a direction (left, right, up, or down)
  operate(dir) {

    // save the current state of the grid as a deep copy
    let save_state = this.el_list.map(cell => new Cell(cell.i, cell.j, cell.grid, cell.w));

    this.slide(dir);
    this.combine(dir);
    this.slide(dir);

    // returns true if the game state has changed
    return !(this.el_list.every((cell, i) => cell.w == save_state[i].w));

  }

  // Slides tiles in the given direction
  slide(dir) {

    // If sliding up/down, transpose the grid matrix
    let transpose = (dir == 'up' || dir == 'down');
    if (transpose) this.transpose();

    // Using sort to pull valued tiles in front of zeros or push behind
    this.el.forEach(row => row.sort((a, b) => {
      if (dir == 'left' || dir == 'up') return b.w != 0;
      else return b.w == 0;
    }));

    // Undo the transposition if previously applied
    if (transpose) this.transpose();

    // Update the tile indices to reflect the array transformations
    else this.reindex();

  }

  // Tiles of the same value are combined
  combine(dir) {

    // If combining up/down, transpose the grid matrix
    let transpose = (dir == 'up' || dir == 'down');
    if (transpose) this.transpose();

    // Reset merged state for all tiles
    this.el_list.forEach(cell => cell.hasMerged = false);

    this.el.forEach((row, j) => row.forEach((cell, i) => {

      // For valued tiles, select orthogonal neighbour in the direction of play
      if (cell.w != 0) {

        let n = cell.neighbours.filter(n =>
          n.j == j &&
          ((dir == 'left' || dir == 'up') && n.i > i ||
            ((dir == 'right' || dir == 'down') && n.i < i))
        ).filter(n => n.w != 0)[0];

        // If tile and neighbour have common values, combine and update score
        // hasMerged check fixes combine bug (eg. [0, 2, 2, 4] -> [0, 0, 0, 8])
        if (n && n.w == cell.w && !n.hasMerged) {
          cell.updateValue(cell.w + n.w);
          cell.hasMerged = true;
          n.updateValue(0);
          setScore(score + cell.w);
        }

      }
    }));

    // Undo the transposition if previously applied
    if (transpose) this.transpose();

  }

  // Updates the tile indices to reflect the current array positions
  reindex() {
    this.el.forEach((row, j) => row.forEach((cell, i) => {
      cell.i = i;
      cell.j = j;
    }));
  }

  // Transposes the grid (rows <-> cols) and updates cell indices
  // This method is used by the Grid.slide and Grid.combine methods
  transpose() {
    let el = Array.from({
      length: this.xdim
    }, (row, j) => Array.from({
      length: this.ydim
    }, (cell, i) => {
      return this.el[i][j];
    }));
    this.el = el;
    [this.xdim, this.ydim] = [this.ydim, this.xdim];
    this.reindex();
  }

  // Game is over when grid is full and no valid moves available
  get gameOver() {
    return !(
      this.el_list.filter(cell => cell.w == 0).length ||
      this.el_list
      .map(cell => cell.neighbours.filter(n => n.w == cell.w))
      .some(nn => nn.length)
    );
  }

  // Conversely, the game is won when the 2048 has been created
  get win() {
    return this.el_list.some(cell => cell.w == GOAL_TILE);
  }

  // Grid is drawn by calling the draw method of each cell
  draw() {

    // Draw the blank tiles first (this avoid glitches during animation)
    this.el_list.filter(cell => cell.w == 0).forEach(cell => cell.drawTile());
    this.el_list.filter(cell => cell.w != 0).forEach(cell => cell.drawTile());

    // Borders are drawn last to keep things looking clean
    this.el_list.forEach(cell => cell.drawBorder());
  }

}
