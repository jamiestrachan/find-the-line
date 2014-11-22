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