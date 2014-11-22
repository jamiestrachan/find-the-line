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