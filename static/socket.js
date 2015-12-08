var socket = io();
var control = document.querySelector('.half:first-child');
var monitor = document.querySelector('.half:last-child');
control.addEventListener('click', device);
monitor.addEventListener('click', device);
function device (e) {
	var target = e.currentTarget;
	switch (target) {
		case(control):
			var handler = controlHandler;
			var theOther = monitor;
			break;
		case(monitor):
			var handler = monitorHandler;
			var theOther = control;
			break;
	}
	document.querySelectorAll('.text')[1].remove();
	document.querySelectorAll('.text')[0].remove();
	if(theOther.offsetWidth == document.body.offsetWidth) {
		theOther.style.height = 0;
	} else {
		theOther.style.width = 0;
	}
	setTimeout(function () {
		var canvas = document.createElement('canvas');
		canvas.setAttribute('id', 'canvas');
		canvas.setAttribute('width', window.innerWidth);
		canvas.setAttribute('height', window.innerHeight);
		target.appendChild(canvas);
		handler();
		theOther.style.width = 0;
		theOther.style.height = 0;
	}, 300);
	target.removeEventListener('click', device);
}
function controlHandler () {
	window.addEventListener('deviceorientation', initialOrientation);
	var init;
	function initialOrientation (e) {
		window.removeEventListener('deviceorientation', initialOrientation);
		init = {x: e.beta, y: e.gamma, z: e.alpha};
	}
	window.addEventListener('deviceorientation', function (e) {
		var x = e.beta - init.x;
		var y = e.gamma - init.y;
		var data = {x: x, y: y, z: e.alpha};
		socket.emit('tilt', data);
	});
	var canvas = document.getElementById('canvas');
	canvas.addEventListener('touchstart', pick);
	canvas.addEventListener('touchmove', pick);
	// canvas.addEventListener('touchend', pick);
	var ctx = canvas.getContext('2d');
	function pick (e) {
		if(e.preventDefault) e.preventDefault();
		var x = e.touches[0].clientX;
		var y = e.touches[0].clientY;
		var data = ctx.getImageData(x, y, 1, 1).data;
		var rgba = 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3] / 255 + ')';
		socket.emit('pick', rgba);
	}
	var img = new Image();
	img.src = 'static/color_wheel.png';
	img.onload = imgSize;
	function imgSize () {
		var canvas = document.getElementById('canvas');
		canvas.setAttribute('width', window.innerWidth);
		canvas.setAttribute('height', window.innerHeight);
		var w = canvas.width;
		var h = canvas.height;
		var min = Math.min(w, h);
		ctx.drawImage(img, (w-min)/2, (h-min)/2, min, min);
	}
	window.addEventListener('resize', imgSize);
}
function monitorHandler () {
	var x, y, z, myInterval;
	canvas();
	socket.on('tilt', function (data) {
		x = data.x;
		y = data.y;
		z = data.z;
		var rgba = 'rgba(255,255,255,1)';
		socket.on('pick', function (data) {
			rgba = data;
		});
		if(!myInterval) {
			myInterval = setInterval(function () {
				create(x, y, z, rgba);
			}, 10);
		}
	});
}