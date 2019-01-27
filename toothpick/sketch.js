const T = [];

function setup() {
	createCanvas(400, 400);
	background(255);

	let P = [];
	P.push(new Pick(0, 0));
	T.push(P);

}

function draw() {
	translate(width / 2, height / 2);
	T.forEach(P => P.forEach(pick => pick.draw()));
}

class Pick {
	constructor(x, y, theta = 0) {
		this.pos = createVector(x, y);
		this.r = 10;
		this.theta = theta;
	}
	draw() {
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.theta);
		stroke(0);
		strokeWeight(1);
		line(-this.r, 0, this.r, 0);
		pop();
	}
}