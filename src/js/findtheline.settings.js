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