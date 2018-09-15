let grid;

function setup() {

    createCanvas(600, 600);

    grid = new Grid([4, 4]);

}

function draw() {

}

class Grid {
    constructor(dim) {
        [this.xdim, this.ydim] = [...dim];
    }
}