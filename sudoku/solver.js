// sample puzzle
const puzzle1 = [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 7, 0, 1, 7, 0, 8, 0, 5, 0, 0, 9, 0, 0, 9, 1, 4, 0, 0, 0, 0, 0, 0, 3, 0, 5, 0, 8, 0, 1, 0, 0, 0, 0, 0, 0, 2, 5, 6, 0, 0, 4, 0, 0, 1, 0, 2, 0, 3, 8, 0, 9, 0, 0, 0, 1, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0];
const puzzle2 = [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 0, 0, 0, 0, 0, 0, 7, 0, 0, 9, 0, 2, 0, 0, 0, 5, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 4, 5, 7, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 6, 8, 0, 0, 8, 5, 0, 0, 0, 1, 0, 0, 9, 0, 0, 0, 0, 4, 0, 0];

const growFromSeed = (seed) => {
    const digits = Math.floor(seed.length ** 0.5);
    const d = digits - 1;
    const map = Array.from({ length: digits }, (_, i) => i + 1);
    let i = map.length;
    while (i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [map[i], map[j]] = [map[j], map[i]];
    }
    map.unshift(0);
    const shuffled = seed.map(i => map[i]);
    // const shuffled = seed.map(i => i);
    const rnd = () => Math.round(Math.random());
    const rot = rnd(), vflp = rnd(), hflp = rnd();
    const puzzle = [];
    let x, y;
    for (let j = 0; j < digits; j++) for (let i = 0; i < digits; i++) {
        if (rot) (x = j, y = i); else (x = i, y = j);
        if (vflp) x = d - x;
        if (hflp) y = d - y;
        const idx = y * digits + x;
        puzzle.push(shuffled[idx]);
    }
    return puzzle;
}
    
const loadPuzzle = (data) => {
    // if (data.length !== digits ** 2) return console.error('puzzle size and grid do not match.');
    const digits = Math.floor(data.length ** 0.5);
    const grid = Array.from({ length: digits }, () => Array.from({ length: digits }, () => 0));
    grid.forEach((row, j) => row.forEach((col, i) => {
        grid[j][i] = data[j * digits + i];
    }));
    return grid;
}
loadPuzzle(puzzle2);


const Solver = (function (base = 3, blankChar = 0) {

    // traditional sudoko, base = 3, digits = 3 ** 2 = 9, squares = 3 ** 4 = 81
    const digits = base ** 2;

    let backtracks = 0;
    const solve = (grid) => {
        let solution;
        backtracks = 0;
        timer();
        const implications = makeImplications(grid);
        if (implications) {
            const { implicationGrid, implicationMatrix } = makeImplications(grid);
            solution = findSolution(implicationGrid, implicationMatrix);
        }
        timer(end = true);
        if (solution) {
            console.log(`a solution was found! (backtracks = ${backtracks})`);
            return solution;
        } else {
            console.log('no solutions found!');
            return false
        }
    }

    const makeImplications = (grid, prevImplications) => {
        let singleton = false;
        let conflict = false;
        const implicationGrid = grid.map(row => row.slice());
        const implicationMatrix = implicationGrid.map((row, j) => row.map((val, i) => {
            if (val == blankChar) {
                const implications = getValidImplications(implicationGrid, i, j, prevImplications);
                if (implications.length == 1) {
                    singleton = true;
                    implicationGrid[j][i] = implications[0];
                } else if (implications.length == 0) {
                    conflict = true;
                }
                return implications;
            }
            else return [];
        }));
        if (conflict) return false;
        else return singleton ? makeImplications(implicationGrid, implicationMatrix) : { implicationGrid, implicationMatrix };
    }

    const getValidImplications = (grid, x, y, prevImplications) => {
        const candidates = prevImplications ? prevImplications[y][x] : Array.from({ length: digits }, (_, n) => n + 1);
        return candidates.filter(n => isValid(grid, x, y, n));
    }

    const findSolution = (grid, implications) => {
        const nextBlank = getNextBlank(grid);
        if (nextBlank == -1) return grid; // solved
        else {
            const { x, y } = nextBlank;
            const impl = implications[y][x];
            // select an option from possible implications
            for (let n = 0; n < impl.length; n++) {
                const newGrid = grid.map(row => row.slice());
                newGrid[y][x] = impl[n];
                const newImplications = makeImplications(newGrid, implications);
                if (newImplications) {
                    const { implicationGrid, implicationMatrix } = newImplications;
                    const nextSolution = findSolution(implicationGrid, implicationMatrix);
                    if (nextSolution !== false) return nextSolution;
                }
            }
            // no valid solutions found
            backtracks++;
            return false;
        }
    }

    const getNextBlank = (grid) => {
        for (let y = 0; y < digits; y++) for (let x = 0; x < digits; x++) {
            if (grid[y][x] == blankChar) return { x, y };
        }
        // all solved
        return -1;
    }

    const checkValidSolution = (grid) => {
        const validGrid = grid.map((row, j) => row.map((val, i) => isValid(grid, i, j, val)));
        return [validGrid.every(row => row.every(cell => cell)), validGrid];
    }

    const isValid = (grid, i, j, e, verbose = false) => {
        if (e == blankChar) return true;
        if (verbose) console.log(`checking ${e} in grid...`);
        // check row
        for (let k = 0; k < digits; k++) {
            if (k !== i && grid[j][k] == e) {
                if (verbose) console.log(`failed row test (matched {${k}, ${j}} = ${grid[j][k]}).`);
                return false;
            }
        }
        // check col
        for (let l = 0; l < digits; l++) {
            if (l !== j && grid[l][i] == e) {
                if (verbose) console.log(`failed column test (matched {${i}, ${l}} = ${grid[l][i]}).`);
                return false;
            }
        }
        // check sector
        const sectorSize = digits ** 0.5;
        let rowStart = (Math.ceil((j + 1) / digits * sectorSize) - 1) * sectorSize;
        let colStart = (Math.ceil((i + 1) / digits * sectorSize) - 1) * sectorSize;
        for (k = rowStart; k < rowStart + sectorSize; k++) {
            for (l = colStart; l < colStart + sectorSize; l++) {
                if (k !== j && l !== i && grid[k][l] == e) {
                    if (verbose) console.log(`failed sector test (matched {${l}, ${k}} = ${grid[k][l]}).`);
                    return false;
                }
            }
        }
        // looks ok
        if (verbose) console.log('suggestion is valid.');
        return true;
    }

    let t0 = null;
    const timer = (end = false) => {
        if (end && t0) {
            const elapsed = new Date() - t0;
            t0 = null;
            console.log(`done! time elapsed: ${elapsed} ms`);
        } else t0 = t0 || new Date();
    }

    return { solve, isValid, checkValidSolution, makeImplications };

})();