let curr = [], prev = [];
const n = 200, damp = 0.9;

function setup() {

  createCanvas(200, 200);

  curr = Array.from({length: n}, () => Array.from({length: n}, () => 255));
  prev = curr;

  prev[100][100] = 255;

  // noLoop();

}

const ref = (arr, i, j) => arr && arr[i] && arr[i][j] ? arr[i][j] : 0;

function draw() {

  background(0);
  loadPixels();
  let test = [];
  for (let i=0; i < n; i++) for (let j=0; j < n; j++) {
    let idx = (j + i * n);
    // test.push(idx);
    curr[i][j] = (ref(prev, i-1, j) + ref(prev, i+1, j) + ref(prev, i, j-1) + ref(prev, i, j+1)) / 2 - ref(curr, i, j);
    curr[i][j] *= damp;
    for (let k=0; k<2; k++)
      pixels[idx + k] = curr[i][j];
  }
  // console.log(pixels);
  updatePixels();
  // console.log(test);
  
  prev = curr.map(x => x.slice());

}