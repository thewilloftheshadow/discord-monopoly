module.exports = {
	addUser: function(session, channel) {
		return function(msg) {
			let behavior = session.addPlayer(msg).toString();
			channel.send({
				"false": "User not found.",
				"true": "Player successfully added.",
				"already here": "Player already in the list."
			}[behavior]);
		};
	},
	clearList: function(session, channel) {
		return function(msg) {
			let originalSize = session.players.size;
			session.players.clear();
			channel.send({
				"false": "No player was in the list.",
				"true": "List successfully cleared."
			}[Boolean(originalSize)]);
		};
	},
	commencePlay: function(session, channel, collectors) {
		return function() {
			if (session.players.size >= 2) {
				for (let collector of collectors) {
					collector.stop();
				}
				session.messageHandler.send("start").then(() => {
					session.startGame();
				});
			} else {
				let leftPlayers = 2 - session.players.size;
				session.messageHandler.send("notEnoughPlayers", leftPlayers);
			}
		}
	},
	endGame: function(session, channel, currentSessions) {
		return session.endGame.bind(session, currentSessions);
	},
	handleJailDecision: function(player, session) {
		return function(collected, reason) {
			let message = collected.first();
			if (reason === "time") {
				session.messageHandler.sendCrude(`You took more than ${turnDuration} seconds to decide. You will stay in jail one more turn.`).then(() => {
					player.turnsInJail++;
					session.toggleTurns();
				});
			} else {
				let decision = +message.content;
				let action = {
					1: function() {
						session.messageHandler.stackCrudeMessage("You have decided to stay one more turn in jail.");
						player.turnsInJail++;
					},
					2: function() {
						player.pay(50);
						player.free({reason: "fine"});
					},
					3: function() {
						if (player.ownsFreedomCommunity) {
							player.ownsFreedomCommunity = false;
						} else if (player.ownsFreedomChance) {
							player.ownsFreedomChance = false;
						}
						player.free({reason: "card"});
					}
				}[decision];
				runAction(session, action).then(() => {
					session.toggleTurns();
				});
			}
		};
	},
	removeUser: function(session, channel) {
		return function(msg) {
			let behavior = session.removePlayer(msg).toString();
			channel.send({
				"null": "User not found.",
				"true": "Player successfully removed.",
				"false": "Player is not in the list."
			}[behavior]);
		};
	}
}

function runAction(session, action) {
	return new Promise((resolve, reject) => {
		action();
		session.messageHandler.flushMessages().then(() => {
			resolve("for the lulz");
		});
	});
}
