const {MessageCollector} = require("discord.js");
let config = require("./config.json");
const getUser = require("./getUser.js");

module.exports = {
	handleSessionStart: function(assignedCommand, session, channel) {
		return new MessageCollector(channel, function(msg) {
			return session.players.size >= 1 && ownerSpoke(msg.author.id) && msg.content === `${config.prefix}!start`;
		}, {maxMatches: 1});
	},
	handleAuction: function(session, channel) {
		let time = config.bidDuration * 1000;
		return new MessageCollector(channel, function(msg) {
			return (
				(+msg.content && session.players.has(msg.author.id)) &&
				(msg.content <= session.players.get(msg.author.id).cash)
			);
		}, {time});
	},
	handleTurn: function(decidingPlayer, channel) {
		let time = config.turnDuration * 1000;
		return new MessageCollector(channel, function(msg) {
			return msg.content === `${config.prefix}dice` && decidingPlayer.id === msg.author.id;
		}, {maxMatches: 1, time});
	},
	handleNumericalDecision: function(decidingPlayer, channel, cap) {
		let time = config.turnDuration * 1000;
		return new MessageCollector(channel, function(msg) {
			return decidingPlayer.id === msg.author.id && 
			+msg.content && +msg.content <= cap;
		}, {maxMatches: 1, time});
	},
	handlePlayersList: function(assignedCommand, channel) {
		return new MessageCollector(channel, function(msg) {
			return ownerSpoke(msg.author.id) && 
					(assignedCommand !== "clear" ?
				msg.content.startsWith(`${config.prefix}${assignedCommand}`) && getUser(msg)
			 : msg.content === `${config.prefix}${assignedCommand}`);
		});
	},
	handleStatusChange: function(status, channel) {
		return new MessageCollector(channel, function(msg) {
			return msg.content === `${config.prefix}${status}` && ownerSpoke(msg.author.id);
		}, {maxMatches: 1});
	}
};

function ownerSpoke(id) {
	if (Array.isArray(config.owners)) {
		return config.owners.includes(id);
	} else {
		return config.owners === id;
	}
};
