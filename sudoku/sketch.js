
let sudoku;

function setup() {
    createCanvas(600, 600);
    sudoku = new Sudoku();
    const puzzle = growFromSeed(puzzle1);
    sudoku.loadPuzzle(puzzle);
    createP('Controls:');
    createP('Use the mouse or arrow keys to select a square for input.');
    createP('Number keys will mark a digit in the selected square or add a pencil mark.');
    createP('Press Q to enter pen mode, W to enter pencil mode, and E to toggle between them.');
}

function draw() {
    sudoku.draw();
}

function mousePressed() {
    sudoku.setActiveTile();
}

function keyPressed() {
    let val = parseInt(key);
    const keyMap = {
        'q': () => sudoku.toggleCandidateMode(false),
        'w': () => sudoku.toggleCandidateMode(true),
        'e': () => sudoku.toggleCandidateMode(),
        ' ': () => sudoku.toggleShowCandidates(),
        'Backspace': (s) => val = s.blank,
        'ArrowUp': (s) => s.activeTile && s.setActiveTile(s.activeTile.i, s.activeTile.j - 1, true),
        'ArrowDown': (s) => s.activeTile && s.setActiveTile(s.activeTile.i, s.activeTile.j + 1, true),
        'ArrowLeft': (s) => s.activeTile && s.setActiveTile(s.activeTile.i - 1, s.activeTile.j, true),
        'ArrowRight': (s) => s.activeTile && s.setActiveTile(s.activeTile.i + 1, s.activeTile.j, true),
    }
    keyMap[key] && keyMap[key](sudoku);
    if (Number.isInteger(val)) sudoku.setValue(val);
}

class Sudoku {
    constructor() {
        this.base = 3;
        this.digits = this.base ** 2;
        this.s = width / this.digits;
        this.blank = 0;
        this.grid = Array.from({ length: this.digits }, () => Array.from({ length: this.digits }, () => 0));
        this.fixedGrid = Array.from({ length: this.digits }, () => Array.from({ length: this.digits }, () => false));
        this.candidateGrid = Array.from({ length: this.digits }, () => Array.from({ length: this.digits }, () => new Set([])));
        this.tiles = this.grid.map((row, j) => row.map((cell, i) => new Tile(i, j, this)));
        this.activeTile = undefined;
        // this.grid.forEach((row, j) => row.forEach((cell, i) => {
        //     this.tiles.push(new Tile(i, j, this));
        // }));
        this.validationHints = true;
        this.candidateMode = false;
        this.finished = false;
    }
    forEachTile(fn) {
        const collection = [];
        this.tiles.forEach((row, j) => row.forEach((cell, i) => {
            fn(cell, i, j);
            collection.push(cell);
        }));
        return collection;
    }
    loadPuzzle(data) {
        if (data.length !== this.digits ** 2) return console.error('puzzle size and grid do not match.');
        this.grid.forEach((row, j) => row.forEach((col, i) => {
            const val = data[j * this.digits + i];
            this.grid[j][i] = val;
            this.fixedGrid[j][i] = val !== this.blank;
        }));
        console.log('loaded puzzle into grid...', this.grid);
    }
    setActiveTile(i = floor(mouseX / this.s), j = floor(mouseY / this.s), persist) {
        if (this.finished) return;
        if (i >= 0 && i < this.digits && j >= 0 && j < this.digits) this.activeTile = this.tiles[j][i];
        else if (!persist) this.activeTile = undefined;
    }
    setValue(val) {
        if (val <= this.digits && this.activeTile && !this.activeTile.fixed) {
            const i = this.activeTile.i, j = this.activeTile.j;
            if (this.candidateMode) {
                if (val !== this.blank) {
                    const candidates = this.candidateGrid[j][i];
                    candidates.has(val) ? candidates.delete(val) : candidates.add(val);
                    this.activeTile.showCandidates = true;
                }
            }
            else {
                this.grid[j][i] = val;
                this.activeTile.showCandidates = false;
                const valid = this.validate();
                if (valid) this.updateCandidates({val, i, j});
            }
        }
    }
    toggleCandidateMode(toggle = !this.candidateMode) {
        this.candidateMode = toggle;
        cursor(this.candidateMode ? CROSS : ARROW);
    }
    toggleShowCandidates() {
        if (this.activeTile) this.activeTile.showCandidates = !this.activeTile.showCandidates;
    }
    validate() {
        const [valid, validGrid] = Solver.checkValidSolution(this.grid);
        const winCondition = this.forEachTile((tile, i, j) => tile.isValid = validGrid[j][i])
            .every(tile => {
                tile.update();
                return tile.isValid && tile.val !== this.blank
            });
        if (winCondition) !this.finished && this.end();
        return valid;
    }
    updateCandidates(last) {
        const tempGrid = this.grid.map(row => row.map(col => this.blank));
        tempGrid[last.j][last.i] = last.val;
        const trueCandidates = Solver.makeImplications(tempGrid).implicationMatrix;
        this.candidateGrid = this.candidateGrid.map((row, j) => row.map((candidates, i) => {
            return new Set([...candidates].filter(candidate => trueCandidates[j][i].indexOf(candidate) >= 0));
        }));
        // console.log(trueCandidates);
    }
    end() {
        console.log('Puzzle complete!');
        this.setActiveTile(-1, -1);
        this.finished = true;
    }
    draw() {
        let gameSize = this.s * this.digits;
        let sectorSize = this.s * this.base;

        // Draw all tiles
        this.forEachTile(tile => {
            tile.update();
            tile.draw();
        })

        // Draw game borders
        push();
        noFill();
        strokeWeight(this.s / 5);
        stroke(0);
        rect(0, 0, gameSize, gameSize);
        strokeWeight(this.s / 10);
        for (let j = 0; j < this.base; j++) for (let i = 0; i < this.base; i++) {
            rect(i * sectorSize, j * sectorSize, sectorSize, sectorSize);
        }
        pop();

        // Draw active tile indicator
        if (this.activeTile) this.activeTile.drawActive();


    }
}

class Tile {
    constructor(i, j, game, val) {
        this.i = i;
        this.j = j;
        this.game = game;
        this.s = game.s;
        this.ss = game.s / game.digits ** 0.5;
        this.pos = createVector(this.i * this.s, this.j * this.s);
        this.center = p5.Vector.add(this.pos, createVector(this.s / 2, this.s / 2));
        this.val = 0;
        this.candidates;
        this.isValid = true;
        this.candidates = [];
        this.active = false;
        this.fixed = false;
        this.showCandidates = false;
    }
    update() {
        this.val = this.game.grid[this.j][this.i];
        this.fixed = this.game.fixedGrid[this.j][this.i];
        this.candidates = this.game.candidateGrid[this.j][this.i];
        this.active = (() => {
            if (this.game.activeTile && !this.fixed) {
                const { i, j } = this.game.activeTile;
                return this.i == i && this.j == j;
            }
        })();
    }
    drawActive() {
        // fill(255);
        this.game.candidateMode ? stroke('yellow') : stroke('blue');
        strokeWeight(4);
        noFill();
        rect(this.pos.x, this.pos.y, this.s, this.s);
    }
    draw() {

        // Draw tile background
        const sector = this.game.base;
        const oddSector = (floor(this.i / sector) + floor(this.j / sector)) % 2;
        push();
        stroke(0);
        strokeWeight(1);
        oddSector ? fill(201) : fill(231);
        rect(this.pos.x, this.pos.y, this.s, this.s);
        pop();

        // Draw text
        push();
        // Draw candidates
        if (this.showCandidates) {
            fill(100);
            noStroke();
            textSize(this.ss * 0.75);
            textAlign(CENTER, CENTER);
            for (let n = 0; n < this.game.digits; n++) {
                const candidate = this.candidates.has(n + 1) ? n + 1 : 0;
                const i = n % 3;
                const j = floor(n / 3);
                const offSet = 0.5;
                if (candidate) text(candidate, this.pos.x + (i + offSet) * this.ss, this.pos.y + (j + offSet) * this.ss);
                else ellipse(this.pos.x + (i + offSet) * this.ss, this.pos.y + (j + offSet) * this.ss, this.ss / 10);
            };
        }
        else {
            // text styles
            noStroke();
            if (this.fixed) {
                fill(0);
                textStyle(BOLD);
            }
            else {
                fill('blue');
                textStyle(NORMAL);
            }
            if (this.game.validationHints && !this.isValid) fill('red');

            // draw text
            textSize(this.s * 0.75);
            textAlign(CENTER, CENTER);
            if (this.val !== this.game.blank) text(this.val, this.center.x, this.center.y);
        }
        pop();
    }
}