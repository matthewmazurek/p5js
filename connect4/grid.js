// Grid object
//   * Grid.xdim - The x-dimention (width in tiles) of the grid
//   * Grid.ydim - The y-dimention (height in tiles) of the grid
//   * Grid.el - A 2D-array containing the grid tiles as Cell objects
//   * Grid.toPlay - The index of the current player
//   * Grid.over - Boolean indicating if the game is over

class Grid {

  constructor(xdim, ydim) {

    this.xdim = xdim;
    this.ydim = ydim;

    // Fill the grid with new empty cells (disks)
    this.el = Array.from({length: ydim}, (row, j) => Array.from({length: xdim}, (cell, i) => {
      return new Cell(i, j, this);
    }));

    // Player 1 up
    this.over = false;
    this.toPlay = 0;
    setTurn(PLAYERS[this.toPlay]);

  }

  // Searches for winning sequence in all directions given last cell played
  // If found, returns an array containing the winning sequence of cells
  win(play) {

    let I = play.i, J = play.j, V = play.val;

    // slicing directions
    let search = [
      (i, j) => i == I,         // vertical
      (i, j) => j == J,         // horizontl
      (i, j) => i - j == I - J, // diagonal-left
      (i, j) => i - I == J - j  // diagonal-right
    ];

    let res = search

      // slice along each directions
      .map(condition => this.slice(condition))

      // get contigous sequences of disks
      .map(line => Grid.group_contiguous(line))

      // filter
      .map(contigs => contigs.filter(seg =>
        // only the ones for the current player
        seg[0].val == V &&
        // only the ones with at least 4 in a row
        seg.length >= CONNECT)

      ).filter(arr => arr.length)[0];

    // return the first winning sequence found
    return res ? res[0] : false;

  }

  // Given an array of cells, will group elements into contiguous cells of the same value
  // eg. [1, 1, 2, 2, 2, 2, 0] -> [[1, 1], [2, 2, 2, 2], [0]]
  static group_contiguous(arr) {
    return arr.reduce((a, c) => {
      let lastSet = a[a.length - 1];
      if (lastSet && lastSet[lastSet.length - 1].val == c.val) lastSet.push(c);
      else a.push([c]);
      return a;
    }, []);
  }

  // Returns a flattened array of all grid elements (Cells)
  get el_list() {
    return [].concat.apply([], this.el);
  }

  // Slices the 2D grid into a 1D directional array based on a condition fn
  slice(condition) {
    return this.el_list.filter(cell => condition(cell.i, cell.j));
  }

  // Current player plays in column I
  play(I) {

    // Only move if the game isn't over
    if (this.over) return false;

    // Clear previous game messages
    displayMessage(undefined);

    // Attempt to play piece
    let played = this.add(I, PLAYERS[this.toPlay]);

    if (played) {

      // Check for win
      let win = this.win(played);
      if (win) {
        displayMessage(`<strong>Player ${PLAYERS[this.toPlay]}</strong> Wins!`);
        this.over = true;
        // Highlight winning sequence
        win.forEach(cell => cell.highlight = true);
      }

      // Check for draw (no win and no more valid moves)
      else if (this.el_list.filter(cell => !cell.val).length == 0) {
        displayMessage('<strong>DRAW!</strong> Game Over!');
        this.over = true;
      }

      // Otherwise, next player's turn
      else {
        this.toPlay++;
        this.toPlay %= PLAYERS.length;
        setTurn(PLAYERS[this.toPlay]);
      }

    }
    else {
      // Noto a valid move (column is full)
      // displayMessage('You can\'t play there...Try again!');
    }
  }

  // Attempt to add player disk to Ith grid column
  add(I, player) {

    let empty = this.slice((i, j) => i == I).filter(cell => !cell.val);
    if (empty.length) {

      // Disk falls to the bottom-most available grid cell
      let move = empty[empty.length-1];

      // Add the player's disk and drop it into the grid
      move.drop(player);

      return move;
    }

    // If no available cells
    else return false;

  }

  // Each cell (disk) is repsonsible for drawing itself, its borders, and its highlights
  draw() {
    push();
      translate(GSIZE / 2, GSIZE / 2);
      // Ordered drawing allows for the disks to appear to fall behind the grid borders
      this.el_list.forEach(cell => cell.drawDisk());
      this.el_list.forEach(cell => cell.drawBorder());
      this.el_list.filter(cell => cell.highlight)
        .forEach(cell => cell.drawHighlight());
    pop();
  }

}
