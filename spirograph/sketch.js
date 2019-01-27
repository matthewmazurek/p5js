let circles = [], trail = [], k, l, n, res;

function setup() {
    createCanvas(500, 500);
    k = 6;
    l = 1;
    res = 10;
    n = 5;
    for (let i = 0; i < n; i++) {
        new Circle(100 * (Math.E * k) ** -(2 * i / k));
    }
}

function draw() {

    background(51);

    // Update and draw circles
    circles.forEach((c, i) => {
        c.update();
        c.draw(i == circles.length - 1);
    });

    // Draw trail
    stroke('red');
    beginShape();
    trail.forEach(pt => vertex(pt.x, pt.y));
    endShape();

    // Reset trail if getting too long
    if (trail.length > 10000) trail = [];
}

class Circle {
    constructor(r) {

        circles.push(this);

        this.n = circles.length - 1;
        this.parent = circles[this.n - 1] || null;
        this.pos = createVector(width / 2, height / 2);
        this.r = r;
        this.theta = 0;
        this.vel = (1 - k) ** (this.n - 1) * TWO_PI / 60 / res;

    }
    update() {
        this.theta += this.vel;
        this.theta %= TWO_PI;
        if (this.parent) {
            this.pos = p5.Vector
                .fromAngle(this.parent.theta)
                .mult(this.parent.r + l * this.r)
                .add(this.parent.pos);
        }
    }
    draw(drawTrail = false) {
        noFill();
        if (!mouseIsPressed) {
            stroke('green');
            strokeWeight(2);
            ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
        }
        if (drawTrail) {
            let pt = p5.Vector
                .fromAngle(this.theta)
                .mult(this.r)
                .add(this.pos);
            trail.push(pt);
        }
    }
}