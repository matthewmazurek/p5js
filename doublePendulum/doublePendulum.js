let r1, r2, m1, m2, a1, a2, a1_v, a2_v, g, cx, cy, px2, py2, buffer;

r1 = 200;
r2 = 200;
m1 = 40;
m2 = 40;
a1 = 0;
a2 = 0;
a1_v = 0;
a2_v = 0;
g = 1;


function setup() {
  createCanvas(600, 600);
  background(255);

  a1 = PI / 2;
  a2 = PI / 2;

  cx = width / 2;
  cy = 50;

  buffer = createGraphics(width * 2, height * 2);
  buffer.background(255);
  buffer.translate(cx, cy);

}

function draw() {

  let num1 = -g * (2 * m1 + m2) * sin(a1);
  let num2 = -m2 * g * sin(a1 - 2 * a2);
  let num3 = -2 * sin(a1 - a2) * m2;
  let num4 = a2_v * a2_v * r2 + a1_v * a1_v * r1 * cos(a1 - a2);
  let den = r1 * (2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2));
  let a1_a = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * sin(a1 - a2);
  num2 = (a1_v * a1_v * r1 * (m1 + m2));
  num3 = g * (m1 + m2) * cos(a1);
  num4 = a2_v * a2_v * r2 * m2 * cos(a1 - a2);
  den = r2 * (2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2));
  let a2_a = (num1 * (num2 + num3 + num4)) / den;

  background(255);
  imageMode(CORNER);
  image(buffer, 0, 0, width, height);

  translate(cx, cy);
  stroke(0);
  strokeWeight(2);

  let x1 = r1 * Math.sin(a1);
  let y1 = r1 * Math.cos(a1);

  let x2 = x1 + r2 * Math.sin(a2);
  let y2 = y1 + r2 * Math.cos(a2);

  line(0, 0, x1, y1);
  fill(0);
  ellipse(x1, y1, m1, m1);

  line(x1, y1, x2, y2);
  fill(0);
  ellipse(x2, y2, m2, m2);

  //img.background(51);
  //img.translate(300, 50);
  buffer.stroke(0);
  if (frameCount > 1)
    buffer.line(px2, py2, x2, y2);

  a1_v += a1_a;
  a2_v += a2_a;
  a1 += a1_v;
  a2 += a2_v;

  a1_v *= 0.9999;
  a2_v *= 0.9999;

  px2 = x2;
  py2 = y2;

}
