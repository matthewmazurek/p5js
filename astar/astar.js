'use strict';

var rows = 10,
    cols = 10,
    walls = 0.4; // value between 0 and 1

var grid, path = [],
    openSet = [],
    closedSet = [],
    go = true,
    paint = undefined,
    start, end, startTime;

function touchStarted() {
    if (!go && mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
        var hoverX = Math.floor(mouseX/width * cols);
        var hoverY = Math.floor(mouseY/height * rows);
        var hoverSpot = grid.tbl[hoverX][hoverY];
        if (paint == undefined) {
            console.log(hoverSpot);
            if (hoverSpot == start) reset(false);
            if (hoverSpot == end) reset(true);
        }
        if (hoverSpot != start && hoverSpot != end) {
            paint = (paint == undefined) ? !hoverSpot.wall : paint;
            hoverSpot.wall = paint;
        }
    }
}
function touchMoved() {
    touchStarted();
}
function touchEnded() {
    paint = undefined;
}

function heuristic(a, b) {
    return dist(a.i, a.j, b.i, b.j);
}

function computeTime (since) {
	return 'This took ' + ((new Date() - since) / 1000) + ' seconds to compute.';
}

function Spot(i, j, parent) {

    this.i = i;
    this.j = j;
    this.parent = parent;
    
    this.f = null;
    this.g = null;
    this.h = null;
    this.previous = undefined;
    this.wall = random(1) < walls;

    
    this.neighbours = [];

    this.reset = function (rand) {
        this.f = null;
        this.g = null;
        this.h = null;
        this.previous = undefined;
        this.wall = rand
            ? (random(1) < walls && this != start && this != end)
            : this.wall; 
        this.neighbours = [];
    }

    this.show = function (col) {
        fill(this.wall ? 0 : col);
        noStroke();
        rect(this.i * parent.w, this.j * parent.h, parent.w - 1, parent.h - 1);
    }

    this.addNeighbours = function () {
        var look = [[this.i + 1, this.j], [this.i - 1, this.j], [this.i, this.j + 1], [this.i, this.j - 1],
                   [this.i + 1, this.j + 1], [this.i + 1, this.j - 1], [this.i - 1, this.j + 1], [this.i - 1, this.j - 1]];
        look.forEach(function (e) {
            var checkNeighbour = parent.tbl[e[0]] && parent.tbl[e[0]][e[1]];
            if (checkNeighbour && !checkNeighbour.wall) {
                this.neighbours.push(checkNeighbour);
            }
        }, this);

    }

}

function Grid(cols, rows) {

    this.cols = cols;
    this.rows = rows;

    this.w = width / this.cols;
    this.h = height / this.rows;

    this.tbl = [];

    for (var i = 0; i < this.cols; i++) {
        this.tbl[i] = new Array(rows);
    }

    for (var i = 0; i < this.cols; i++) {
        for (var j = 0; j < this.rows; j++) {
            this.tbl[i][j] = new Spot(i, j, this);
        }
    }

    start = this.tbl[0][0];
    end = this.tbl[this.cols - 1][this.rows - 1];
    start.wall = false;
    end.wall = false;

    for (var i = 0; i < this.cols; i++) {
        for (var j = 0; j < this.rows; j++) {
            this.tbl[i][j].addNeighbours();
        }
    }

    this.reset = function (rand) {
        for (var i = 0; i < this.cols; i++) {
            for (var j = 0; j < this.rows; j++) {
                this.tbl[i][j].reset(rand);
            }
        }
        for (var i = 0; i < this.cols; i++) {
            for (var j = 0; j < this.rows; j++) {
                this.tbl[i][j].addNeighbours();
            }
        }
    }

    this.show = function (col) {
        for (var i = 0; i < this.cols; i++) {
            for (var j = 0; j < this.rows; j++) {
                this.tbl[i][j].show(col);
            }
        }
    }

}

function reset(rand) {
    openSet = [];
    closedSet = [];
    openSet.push(start);
    grid.reset(rand);
    startTime = new Date();
    go = true;
}

function setup() {

    var dimention = Math.min(window.innerWidth, window.innerHeight) * .95;
    createCanvas(dimention, dimention);

    grid = new Grid(cols, rows);
    openSet.push(start);
    startTime = new Date();

}

function draw() {
    if (go) {
        if (openSet.length > 0) {

            var lowestIndex = 0;
            for (var i = 0; i < openSet.length; i++) {
                if (openSet[i].f && openSet[i].f <= openSet[lowestIndex].f) {
                    lowestIndex = i;
                }
            }

            var current = openSet[lowestIndex];

            // Determine path
            path = [];
            var backtrack = current;
            while (backtrack) {
                path.push(backtrack);
                backtrack = backtrack.previous;
            }

            // END, Path found
            if (current === end) {
                alert('Done!\n' +
                    'Shortest path was ' + (path[0].f + 1) + '.\n' +
                    computeTime(startTime));
                go = false;
            }

            openSet.splice(lowestIndex, 1);
            closedSet.push(current);


            current.neighbours
                .filter(function (neighbour) {
                    return !closedSet.includes(neighbour);
                })
                .forEach(function (neighbour) {
                    if (!openSet.includes(neighbour)) openSet.push(neighbour);
                    var tentative_g = current.g + 1;
                    if (!neighbour.g || tentative_g < neighbour.g) {
                        neighbour.g = tentative_g;
                        neighbour.h = neighbour.h || heuristic(neighbour, end);
                        neighbour.f = neighbour.g + neighbour.h;
                        neighbour.previous = current;
                    }
                });

            // END, no path found 
        } else {
            alert('No Solution\n' + computeTime(startTime));
            go = false;
        }
    }
    
    background(0);
    grid.show(color(255));
    for (var i = 0; i < closedSet.length; i++) {
        closedSet[i].show(color(255, 0, 0));
    }

    for (var i = 0; i < openSet.length; i++) {
        openSet[i].show(color(0, 255, 0));
    }

    for (var i = 0; i < path.length; i++) {
        path[i].show(color(0, 0, 255));
    }

}

