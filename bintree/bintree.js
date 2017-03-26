var rand = function() { return Math.floor(Math.random()*1e6) };
var arr = new Array(1e6).fill(0).map(rand);

var search = rand();

function setup() {
  noCanvas();
  console.log('arr is a pre-defined array containing 10^6 integer elements [0, 10^6).\n',
              'Use Array.prototype.fork() to return a new binary Fork object.\n',
              'Fork methods include addValue(n), tranverse(), and indexOf(n).\n',
              'Fork.indexOf(n) searches in O(log N) vs traditional indexOf, which takes O(N) time.');
}

Array.prototype.fork = function() {
  return new Fork(this);
}

class Fork {
  constructor(n) {
    this.root = new Node();
    this.length = 0;
    this.addValue(n);
  }
  addValue(n) {
    n = Array.isArray(n) ? n : [n];
    n.forEach(function(v) { this.root.addNode(v, this); }, this);
  }
  traverse() {
    this.root.visit();
  }
  indexOf(v) {
    var found = this.root.search(v);
    return found ? found.i : -1;
  }
}

class Node {
  constructor(val) {
    this.val = null;
    if (val != null) this.grow(val);
  }
  grow(n, tree) {
    this.val = n;
    // this.tree = tree;
    this.i = tree.length++;
    this.l = new Node();
    this.r = new Node();
  }
  addNode(n, tree) {
    if (this.val == null) this.grow(n, tree);
    else if (n < this.val) this.l.addNode(n, tree);
    else this.r.addNode(n, tree);
  }
  visit() {
    this.l != null && this.l.visit();
    this.val != null && console.log(this.val);
    this.r != null && this.r.visit();
  }
  search(v) {
    if (this.val != null) {
      if (this.val == v) return this;
      else if (this.val > v) return this.l.search(v);
      else if (this.val < v) return this.r.search(v);
    }
  }
}