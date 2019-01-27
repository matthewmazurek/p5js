let train, editor, examples;

function setup() {
    createCanvas(400, 400);
    train = new Train();
    editor = select('#code');
    examples = select('#examples');
    editor.value(examples.value());
    examples.changed(() => editor.value(examples.value()))
}

function draw() {
    background(51);
    train.init();
    train.run(editor.value());
    // noLoop();
}

const rad = deg => (deg / 360) * TWO_PI;

class Train {
    constructor(pos = createVector(width / 2, height / 2), theta = PI / 2) {
        this.pos = pos;
        this.theta = theta;
        this.pen = true;

        this.commands = {
            'fd': x => { if (this.pen) line(0, 0, x, 0); translate(x, 0); },
            'bk': x => { if (this.pen) line(0, 0, -x, 0); translate(-x, 0); },
            'rt': x => { rotate(rad(x)); },
            'lt': x => { rotate(-rad(x)); },
            'pu': () => { this.pen = false; },
            'pd': () => { this.pen = true; },
            'col': (r, g, b, a = 255) => { stroke(r, g, b, a); },
            'wd': x => { strokeWeight(x); },
            'repeat': (n, exp) => { while (n-- > 0) this.run(exp, n); }
        };

        this.init();
    }
    init() {
        translate(this.pos.x, this.pos.y);
        rotate(-this.theta);
        this.pen = true;
    }
    parse(s, n) {
        let tokens = [];
        // let regexp = /(\w+\b)(?: (\d+))?(?: (?:\[)(.*)(?(?=\2)(\2)|(?:\])))/g;
        let regexp = /(\w+\b)(?: (\d+))?(?: (\d+))?(?: (\d+))?(?: \[([^\[\]]*(?:\[[^\[\]]*\])*[^\[\]]*)\])?/g;
        let res = [];
        if (n !== undefined && s && s.length) s = s.replace(/repcount/g, n);
        while ((res = regexp.exec(s)) !== null) tokens.push([...res]);
        return tokens
            .map(token => {
                let [_, fn, ...params] = token;
                params = params.filter(p => p);
                return { fn, params };
            })
            .filter(token => this.commands[token.fn])
            // .map(token => { console.log(token); return token; })
            .map(token => (n) => {
                if (n !== undefined) token.params.map()
                this.commands[token.fn](...token.params)
            });
    }
    run(code, n) {

        // defaults
        stroke(255);
        strokeWeight(1);

        const cmds = this.parse(code, n);
        cmds.forEach(cmd => cmd());

    }
}