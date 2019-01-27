let snake;
const food = [], maxFood = 100;

function setup() {
    createCanvas(600, 600);
    snake = new Snake();
}

class Food {
    constructor(x = random(width * 2) - width, y = random(height * 2) - height) {
        this.pos = createVector(x, y);
        this.r = 10;
    }
    draw() {
        fill(255);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }
}

function draw() {
    // frameRate(2);
    background(51);
    push();
    const scl = (snake.initSize / snake.size) ** .5;
    scale(scl);
    translate(-snake.pos.x, -snake.pos.y);
    translate(width / 2 / scl, height / 2 / scl);
    snake.update();
    snake.draw();
    food.forEach(f => f.draw());
    pop();
    while (food.length < maxFood) food.push(new Food);
    // console.log(p5.Vector.angleBetween(createVector(mouseX, mouseY), createVector(width / 2, height / 2)));
}

function angleDelta(a, b) {
    let delta = a.heading() - b.heading();
    while (delta < -PI) delta += TWO_PI;
    while (delta > PI) delta -= TWO_PI;
    return delta;
}

class Snake {
    constructor(pos, size = 10) {
        this.maxVel = 2;
        this.maxAcc = 0.2;
        this.pos = pos ? pos : createVector(random(width), random(height));
        this.vel = createVector(1, 0).mult(this.maxVel);
        this.acc = createVector(0, 0).mult(this.maxAcc);
        this.angle = 0;
        this.initSize = size;
        this.body = Array.from({ length: size }, (_, idx) => new Segment(this, idx));
    }
    get size() { return this.body.length; }
    get head() { return this.body[0]; }
    eat(food) {
        const eatDist = 10;
        for (let i = food.length - 1; i > 0; i--) {
            if (this.pos.dist(food[i].pos) < eatDist) {
                food.splice(i, 1);
                this.grow();
            }
        }
    }
    grow() {
        this.body.push(new Segment(this, this.body.length));
    }
    update() {
        // const angle = p5.Vector.angleBetween(createVector(mouseX, mouseY), this.pos);
        // this.angle = p5.Vector.sub(createVector(mouseX, mouseY), this.pos).heading();
        // console.log(angle, angle2);
        let target = createVector(mouseX + this.pos.x - width / 2, mouseY + this.pos.y - height / 2);
        this.steer(target);
        this.vel.add(this.acc);
        this.vel.normalize().mult(mouseIsPressed ? this.maxVel * 2 : this.maxVel);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.body.forEach(segment => segment.update());
        this.eat(food);
        this.r = this.size / this.initSize * 5;
    }
    steer(target) {
        // frameRate(2);
        let desired = p5.Vector.sub(target, this.pos)
            .setMag(this.maxVel);
        let da = angleDelta(desired, this.vel);
        let maxAngle = PI / 3;
        let limitDesired = desired.copy();
        if (abs(da) > maxAngle) {
            limitDesired = p5.Vector.fromAngle(this.vel.heading() + maxAngle * Math.sign(da)).mult(this.maxVel);
        }
        // if (limitDesired.heading == undefined) console.error('Undefined error!', maxAngle, da);
        drawLine(this.pos, desired.heading(), 'green');
        drawLine(this.pos, this.vel.heading(), 'red');
        drawLine(this.pos, limitDesired.heading(), 'yellow');
        fill(255);
        // ellipse(mouseX + this.pos.x - width / 2, mouseY + this.pos.y - height / 2, 10, 10);
        // console.log(`a_desired = ${desired.heading()}, a_vel = ${this.vel.heading()}, da = ${da}`);


        let steer = p5.Vector.sub(limitDesired, this.vel)
            .normalize().mult(mouseIsPressed ? this.maxAcc * 2 : this.maxAcc);
        // drawLine(this.pos, steer.heading(), 'yellow');
        this.acc.add(steer);
    }
    draw() {
        this.body.forEach(segment => segment.draw());
    }
}

function drawLine(p, angle, col) {
    let r = 100;
    let x1 = p.x,
        y1 = p.y;
    let x2 = x1 + cos(angle) * r,
        y2 = y1 + sin(angle) * r;
    strokeWeight(3);
    stroke(col);
    line(x1, y1, x2, y2);
}

class Segment {
    constructor(snake, idx) {
        this.r = snake.r;
        this.idx = idx;
        this.snake = snake;
        // console.log('idx', idx);
        this.head = idx === 0;
        // this.parent = this.head ? undefined : snake.body[idx - 1];
        // this.pos = this.parent
        //     ? snake.pos
        //     : parent.pos;
        this.pos = snake.pos;
    }
    get parent() { return this.snake.body[this.idx - 1]; }
    update() {
        if (this.head) this.pos = this.snake.pos;
        else this.pos = this.follow(this.parent);
        this.r = snake.r;
    }
    follow(target) {
        const d = p5.Vector.sub(this.pos, target.pos);
        // console.log(d);
        d.setMag(this.r);
        return p5.Vector.add(target.pos, d);
    }
    draw() {
        noStroke();
        fill(255);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    }
}