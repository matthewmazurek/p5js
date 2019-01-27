const GRID_X = 5;
const GRID_Y = 5;
const TILE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let grid;

function setup() {
	createCanvas(800, 800);
	grid = new Grid([GRID_X, GRID_Y], TILE_LABELS);
}

function draw() {
	grid.draw();
}

class Grid {
	constructor(dims, tileLabels) {

		[this.xdim, this.ydim] = dims;

		const tileSize = [width / this.xdim, height / this.ydim];
		const labels = tileLabels.split('');
		const tiles = Array.from({ length: this.ydim }, (_, col) =>
			Array.from({ length: this.xdim }, (_, row) => new Tile({ x: col * tileSize[0], y: row * tileSize[1] }, tileSize, labels.unshift()))
		);

		this.tiles = tiles;
	}
	draw() {
		this.tiles.forEach(row => row.forEach(tile => tile.draw()));
	}
}

class Tile {
	constructor(pos, tileSize, label) {
		this.pos = pos;
		this.tileSize = tileSize;
		this.label = label;
	}
	draw() {
		stroke(0);
		strokeWeight(1);
		fill(255);
		noLoop();
		// console.log('draw')
		rect(this.pos.x, this.pos.y, this.tileSize[0], this.tileSize[1]);
	}
}