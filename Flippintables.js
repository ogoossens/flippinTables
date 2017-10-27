/*
 Flippin Tables Doodle Game
 Created by Oliver Goossens
 oliver.goossens [] gmail.com
 GNU LGPL 2.1 License
 Version 1.0
 */

// Makes working with domain issues easier
const local = true;

// Keyboard controls
// Defaults
// Great source for key codes: http://keycode.info/
const spaceBarCode = 32;
let gameStarted = false;

// Canvas/Display variables and helpers
let pixelSize;
let canvasDiv;
let widthPixels = 10;
let heightPixels = 3;
const relativeWidth = 1000;

// Elements on screen
let player;
let table;

// Define my colors for later
let colors = [];

// My timers
let gameTimer;

/*
 Preloading any bigger data happens here
 Content loading from remote location (even local disc when running locally)
 has to be disabled becasue of cross domain restrictions
 Mostly reserver for sound, images and font preloading
 */
function preload() {
	// Load Font
	if (!local) {
		customFont = loadFont("./res/AnonymousProB.ttf");
	}
}

// This function (by p5) runs only once at the very beginning
function setup() {
	frameRate(60);

	// For size calculation of parent DIV
	canvasDiv = document.getElementById('sketch-holder');

	// Create canvas
	// Calculate and set canvas dimenstions
	let calculated = calculateCanvasValues();
	let canvas = createCanvas(calculated[0], calculated[1]);

	// Place the canvas into this DIV
	canvas.parent('sketch-holder');

	// Fill the color data
	colors = [
		color(44, 184, 1),
		color(255, 198, 0),
		color(232, 0, 0),
		color(255, 204, 0),
		color(160, 25, 203),
		color(212, 165, 2)
	];

	// All fonts will be the same
	if (!local) {
		textFont(customFont);
	}

	// We dont need any strokes from p5
	noStroke();

	// Create objects
	player = new playerObject();
	table = new tableObject();

	// Start timers
	gameTimer = new customTimer();

	// Later we will use the SIN function - I like degrees more
	angleMode(DEGREES);

	textFont("Trebuchet MS");
	noStroke();
}

// This method (by p5) is looped all the time
// This main method controls the entire functionality
// From simulation, drawing to initialization and game stages control
function draw() {
	background(255);

	player.draw();
	table.draw();

	//guideLines(3);

}

function guideLines(depth) {
	let lines = Math.pow(2, depth);
	stroke(220);
	for (let i = 0; i < lines; i++) {
		line((width / lines) * i, 0, (width / lines) * i, height);
		line(0, (height / lines) * i, width, (height / lines) * i);
	}
}

class tableObject {
	constructor() {
		this.flipped = false;
		this.position = width / 4 * 3;
		this.speedMultiplier = 1;
		this.lastMovement = millis();

		this.tableForm = [
			"┳━┳",
			"┻━┻"
		]
	}

	getForm() {
		return !this.flipped ? 0 : 1;
	}

	draw() {
		fill(80);
		textSize(height / 8 * 4);
		let heightAdjustment = !this.flipped ? 0 : height / 8 * 1.7;
		if (gameStarted) {
			text(this.tableForm[this.getForm()], this.getPositionX(), height / 8 * 5 + heightAdjustment);
		}
	}

	resetTable() {
		this.position = width;
		this.flipped = false;
	}

	getPositionX() {
		if (gameStarted) {
			let adjustment = width / relativeWidth;
			let moveBy = millis() - this.lastMovement;
			this.position = this.position - (adjustment / moveBy * 60) * this.speedMultiplier;
			this.lastMovement = millis();
			if (this.position < -width / 2) {
				if (this.flipped) {
					this.speedMultiplier += 0.7;
				} else {
					player.minusLife();
					player.checkIfDead();
				}
				this.resetTable();
			}
		}
		return this.position;
	}
}

class playerObject {
	constructor() {

		this.life = 5;
		this.score = 0;

		// Player Faces
		this.faces = [
			"( ʘ̅_ʘ̅)",
			"( ʘ_ʘ)",
			"(╮◉.◉)╮",
			"(╯◉□◉)╯",
			"(  ^_^)",
			"(  °̅_°̅)",
			"( x_x)",
		];
	}

	minusLife() {
		this.life -= 1;
	}

	checkIfDead() {
		if (this.life < 1) {

			gameStarted = false;
			this.score = 0;
			table.resetTable();
			table.speedMultiplier = 1;
			this.life = 5;

		}
	}

	getFace() {
		let current = millis() - this.pressedAt;

		if (this.life > 0 && gameStarted) {

			if (current < 500) {

				switch (true) {
					case (current < 100):
						if ((table.position < width / 8 * 4 && table.position > 0) && !table.flipped) {
							table.flipped = true;
							this.score += 1;
						}
						return 2;
					default :
						return 3;
				}
			} else {

				if (table.position < width / 8 * 4 && table.position > 0) {
					return table.flipped ? 4 : 0;
				} else if (table.position < width / 8 && table.position > -width / 8 * 3) {
					return table.flipped ? 4 : 5;
				} else {
					return 1;
				}
			}
		} else {
			return 6;
		}
	}

	flipNow() {
		if (!((table.position < width / 8 * 4 && table.position > 0)) && !table.flipped) {
			this.minusLife();
		}
		this.pressedAt = millis();
	}

	draw() {
		fill(0);
		textSize(height / 8 * 4);
		text(this.faces[this.getFace()], width / 8, height / 8 * 4);

		// draw life
		textSize(height / 8);
		textAlign(RIGHT);
		if (gameStarted) {
			for (let i = 0; i < this.life; i++) {
				rect(width - (height / 20) - i * (height / 20) * 2, (height / 20), height / 20, height / 20);
			}

			text(this.score, width - (height / 20), height / 8 * 2);

		} else {
			text("PRESS SPACE", width - (height / 20), height / 8 * 2);
		}
		textAlign(LEFT);
	}
}

// Resized window. function that is ran everytime a size changes
function windowResized() {
	let calculated = calculateCanvasValues();
	resizeCanvas(calculated[0], calculated[1]);
	table.resetTable();
}

// This method looks at the parent DIV and calculates new canvas size to fit
function calculateCanvasValues() {

	// (widthPixels/heightPixels) is the proportion value of the sides
	// Read the DIV current (new) size and adjust them to fit proportionally
	let tempWidth = canvasDiv.offsetWidth;
	let tempHeight = canvasDiv.offsetHeight;

	if (tempHeight * (widthPixels / heightPixels) > tempWidth) {
		tempHeight = tempWidth / (widthPixels / heightPixels);
	} else {
		tempWidth = tempHeight * (widthPixels / heightPixels);
	}

	// Calculate the one "logo" pixel size in pixels
	pixelSize = tempWidth / widthPixels;

	// Return the calculated values for new sizes
	return [tempWidth, tempHeight];
}

// Keyboard input
function keyPressed() {
	// 32 key code is space
	if (keyCode === spaceBarCode) {

		userInput();
		return false;

	}
	return 0;
}

function mousePressed() {
	userInput();
}

function userInput() {
	if (!gameStarted) {
		gameStarted = true;
	} else {

		player.flipNow();
	}
}

/*
 This method is a way for me to easily track timers and manage delays
 */
function customTimer(delayMS) {
	this.delayMS = delayMS;
	this.lastCheck = millis();
	this.created = this.lastCheck;

	this.go = function () {
		let current = millis();
		if ((current - this.lastCheck) > this.delayMS) {
			this.lastCheck = millis();
			return true;
		} else {
			return false;
		}
	};

	this.overDelay = function () {
		return this.sinceCreated() > this.getDelay();
	};

	this.wasCreated = function () {
		return this.created;
	};

	this.sinceCreated = function () {
		return (millis() - this.wasCreated());
	};

	this.getDelay = function () {
		return this.delayMS;
	};
	this.stopTime = function () {
		this.stopped = millis();
	};
	this.stoppedTime = function () {
		return this.stopped - this.created;
	}
}