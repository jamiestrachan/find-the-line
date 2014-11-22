FindTheLine.Enemy = function (startX, startY) {
	var location = new FindTheLine.Point(startX, startY);
	var deltaX = FindTheLine.settings.enemyDeltaX;
	var deltaY = FindTheLine.settings.enemyDeltaY;
	var radius = FindTheLine.helpers.rnd(FindTheLine.settings.enemyRadius, FindTheLine.settings.enemyRadius + ((FindTheLine.state.level - 1) * FindTheLine.settings.enemyRadiusLevelModifier));
	
	function getLocation () {
		return location;
	}
	
	function getRadius () {
		return radius;
	}

	function move () {
		location = location.move(deltaX * FindTheLine.state.gameSpeed, deltaY * FindTheLine.state.gameSpeed);
	}
	
	function toString () {
		return location.toString();
	}
	
	return {
		getLocation: getLocation,
		getRadius: getRadius,
		move: move,
		toString: toString
	};
};