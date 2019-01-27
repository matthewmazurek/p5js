let theta = 0, v, m, c;


function setup() {
    createCanvas(400, 400);
    // angleMode(DEGREES);
    c = createVector(width / 2, height / 2);
}

function draw() {

    background(51);

    if (keyIsDown(LEFT_ARROW)) theta -= PI / 100;
    if (keyIsDown(RIGHT_ARROW)) theta += PI / 100;
    theta %= 360;

    fill(255);
    textAlign(RIGHT);
    text(`Theta = ${round(degrees(theta))}`, width - 15, 15);

    // theta = map(mouseX, 0, width, 0, 360);
    v = p5.Vector.fromAngle(theta, 100);
    let mouse = createVector(mouseX, mouseY);
    m = p5.Vector.sub(mouse, c).setMag(100);

    // let delta = round(degrees(v.angleBetween(m)));
    let angle_v = degrees(v.heading());
    let angle_m = degrees(m.heading());
    // let delta = angle_v - angle_m;
    let delta = degrees(v.copy().sub(m).heading());

    text(`angle_v = ${round(angle_v)}`, width - 15, 30);
    text(`angle_m = ${round(angle_m)}`, width - 15, 45);
    text(`Delta = ${round(delta)}`, width - 15, 60);

    // tracker
    push();
    translate(width / 2, height / 2);

    stroke('red');
    strokeWeight(1);
    line(0, 0, m.x, m.y);

    rotate(theta);
    stroke(255);
    strokeWeight(2);
    triangle(-5, -5, -5, 5, 20, 0);
    line(0, 0, 100, 0);
    pop();

    // mouse
    // let m = createVector(mouseX, mouseY);
    // let c = createVector(width / 2, height / 2);
    // let delta = p5.Vector.sub(m, c);

    // stroke('red');
    // strokeWeight(2);
    // line(width / 2, height / 2, mouseX, mouseY);

    // let tracerAngle = p5.Vector.angleBetween(tracer, delta);

    // arc
    // arc(width / 2, height / 2, 100, 100, theta, tracerAngled);

}