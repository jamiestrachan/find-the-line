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