var stage, stageW, stageH;
var lineNum, lines;
var stroke = 10

function create () {
	stage = new createjs.Stage('canvas');
	stageW = stage.canvas.width;
	stageH = stage.canvas.height;
	stage.clear();

	var bg = new createjs.Shape();
	bg.graphics.f('#424242').dr(0, 0, stageW, stageH);
	bg.alpha = 0;
	stage.addChild(bg);

	createjs.Ticker.framerate = 60;
	createjs.Ticker.on("tick", stage);
	createjs.Tween.get(bg).to({alpha: 1}, 700);

	lineNum = 13;
	lines = [];
	for (var i = 0; i < lineNum; i++) {
		var line = new createjs.Graphics();
		lines.push(line);
		stage.addChild(new createjs.Shape(line));
		line.mt(stageW/2, stageH/2);
		var ratio = i / 20 + .2;
		line.dx = new Damp(ratio);
		line.dy = new Damp(1 - ratio);
	}

	stage.update();
}

var cx, cy, tx, ty;
var ratio = 2;

function draw (x, y, z, rgba) {
	if(!lines) create();

	for (var i = lines.length - 1; i >= 0; i--) {
		cx = lines[i].command.x;
		cy = lines[i].command.y;
		tx = lines[i].dy.damp(y/ratio);
		ty = lines[i].dx.damp(x/ratio);
		tx = Math.min(Math.max((cx + tx), 0), stageW);
		ty = Math.min(Math.max((cy + ty), 0), stageH);
		lines[i].s(rgba).mt(cx, cy).lt(tx, ty);
	};

	stage.update();
}

var Damp = function(ratio, startValue) {
	this.ratio = ratio ? ratio : .1;
	this.lastValue = startValue ? startValue : 0;
	this.damp = function(targetValue) {
		return this.lastValue = this.lastValue + (targetValue - this.lastValue) * this.ratio;
	}
}