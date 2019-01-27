let buffer1, buffer2, res;

function setup() {
	createCanvas(400, 400);
	buffer1 = createImage(width, height);
	buffer2 = createImage(width, height);


	buffer1.loadPixels();
	it(width, height, (i, j, c) => {
		buffer1.set(i, j, [255, 0, 0, 255]);
	});
	buffer1.updatePixels();

}

function draw() {
	image(buffer1, 0, 0);
	noLoop();
}

const it = (x, y, fn) => {
	for (let j = 0; j < y; j++) for (let i = 0; i < x; i++) fn(i, j, i + j * x);
}
const map2d = (arr2d, fn) => {
	return arr2d.map((row, j) => row.map((col, i) => fn(col, [i, j])));
}
const forEach2d = (arr2d, fn) => {
	return arr2d.forEach((row, j) => row.forEach((col, i) => fn(col, [i, j])));
}

const conv = (m, f, s) => {
	let fsize = f.length;
	let x = (m[0].length - fsize) / s + 1;
	let y = (m.length - fsize) / s + 1;
	let res = Array.from({ length: y }, () => Array.from({ length: x }, () => 0));
	// pass filter
	return map2d(res, (_, [i, j]) => {
		let mult = map2d(f, (fv, [fi, fj]) => fv * res[j * s + fj][i * s + fi]);
		let sum = mult.flat().reduce((a, b) => a + b);
		return sum / (fsize ** 2);
	});
}