var SlackBot = require('slackbots');
var Railbot = new SlackBot({
	token: 'TOKEN HERE',
	name: '30railsbot',
});
var channelName = '30-rails';

Railbot.on('start', function(data) {
	var text = '*30 Rails bot ready to choo choo!*\n' +
		'Type `help` to see game options, or `start` to being a new game';
	Railbot.postMessageToChannel(channelName, text);
});

var FatController = {
	turn: 1,
	totalTurns: 5,
	timeout: null,
	interval: 5000,
	inProgress: false,
	channelParams: {
		icon_emoji: ':monorail:',
		'as_user': false,
	},
	init: function() {
		// Reset everything
		this.turn = 1;
		clearTimeout(this.timeout);
		var text = '*Setting up a new game!*';
		this.postMessage(text);
	},
	startGame: function() {
		// Init
		this.init();
		// Start the game!
		this.prepareNextTurn();
		this.inProgress = true;
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
			'- start: begins a new game.\n' +
			'- stop: stops the current game\n' + 
			'- pause: pauses the current game\n' +
			'- resume: pauses the current game\n' +
			'- next: forces the next turn to happen\n' +
			'- help: shows this help text\n' +
			'```';

		this.postMessage(text);
	},
	postMessage: function(text) {
		Railbot.postMessageToChannel(channelName, text, this.channelParams);
	},
	doTurn: function() {
		if (!this.inProgress) {
			return;
		}
		if (this.turn > this.totalTurns) {
			this.endGame();
			return;
		}
		var text = '*Turn ' + this.turn + '*\n' +
			'```' +
			'White dice: ' + this.rollDice() + '\n' +
			'Red dice: ' + this.rollDice() +
			'```';
		this.postMessage(text);
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

