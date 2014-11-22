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