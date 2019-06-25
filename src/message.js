const {cooldownDuration, language} = require("./config.json");
const {readFileSync} = require("fs");
const {flatten} = require("lodash");
let TEXT;
try {
	TEXT = require(`./lines/${language}.json`);
} catch (e) {
	TEXT = require(`./lines/en.json`);
}

class MessageHandler {
	constructor(channel) {
		this.messages = [];
		this.channel = channel;
	};
};

MessageHandler.prototype.flushMessages = function() {
	let toFlush = flatten(this.messages.map(message => {
		return [this.sendCrude.apply(this, message), cooldown()];
	}));

	this.messages.length = 0;
	
	return Promise.all(toFlush);
};

MessageHandler.prototype.formatMessage = function(identifier, ...parameters) {
	let message = TEXT[identifier];
	if (message) {
		for (let argument of parameters) {
			message = message.replace("%s", argument);
		}
		return message;
	} else {
		throw new Error(`No message available for "${identifier}" identifier (language ${language}). All identifiers must have an appropriate message.`)
	}
};

MessageHandler.prototype.send = function(identifier, ...parameters) {
	let message = this.formatMessage(identifier, ...parameters);
	return this.sendCrude(message);
};

MessageHandler.prototype.sendCrude = function(...items) {
	return new Promise((resolve, reject) => {
		this.channel.send.apply(this.channel, items).then((message) => {
			cooldown().then(() => {
				resolve(message);
			});
		});
	});
};

MessageHandler.prototype.stackMessage = function(identifier, ...parameters) {
	this.stackCrudeMessage(this.formatMessage(identifier, ...parameters));
};

MessageHandler.prototype.stackCardMessage = function(message) {
	this.stackCrudeMessage(`The drawn card says, "${message}".`);
};

MessageHandler.prototype.stackCrudeMessage = function(...message) {
	this.messages.push(message);
};

function cooldown(duration = cooldownDuration) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, duration * 1000);
	});
}

module.exports = MessageHandler;
