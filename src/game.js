const {MessageCollector} = require("discord.js");
const Session = require("./session.js");
const collectors = require("./collectors.js");
const config = require("./config.json");
const callbacks = require("./collectorCallbacks.js");
const MessageHandler = require("./message.js");
let currentSessions = [];

module.exports = function(message) {
	let {channel, content} = message;
	if (content === `${config.prefix}play`) {
		if (!currentSessions.includes(channel.id)) {
			let session = new Session(channel);
			channel.send("Starting a new game on channel \"" + channel.name + "\"");
			let playerAdder = collectors.handlePlayersList("add", channel);
			let playerRemover = collectors.handlePlayersList("remove", channel);
			let listClearer = collectors.handlePlayersList("clear", channel);
			let gameStarter = collectors.handleSessionStart("start", session, channel);
			let gameEnder = collectors.handleStatusChange("end", channel);
			playerAdder.on("collect", callbacks.addUser(session, channel));
			playerRemover.on("collect", callbacks.removeUser(session, channel));
			listClearer.on("collect", callbacks.clearList(session, channel));
			gameStarter.on("collect", callbacks.commencePlay(session, channel, [playerAdder, listClearer]));
			gameEnder.on("collect", callbacks.endGame(session, channel, currentSessions));
			currentSessions.push(channel.id);
		} else {
			channel.send(`This channel already has an ongoing session. If you want to end it, please type \`${config.prefix}end\`.`);
		}
	}
};
