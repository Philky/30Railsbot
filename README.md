# 30Railsbot
Bot to run the 30 rails pen and paper game in slack.

You can downloaded the print out to play from: https://boardgamegeek.com/boardgame/200551/30-rails

## Installation

1. Clone this repo to a location you want to run the node server.
2. Add the included image files as emoji to your slack account. The emoji names should be:
	* :30rails-1:
	* :30rails-2:
	* :30rails-3:
	* :30rails-4:
	* :30rails-5:
	* :30rails-6:
3. Create a new 'Bot' custom integration in slack.
4. Edit the index.js file, and at the top add the API token from the newly created bot near the top of the file.
5. Create a new channel in slack called '30-rails', or edit the channel name in the top of index.js to one of your choosing.
6. Type `node index.js` to start the bot.

## Usage

Simply type `help` in the channel the bot is active in to see a list of commands available.