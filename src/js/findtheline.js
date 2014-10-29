/*jslint browser: true, devel: true, plusplus: true, sloppy: true, vars: true, white: true */
var FindTheLine = {
	settings: {
		arenaWidth: 600,
		arenaHeight: 400,
		initGameSpeed: 2,
		slowGameSpeed: 0.01,
		playerRadius: 4,
		playerAreaRadius: 25,
		playerStartX: 50,
		playerStartY: 350,
		enemyRadius: 4,
		enemyDeltaX: -(1 / Math.sqrt(2)),
		enemyDeltaY: 1 / Math.sqrt(2),
		maxEnemies: 20,
		slowDownFactor: 0.9,
		speedUpFactor: 1.2,
		spawnThreshold: 0.9,
		linesPerLevel: 10,
		enemyIncreasePerLevel: 2,
		speedIncreasePerLevel: 0.2,
		baseLineSegmentScore: 1,
		scoreMultiplierIncrement: 0.01,
		gameSpeedPointFactor: 1.5,
		maxEnemiesPointFactor: 0.05,		
		drawInterval: 17, // 60 FPS
		bankTransitionTime: 1500
	},
	state: {
		slowingDown: false,
		speedingUp: false,
		gameOver: false,
		mode: "", // "", "drawing", "moving"
		level: 1,
		linesDrawn: 0
	},
	global: {
		player: {},
		enemies: [],
		path: []
	},
	debug: {
		collisions: true
	}
};

FindTheLine.helpers = (function () {
	function rnd (from, to) {
		if (!from) { from = 0; }
		if (!to) { to = 1; }
		return Math.floor(Math.random() * (to - from + 1)) + from;
	}
	
	return {
		rnd: rnd
	};
}());

FindTheLine.Point = function (initX, initY) {
	var x = initX || 0;
	var y = initY || 0;
	
	function move (deltaX, deltaY) {
		return new FindTheLine.Point(x + deltaX, y + deltaY);
	}
	
	function distanceTo (targetPoint) {
		return Math.sqrt(Math.pow((x - targetPoint.x), 2) + Math.pow((y - targetPoint.y), 2));
	}
	
	function pointInLine (lineEndPoint, distance) {
		var lineLength = this.distanceTo(lineEndPoint);
		var newX = x + (((lineEndPoint.x - x) / lineLength) * distance);
		var newY = y + (((lineEndPoint.y - y) / lineLength) * distance);
		
		return new FindTheLine.Point(newX, newY);
	}
	
	function toString () {
		return "{ " + x + ", " + y + " }";
	}
	
	return {
		x: x,
		y: y,
		move: move,
		distanceTo: distanceTo,
		pointInLine: pointInLine,
		toString: toString
	};
};

FindTheLine.Player = function () {
	var location = new FindTheLine.Point(FindTheLine.settings.playerStartX, FindTheLine.settings.playerStartY);
	
	function getLocation () {
		return location;
	}
	
	function movePlayerTo (newPoint) {
		location = newPoint;
	}
	
	function toString () {
		return location.toString();
	}
	
	return {
		getLocation: getLocation,
		movePlayerTo: movePlayerTo,
		toString: toString
	};
};

FindTheLine.Enemy = function (startX, startY) {
	var location = new FindTheLine.Point(startX, startY);
	var deltaX = FindTheLine.settings.enemyDeltaX;
	var deltaY = FindTheLine.settings.enemyDeltaY;
	
	function getLocation () {
		return location;
	}
	
	function move () {
		location = location.move(deltaX * FindTheLine.state.gameSpeed, deltaY * FindTheLine.state.gameSpeed);
	}
	
	function toString () {
		return location.toString();
	}
	
	return {
		getLocation: getLocation,
		move: move,
		toString: toString
	};
};

FindTheLine.display = (function () {
	var ctx;
	
	function drawBoard () {
		ctx.save();
		
		ctx.fillStyle = "#000";		
		ctx.fillRect(0, 0, FindTheLine.settings.arenaWidth, FindTheLine.settings.arenaHeight);		
		
		ctx.restore();
	}
	
	function drawEnemies () {
		var i = 0;
		var l = FindTheLine.global.enemies.length;
		
		ctx.save();
		ctx.strokeStyle = "#fff";
		ctx.fillStyle = "#fff";		
		
		for (i; i < l; i++) {
			ctx.beginPath();
			ctx.arc(FindTheLine.global.enemies[i].getLocation().x, FindTheLine.global.enemies[i].getLocation().y, FindTheLine.settings.enemyRadius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
		
		ctx.restore();
	}
	
	function drawPlayer () {
		ctx.save();
		
		ctx.strokeStyle = "rgba(255, 0, 0, 0.65)";
		ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
		
		if (FindTheLine.state.mode === "drawing" || FindTheLine.state.mode === "moving") {
			if (FindTheLine.state.playerAreaRadius > FindTheLine.settings.playerRadius) {
				FindTheLine.state.playerAreaRadius *= FindTheLine.settings.slowDownFactor;
			} else {
				FindTheLine.state.playerAreaRadius = FindTheLine.settings.playerRadius;
			}
		} else if (FindTheLine.state.mode === "") {
			if (FindTheLine.state.playerAreaRadius < FindTheLine.settings.playerAreaRadius) {
				FindTheLine.state.playerAreaRadius *= FindTheLine.settings.speedUpFactor;
			} else {
				FindTheLine.state.playerAreaRadius = FindTheLine.settings.playerAreaRadius;
			}
		}
		
		ctx.beginPath();
		ctx.arc(FindTheLine.global.player.getLocation().x, FindTheLine.global.player.getLocation().y, FindTheLine.state.playerAreaRadius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		
		ctx.restore();
		
		ctx.save();
		
		ctx.strokeStyle = "#f00";
		ctx.fillStyle = "#f00";		
		
		ctx.beginPath();
		ctx.arc(FindTheLine.global.player.getLocation().x, FindTheLine.global.player.getLocation().y, FindTheLine.settings.playerRadius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		
		ctx.restore();
	}
	
	function drawPath () {
		var i = 0;
		var l = FindTheLine.global.path.length;
		
		ctx.save();
		ctx.strokeStyle = "#ff0";	
		
		ctx.beginPath();
		ctx.moveTo(FindTheLine.global.player.getLocation().x, FindTheLine.global.player.getLocation().y);
		for (i; i < l; i++) {
			ctx.lineTo(FindTheLine.global.path[i].x, FindTheLine.global.path[i].y);
		}
		ctx.stroke();
		
		ctx.restore();
	}	
	
	function redraw () {
		drawBoard();
		drawEnemies();
		drawPlayer();
		drawPath();
	}
	
	function displayScore (total, plus) {
		var updateDelay = 0;
		var plusContainer = document.getElementById("plus");
		var pluses = plusContainer.getElementsByTagName("li");
		if (plus) {
			if ((pluses.length === 0) || (pluses[pluses.length - 1].className.indexOf("added") >= 0)) {
				plusContainer.appendChild(document.createElement("li"));
				pluses = plusContainer.getElementsByTagName("li");
			}
			pluses[pluses.length - 1].innerHTML = plus;
		} else if (plus === undefined) {
			for (var i = 0; i < pluses.length; i++) {
				if (pluses[i].className.indexOf("added") === -1) {
					pluses[i].className = "added";
					var removePlus = (function (plusNode) {
						return function () { plusContainer.removeChild(plusNode); };
					})(pluses[i]);
					setTimeout(removePlus, FindTheLine.settings.bankTransitionTime);
				}
			}
			updateDelay = FindTheLine.settings.bankTransitionTime * 0.5;
		}
		setTimeout(function() { document.getElementById("scoreboard").innerHTML = total; }, updateDelay);
	}
	
	function debug (msg) {
		document.getElementById("debug").innerHTML = msg + " || " + document.getElementById("debug").innerHTML;
	}
	
	function announce (msg) {
		console.log(msg);
	}
	
	function init () {
		ctx = FindTheLine.global.canvas.getContext('2d');
	}
	
	return {
		redraw: redraw,
		displayScore: displayScore,
		debug: debug,
		announce: announce,
		init: init
	};
}());

FindTheLine.scorekeeper = (function () {
	var total = 0;
	var lineScore = 0;
	var multiplier = 1;
	
	function incrementLineScore (steps) {
		steps = isNaN(steps) ? 1 : steps;
		lineScore += steps * (FindTheLine.settings.baseLineSegmentScore * multiplier * (FindTheLine.state.masterGameSpeed * FindTheLine.settings.gameSpeedPointFactor) * (FindTheLine.state.maxEnemies * FindTheLine.settings.maxEnemiesPointFactor));
		multiplier += steps * FindTheLine.settings.scoreMultiplierIncrement;
		FindTheLine.display.displayScore(total, Math.floor(lineScore));
	}
	
	function bank () {
		total += Math.floor(lineScore);
		FindTheLine.display.displayScore(total);
		lineScore = 0;
		multiplier = 1;
	}
	
	function trackHighScore () {
		//FindTheLine.display.debug(document.cookie);
	}
	
	return {
		incrementLineScore: incrementLineScore,
		bank: bank,
		trackHighScore: trackHighScore
	};
}());

FindTheLine.controller = (function () {
	var cursorX, cursorY, cursorPoint, loopInterval;
	
	function incrementState () {
		if (FindTheLine.state.mode === "") {
			FindTheLine.state.speedingUp = false;
			FindTheLine.state.slowingDown = true;
			extendPath(); // sets the first point on the path to the mouse location
			FindTheLine.state.mode = "drawing";
		} else if (FindTheLine.state.mode === "drawing") {
			FindTheLine.state.slowingDown = false;
			FindTheLine.state.speedingUp = true;
			FindTheLine.state.mode = "moving";
		} else if (FindTheLine.state.mode === "moving") {
			FindTheLine.state.linesDrawn++;
			FindTheLine.scorekeeper.bank();
			FindTheLine.state.mode = ""; // done moving
		}
	}

	function startDrag (e) {
		e.preventDefault();
		cursorX = e.layerX;
		cursorY = e.layerY;
		cursorPoint = new FindTheLine.Point(cursorX, cursorY);
		if (FindTheLine.global.player.getLocation().distanceTo(cursorPoint) <= FindTheLine.settings.playerAreaRadius && FindTheLine.state.mode === "") {
			incrementState(); // "" -> "drawing"
		}
	}
	
	function endDrag (e) {
		e.preventDefault();
		if (FindTheLine.state.mode === "drawing") {
			incrementState(); // "drawing" -> "moving"
		}
	}
	
	function trackCursor (e) {
		e.preventDefault();
		cursorX = e.layerX;
		cursorY = e.layerY;
		cursorPoint = new FindTheLine.Point(cursorX, cursorY);
		if (cursorX < 0 || cursorX > FindTheLine.settings.arenaWidth || cursorY < 0 || cursorY > FindTheLine.settings.arenaHeight) {
			endDrag(e);
		}
	}

	function establishListeners () {
		FindTheLine.global.canvas.onmousedown = startDrag;
		FindTheLine.global.canvas.onmouseup = endDrag;
		FindTheLine.global.canvas.onmousemove = trackCursor;
		
		FindTheLine.global.canvas.ontouchstart = startDrag;
		FindTheLine.global.canvas.ontouchend = endDrag;
		FindTheLine.global.canvas.ontouchleave = endDrag;
		FindTheLine.global.canvas.ontouchcancel = endDrag;
		FindTheLine.global.canvas.ontouchmove = trackCursor;
	}
	
	function adjustGameSpeed () {
		if (FindTheLine.state.slowingDown === true) {
			if (FindTheLine.state.gameSpeed > FindTheLine.settings.slowGameSpeed) {
				FindTheLine.state.gameSpeed *= FindTheLine.settings.slowDownFactor;
			} else {
				FindTheLine.state.gameSpeed = FindTheLine.settings.slowGameSpeed;
				FindTheLine.state.slowingDown = false;
			}
		} else if (FindTheLine.state.speedingUp === true) {
			if (FindTheLine.state.gameSpeed < FindTheLine.state.masterGameSpeed) {
				FindTheLine.state.gameSpeed *= FindTheLine.settings.speedUpFactor;
			} else {
				FindTheLine.state.gameSpeed = FindTheLine.state.masterGameSpeed;
				FindTheLine.state.speedingUp = false;
			}
		}
	}
	
	function updatePlayerLocation () {
		var nextPoint = false;
		var distanceToGo = FindTheLine.state.gameSpeed;
		var startPoint = FindTheLine.global.player.getLocation();
		var d, testPoint;
		
		while (!nextPoint && FindTheLine.global.path.length > 0) {
			testPoint = FindTheLine.global.path.shift();
			d = startPoint.distanceTo(testPoint);
			if (distanceToGo === d) {
				nextPoint = testPoint;
			} else if (distanceToGo > d) {
				if (FindTheLine.global.path.length > 0) {
					startPoint = testPoint;
					distanceToGo = distanceToGo - d;
				} else {
					nextPoint = testPoint;
				}
			} else {
				FindTheLine.global.path.unshift(testPoint);
				nextPoint = startPoint.pointInLine(testPoint, distanceToGo);
			}
		}
		
		if (nextPoint) {
			FindTheLine.global.player.movePlayerTo(nextPoint);
		} else {
			incrementState(); // "moving" -> ""
		}
	}
	
	function extendPath () {
		if (FindTheLine.global.path.length > 0) {
			FindTheLine.scorekeeper.incrementLineScore(cursorPoint.distanceTo(FindTheLine.global.path[FindTheLine.global.path.length - 1]));
		}
		FindTheLine.global.path.push(cursorPoint);
	}
	
	function updateEnemyLocations () {
		var i = 0;
		var l = FindTheLine.global.enemies.length;
		var newEnemies = [];
		
		for (i; i < l; i++) {
			FindTheLine.global.enemies[i].move();
			if ((FindTheLine.global.enemies[i].getLocation().x >= 0) && (FindTheLine.global.enemies[i].getLocation().x <= FindTheLine.settings.arenaWidth) && (FindTheLine.global.enemies[i].getLocation().y >= 0) && (FindTheLine.global.enemies[i].getLocation().y <= FindTheLine.settings.arenaHeight)) {
				newEnemies.push(FindTheLine.global.enemies[i]);
			}
		}
		FindTheLine.global.enemies = newEnemies;
	}
	
	function addEnemy () {
		var startPos, x, y;
		
		if ((FindTheLine.global.enemies.length < FindTheLine.state.maxEnemies) && (FindTheLine.helpers.rnd() > FindTheLine.settings.spawnThreshold)) {
			startPos = FindTheLine.helpers.rnd(0, FindTheLine.settings.arenaWidth + FindTheLine.settings.arenaHeight);
			if (startPos <= FindTheLine.settings.arenaWidth) {
				x = startPos;
				y = 0;
			} else {
				x = FindTheLine.settings.arenaWidth;
				y = startPos - FindTheLine.settings.arenaWidth;
			}
			FindTheLine.global.enemies.push(new FindTheLine.Enemy(x, y));
		}
	}
	
	function isGameOver () {
		var i = 0;
		var l = FindTheLine.global.enemies.length;
		var collisionDistance = FindTheLine.settings.playerRadius + FindTheLine.settings.enemyRadius;
		var theEnemy;
		
		for (i; i < l; i++) {
			theEnemy = FindTheLine.global.enemies[i];
			if (FindTheLine.global.player.getLocation().distanceTo(theEnemy.getLocation()) <= collisionDistance) {
				return true;
			}
		}
		
		return false;
	}
	
	function updateLevel () {
		if (FindTheLine.state.linesDrawn >= FindTheLine.settings.linesPerLevel) {
			console.log("level up!");
			FindTheLine.state.level++;
			FindTheLine.state.linesDrawn = 0;
			FindTheLine.state.maxEnemies += FindTheLine.settings.enemyIncreasePerLevel;
			FindTheLine.state.masterGameSpeed += FindTheLine.settings.speedIncreasePerLevel;
		}
	}
	
	function gameLoop () {
		adjustGameSpeed();
		
		if (FindTheLine.state.mode === "moving") {
			updatePlayerLocation();
		} else if (FindTheLine.state.mode === "drawing") {
			extendPath();
		}
		
		updateEnemyLocations();
		addEnemy();
		
		FindTheLine.display.redraw();
		
		if (FindTheLine.debug.collisions && isGameOver()) {
			FindTheLine.state.gameOver = true;
			FindTheLine.scorekeeper.trackHighScore();
			FindTheLine.display.announce("collision!");
			clearInterval(loopInterval);
		} else {
			updateLevel();
		}
	}

	function init (canvasId) {
		FindTheLine.global.canvas = document.getElementById(canvasId);
		
		FindTheLine.display.init();
		
		FindTheLine.state.masterGameSpeed = FindTheLine.settings.initGameSpeed;
		FindTheLine.state.gameSpeed = FindTheLine.settings.initGameSpeed;
		FindTheLine.state.maxEnemies = FindTheLine.settings.maxEnemies;
		FindTheLine.state.playerAreaRadius = FindTheLine.settings.playerAreaRadius;

		FindTheLine.global.player = new FindTheLine.Player();
		
		establishListeners();

		addEnemy();
		
		FindTheLine.display.redraw();

		loopInterval = setInterval(gameLoop, FindTheLine.settings.drawInterval);
	}
	
	return {
		init: init
	};
}());

FindTheLine.init = FindTheLine.controller.init;