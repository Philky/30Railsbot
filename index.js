/**
 * Config
 */
var token = '';
var channelName = '30-rails';
var channelParams = {
	icon_emoji: ':monorail:',
	'as_user': false,
};

/**
 * 30 Rails bot
 */
var SlackBot = require('slackbots');
var Railbot = new SlackBot({
	token: token,
	name: '30railsbot',
});

Railbot.on('start', function(data) {
	var text = '*30 Rails bot ready to choo choo!*\n' +
		'Type `help` to see game options, or `start` to being a new game';
	Railbot.postMessageToChannel(channelName, text, channelParams);
});

/**
 * Main controller code
 */
var FatController = {
	turn: 1,
	totalTurns: 30,
	timeout: null,
	interval: 10 * 60 * 1000, // Default to 10 minutes
	setupInstructionsInterval: 5000,
	inProgress: false,
	init: function(options) {
		var self = this;
		// Reset everything
		this.turn = 1;
		clearTimeout(this.timeout);
		if (options) {
			this.interval = options.interval;
		} else {
			this.interval = 10 * 60 * 1000; // Default to 10 minutes
		}
		var text = '*Setting up a new game!*\n';
		text += 'To play this game, you will need a pen or pencil, and to download and print the 30 rails map from here: ' +
			'https://boardgamegeek.com/boardgame/200551/30-rails';
		this.postMessage(text);
		setTimeout(function() {
			self.doSetupAndStart(1);
		}, 2000);
	},
	doSetupAndStart(step) {
		var self = this;
		var text = null;
		clearTimeout(this.timeout);
		if (step === 1) {
			text = '*Step 1: Add mountains.*\n';
			text += 'First you need to place 5 mountains on your map.';
			text += ' Mountains are represented via a chevron symbol "^".\n';
			var rows = [1,2,3,4,5,6];
			var rowToRemove = this.rollDice() - 1;
			rows.splice(rowToRemove, 1);
			for (var i = 1; i < 6; i++) {
				text += 'Place mountain ' + i + ' at *Row: ' + 
					rows[i - 1] + ', Column: ' + 
					this.rollDice() + '*\n';
			}
			this.timeout = setTimeout(function() {
				self.doSetupAndStart(2);
			}, this.setupInstructionsInterval);
		} else if (step === 2) {
			text = '*Step 2: Add mine.*\n';
			text += 'Next select one space that is orthoganally adjacent to a mountain ' + 
				'(immediately north, south, east or west), ' +
				'and write the letter "M" in that space. This represents a mine.';
			this.timeout = setTimeout(function() {
				self.doSetupAndStart(3);
			}, this.setupInstructionsInterval);
		} else if (step === 3) {
			text = '*Step 3: Add stations.*\n';
			text += 'Write each of the numbers from 1 to 4 in one of the grey squares around' +
				' the edge of the map. One number must be written on each of the four sides' +
				' of the map. Each number represents a station. You will score more for' +
				' connecting the higher numbered stations.';
			this.timeout = setTimeout(function() {
				self.doSetupAndStart(4);
			}, this.setupInstructionsInterval);
		} else if (step === 4) {
			text = '*Step 4: Add bonus square.*\n';
			text += 'Finally, highlight one "bonus" square on the map. This may be marked by lightly shading; ' +
				'by marking the corner, or by drawing around the outline of a sqaure.';
			this.timeout = setTimeout(function() {
				self.doSetupAndStart(5);
			}, this.setupInstructionsInterval);
		} else if (step === 5) {
			text = '*Overrides.*\n';
			text += 'Twice during the game you may override the rolled value of a die and use any value of your ' +
				'choice. This may be done once for the white die and once for the coloured die. The two overrides ' +
				'may both be done on the same turn, or each on separate turns.\n' +
				'When an override is used, cross out the corresponding die symbol in the "Overrides" ' +
				'section of the board.';
			this.timeout = setTimeout(function() {
				self.doSetupAndStart();
			}, this.setupInstructionsInterval);
		} else {
			// Start the game!
			this.inProgress = true;
			var minutes = this.interval / 1000 / 60;
			text = '*Starting game, Good luck! Turns will happen every ' + minutes + ' minutes*\n';
			this.timeout = setTimeout(function() {
				self.doTurn();
			}, 2000);
		}
		this.postMessage(text);
	},
	startGame: function(options) {
		// Init
		this.init(options);
	},
	endGame: function(forced) {
		clearTimeout(this.timeout);
		var text = '*Game finished! Add up your score!*';
		if (forced) {
			text = '*Game stopped!*';
		}
		this.postMessage(text);
		this.inProgress = false;
	},
	pauseGame: function() {
		if (!this.inProgress) {
			return;
		}
		clearTimeout(this.timeout);
		var text = '*Game paused! Type `resume` to continue.*';
		this.postMessage(text);
	},
	resumeGame: function() {
		if (!this.inProgress) {
			return;
		}
		var self = this;
		this.postMessage('*Game resumed!*');
		setTimeout(function() {
			self.doTurn();
		}, 500);
	},
	prepareNextTurn: function() {
		var self = this;
		clearTimeout(this.timeout);
		this.timeout = setTimeout(function() {
			self.doTurn();
		}, this.interval);
	},
	showHelpText: function() {
		var text = '*How to use the 30 rails bot:*\n' +
			'```' +
			'start: begins a new game. Default turn interval is ' + this.interval / 1000 / 60 + ' minutes\n' +
			'    -t <interval> : Start a game specifying the turn interval in minutes\n' +
			'stop: stops the current game\n' + 
			'pause: pauses the current game\n' +
			'resume: resumes the current game\n' +
			'next: forces the next turn to happen\n' +
			'help: shows this help text\n' +
			'```';
		this.postMessage(text);
	},
	postMessage: function(text) {
		Railbot.postMessageToChannel(channelName, text, channelParams);
	},
	doTurn: function() {
		if (!this.inProgress) {
			return;
		}
		var text = '*Turn ' + this.turn + '*\n' +
			'Row / Column: ' + this.rollDice() + '\n' +
			'Track type: :30rails-' + this.rollDice() + ':';
		this.postMessage(text);
		if (this.turn >= this.totalTurns) {
			this.endGame();
			return;
		}
		this.turn++;
		this.prepareNextTurn();
	},
	rollDice: function() {
		return Math.floor((Math.random() * 6) + 1);
	}
};

/**
 * Main listener
 */
Railbot.on('message', function(message) {
	if (message.text === 'start') {
		FatController.startGame();
	} else if (message.text && message.text.indexOf('start -t') !== -1) {
		var options = {};
		var split = message.text.split('-t');
		// More switches, setup start options
		options.interval = split[1] * 60 * 1000;
		FatController.startGame(options);
	}
	if (message.text === 'pause') {
		FatController.pauseGame();
	}
	if (message.text === 'resume') {
		FatController.resumeGame();
	}
	if (message.text === 'next') {
		FatController.doTurn();
	}
	if (message.text === 'stop') {
		FatController.endGame(true);
	}
	if (message.text === 'help') {
		FatController.showHelpText();
	}
});

