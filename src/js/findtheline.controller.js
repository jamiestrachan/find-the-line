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
			FindTheLine.display.announce("collision!");
			stop();			
		} else {
			updateLevel();
		}
	}

	function stop () {
		FindTheLine.state.gameOver = true;
		FindTheLine.scorekeeper.trackHighScore();
		clearInterval(loopInterval);
	}

	function reset () {
		FindTheLine.global.player = {};
		FindTheLine.global.enemies = [];
		FindTheLine.global.path = [];

		FindTheLine.scorekeeper.reset();
	}

	function start () {		
		FindTheLine.state.masterGameSpeed = FindTheLine.settings.initGameSpeed;
		FindTheLine.state.gameSpeed = FindTheLine.settings.initGameSpeed;
		FindTheLine.state.maxEnemies = FindTheLine.settings.maxEnemies;
		FindTheLine.state.playerAreaRadius = FindTheLine.settings.playerAreaRadius;

		FindTheLine.global.player = new FindTheLine.Player();

		addEnemy();
		
		FindTheLine.display.redraw();

		loopInterval = setInterval(gameLoop, FindTheLine.settings.drawInterval);
	}

	function init (canvasId) {
		FindTheLine.global.canvas = document.getElementById(canvasId);
		
		FindTheLine.display.init();

		establishListeners();
		
		start();
	}
	
	return {
		stop: stop,
		reset: reset,
		start: start,
		init: init
	};
}());

FindTheLine.init = FindTheLine.controller.init;
FindTheLine.stop = FindTheLine.controller.stop;
FindTheLine.reset = FindTheLine.controller.reset;
FindTheLine.start = FindTheLine.controller.start;