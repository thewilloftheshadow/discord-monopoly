const Board = require("./board.json");
const {isEqual} = require("lodash");

class Player {
	constructor(user, session) {
		this.id = user.id;
		this.username = user.username;
		this.cash = 1500;
		this.properties = new Map();
		this.isJailed = false;
		this.ownsFreedomChance = false;
		this.ownsFreedomCommunity = false;
		this._position = 0;
		this.session = session;
		this.turnsInJail = 0;
	};

	get canBeFreed() {
		return this.ownsFreedomCommunity || this.ownsFreedomChance;
	};

	get position() {
		return Board[this._position];
	};
};

Player.prototype.advance = function(number) {
	let newPosition = this._position + number;

	if (newPosition >= Board.length) {
		this._position = newPosition - Board.length;
	} else {
		this._position = newPosition;
	}
	if (newPosition === Board.length) {
		this.session.stackMessage(`${this.username} reached Go.`);
		this.earn(200);
	} else if (newPosition > Board.length) {
		this.session.stackMessage(`${this.username} passed by Go.`);
		this.earn(200);
		this.session.stackMessage(`${this.username} stopped at ${this.position.name}.`);
	}
};

Player.prototype.buy = function(property, amount) {
	this.pay(amount || property.cost);
	property.owner = this;
	this.session.setTakenProperty(property, this);
	this.session.stackMessage(`${this.username} now owns ${property.name}`);
};

Player.prototype.earn = function(amount) {
	this.cash += amount;
	this.session.stackMessage(`${this.username} earned ${amount}.`);
};

Player.prototype.jail = function(reason) {
	this.isJailed = true;
	this.session.stackMessage({
		"card": `${this.username} drew a Go to Jail card and was jailed.`,
		"tile": `${this.username} stepped on Go to Jail and was jailed.`,
		"3 doubles": `${this.username} made 3 doubles, and went to jail. `
	}[reason.reason])
};

Player.prototype.free = function(reason) {
	this.isJailed = false;
	this.session.stackMessage({
		"card": `${this.username} consumed a freedom card and was freed.`,
		"3 turns": `${this.username} stayed in jail for too long and was freed.`,
		"doubles": `${this.username} rolled a double and did a barrel roll out of jail.`,
		"fine": `${this.username} paid some money ($50) and was freed.`
	}[reason.reason]);
	if (reason.reason === "card") {
		if (this.ownsFreedomCommunity) {
			this.ownsFreedomCommunity = false;
		} else if (this.ownsFreedomChance) {
			this.ownsFreedomChance = false;
		}
	}
};

Player.prototype.goBack = function(number) {
	this._position -= number;
	if (this._position < 0) {
		this._position += Board.length;
	}
	this.session.stackMessage(`${this.username} went back ${-number} tiles.`);
};

Player.prototype.ownsTile = (function() {
	return function ownsTile(tile = this.position) {
		return isEqual(tile.owner, this);
	}.bind(Player.prototype);
})();

Player.prototype.pay = function(amount) {
	this.cash -= amount;
	this.session.stackMessage(`${this.username} paid $${amount}.`);
};

Player.prototype.releaseProperty = function(tile, getMoney) {
	tile.owner = undefined;
	if (getMoney) {
		this.earn(tile.cost / 2);
	}
};

module.exports = Player;
