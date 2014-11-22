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