const coins = [];

let numCoins = 6;

function setup() {
    createCanvas(400, 400);
    let r = 25;
    for (let j=0; j<=1; j++) for (let i=-1; i<=1; i++)
        coins.push(
            new Coin(
                width/2 + i*2*r + j*r,
                height/2 + j*r*(3**.5),
                r
            )
        );
}

function draw() {
    background('#eee');
    coins.forEach(coin => coin.draw());
}

function mousePressed() {
    let dragCoin = coins.filter(coin => coin.contains({x: mouseX, y: mouseY}))[0];
    if (dragCoin) dragCoin.drag = true;
}

function mouseReleased() {
    coins.forEach(coin => coin.drag = false);
}

function mouseDragged() {
    let dragCoin = coins.filter(coin => coin.drag)[0];
    if (dragCoin) dragCoin.move({x: mouseX, y: mouseY});
}


class Coin {
    constructor(x, y, r) {
        this.r = r || 25;
        this.x = x || random(width);
        this.y = y || random(height);
        this.drag = false;
    }
    contains({x, y}) {
        let dist2 = (this.x - x) ** 2 + (this.y - y) ** 2;
        return dist2 <= this.r ** 2;
    }
    move({x, y}) {
        this.x = x;
        this.y = y;
    }
    draw() {
        noStroke();
        fill('green');
        ellipse(this.x, this.y, this.r * 2, this.r * 2);
    }
}