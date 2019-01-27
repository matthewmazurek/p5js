const DIMS = [20, 10];
const SIZE = 30;
const COLORS = ['blue', 'red', 'green', 'yellow', 'purple'];
let g;

function setup() {
	createCanvas(DIMS[1] * SIZE, DIMS[0] * SIZE);
	g = new Grid(DIMS);
}

function draw() {
	background(51);
	g.draw();
}

class Grid {
	constructor(dims) {
		[this.h, this.w] = dims;
		this.arr = Array.from({ length: this.h },
			(_, j) => Array.from({ length: this.w },
				(_, i) => new Cell(this, [i, j])
			)
		);
	}
	get it() {
		return this.arr.reduce((acc, cur) => [...acc, ...cur]);
	}
	draw() {
		this.it.forEach(cell => cell.draw());
	}
}

class Cell {
	constructor(grid, pos) {
		[this.x, this.y] = pos;
		this.grid = grid;
		this.val = round(random(5));
	}
	get solid() {
		return this.val !== 0;
	}
	draw() {
		if (this.solid) fill(COLORS[this.val - 1]);
		else noFill();
		stroke(255);
		strokeWeight(1);
		rect(this.x * SIZE, this.y * SIZE, SIZE, SIZE);
	}
}