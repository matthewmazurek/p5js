let lander, ground, target, run = false;

const g = -0.02, thrust = 0.05, softLanding = 0.5, fuel = 200;

function setup() {
    createCanvas(400, 400);
    newGame();
}

function newGame() {
    lander = new Lander();
    ground = generateGround();
    target = generateTarget(ground);
    run = true;
}

function generateGround() {
    let range = 200;
    let vel = 1 / 75;
    return Array.from({ length: width }, (_, i) =>
        noise(i * vel) * range
    );
}

function generateTarget() {
    let w = 50;
    let x = random(ground.length - w);
    let h = ground.reduce((s, h, i) => i >= x && i < x + w ? s + h : s, 0) / w;
    ground = ground.map((hi, i) => i >= x && i < x + w ? h : hi);
    return { x, w, h };
}

function draw() {
    background(51);

    // ground
    strokeWeight(1);
    stroke(200);
    ground.forEach((h, x) => {
        line(x, height, x, height - h);
    });

    // target
    stroke(0, 0, 255);
    let r = 5;
    for (i = 0; i < target.w; i++) {
        let y1 = height - target.h;
        let y2 = y1 + r;
        line(target.x + i, y1, target.x + i, y2);
    }

    if (run) lander.update();
    lander.draw();

    // HUD display
    stroke(255);
    fill(255);
    textAlign(RIGHT);
    text(`Fuel: ${lander.fuel}`, width - 10, 20);
    text(`Velocity: ${lander.vel.mag().toPrecision(3)}`, width - 10, 40);
    text(`Angle: ${(lander.a - PI / 2) * 360}`, width - 10, 60);

}

class Lander {
    constructor(x = width / 2, y = 20) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.r = 5;
        this.a = PI / 2;
        this.maxVel = 2;
        this.maxAcc = 2;
        this.fuel = fuel;
    }

    update() {
        // gravity
        this.acc.add(0, -g);

        // thurst
        if (keyIsDown(32)) {
            if (this.fuel > 0) {
                let force = p5.Vector.fromAngle(this.a).mult(-thrust);
                this.acc.add(force);
                this.fuel--;
            }
        }
        if (keyIsDown(LEFT_ARROW)) {
            this.a -= PI / 100;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            this.a += PI / 100;
        }

        // collision
        if (this.pos.y + this.r > height - ground[int(this.pos.x)]) {

            if (this.safeToLand) {
                this.vel.mult(0);
                this.acc.mult(0);
                this.a = PI / 2;
                console.log('win');
                run = false;
            }
            else {
                // GAME OVER
                newGame();
            }
        }

        // integrate
        this.acc.limit(this.maxAcc);
        this.vel.add(this.acc);
        this.vel.limit(this.maxVel);
        this.pos.add(this.vel);
        this.acc.mult(0);

    }
    get safeToLand() {
        let inTarget = this.pos.x > target.x && this.pos.x < target.x + target.w;
        let isSoftLanding = this.vel.mag() <= softLanding;
        return inTarget && isSoftLanding;
    }
    draw() {
        if (this.safeToLand) fill(0, 255, 0);
        else fill(255);
        noStroke();
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.a + PI / 2);
        triangle(-this.r, 0, this.r, 0, 0, 4 * this.r);
        pop();
    }
}