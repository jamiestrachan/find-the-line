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
			/* jshint ignore:start */
			for (var i = 0; i < pluses.length; i++) {
				if (pluses[i].className.indexOf("added") === -1) {
					pluses[i].className = "added";
					var removePlus = (function (plusNode) {
						return function () { plusContainer.removeChild(plusNode); };
					})(pluses[i]);
					setTimeout(removePlus, FindTheLine.settings.bankTransitionTime);
				}
			}
			/* jshint ignore:end */
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