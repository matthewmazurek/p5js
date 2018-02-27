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
    this.el = Array.from({length: ydim}, (row, j) => Array.from({length: xdim}, (cell, i) => {
      // new Cell with incides (i, j)
      return new Cell (i, j, this);
    }));
    // console.log(xdim, ydim, this.el);

  }

  // Returns a flattened array of all grid elements (Cells)
  get el_list() {
    return [].concat.apply([], this.el);
  }

  // Add a new valued tile to the grid if space available
  add(w) {
    let options = this.el_list.filter(cell => cell.w == 0);
    if (options.length) {
      random(options).w = w || (random(1) > 0.1 ? 2 : 4);
    }
  }

  // Completes one turn of play, given a direction (left, right, up, or down)
  operate(dir) {
    this.slide(dir);
    this.combine(dir);
    this.slide(dir);
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
    this.reindex();

  }

  // Tiles of the same value are combined
  combine(dir) {

    // If combining up/down, transpose the grid matrix
    let transpose = (dir == 'up' || dir == 'down');
    if (transpose) this.transpose();

    this.el.forEach((row, j) => row.forEach((cell, i) => {

      // For valued tiles, select orthogonal neighbours in the direction of play
      if (cell.w != 0) {

        let n = cell.neighbours.filter(n =>
          n.j == j &&
          ((dir == 'left' || dir == 'up') && n.i > i ||
          ((dir == 'right' || dir == 'down') && n.i < i))
        ).filter(n => n.w != 0)[0];

        // If tile and neighbour have common values, combine and update score
        if (n && n.w == cell.w) {
          cell.w += n.w;
          n.w = 0;
          score += cell.w;
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
    let el = Array.from({length: this.xdim}, (row, j) => Array.from({length: this.ydim}, (cell, i) => {
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

  get win() {
    return this.el_list.some(cell => cell.w == GOAL_TILE);
  }

  // Grid is drawn by calling the draw method of each cell
  draw() {
    this.el_list.forEach(cell => cell.drawTile());
    this.el_list.forEach(cell => cell.drawBorder());
  }

}
