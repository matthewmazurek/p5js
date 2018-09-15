
const nums = [], seq = [];

let count = 0, idx = 0, max = 1, scl;

function setup() {
    createCanvas(windowWidth, windowHeight  );
    background(0);
    scl = width / max;
}


function draw() {
    background(0);
    step();
    push();
        translate(0, height/2);
        scl = lerp(scl, width/max, 0.5);
        scale(scl);
        for (let i=0; i < seq.length-1; i++) {
            drawEllipse(seq[i-1], seq[i], i);
        }
    pop();
}

const drawEllipse = (a, b, c) => {
    let d = b - a;
    let m = (a + b) / 2;
    let theta = c % 2 == 0 ? [0, PI] : [PI, 0];
    stroke(255);
    noFill();
    arc(m, 0, d, d, ...theta);
}

const step = () => {
    let next = idx - count;
    if (next < 0 || nums[next]) {
        next = idx + count;
        max = Math.max(max, next);
    }
    idx = next;
    nums[idx] = true;
    seq.push(idx);
    count++;
}