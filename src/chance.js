const Board = require("./board.json");
const {isEqual, findIndex} = require("lodash");
const AbstractCard = require("./abstractCard.js");

function getDistance(pos, dest) {
	return {
		destination: dest,
		distance: Math.abs(pos - dest)
	};
};

function advanceToGo(player) {
	return {
		message:`${player.username} advances straight to Go tile and receives $200.`,
		effect: function(player) {
			player.advance(Board.length - player._position);
		}
	};
};

function advanceToTile(tile, matchFunction) {
	return {
		message: `Advance directly to ${tile.name}. If you pass across Go, receive $200.`,
		effect: function(player, session) {
			let position = findIndex(Board, matchFunction.bind(null, tile));
			player.advance(Board.length - player._position + position);
			session.handleTileAction(player);
		}
	};
};

function advanceToIllinois(player) {
	return advanceToTile({name: "Illinois Avenue"}, player, tile => tile.name === "Illinois Avenue");
};

function advanceToStCharles(player) {
	return advanceToTile({name: "St. Charles Place"}, player, tile => tile.name === "St. Charles Place");
};

function advanceToBoardwalk(player) {
	return advanceToTile({name: "Boardwalk"}, player, tile => tile.name === "Boardwalk");
};

function advanceToNearestUtility() {
	let utilities = Board.filter(tile => tile.type === "utility");
	let distances = utilities.map(tile => getDistance(player._position, tile)).sort((tile1, tile2) => tile1.distance - tile2.distance);
	let [nearestUtility] = distances;	
	return {
		message: `Advance to nearest utility (${nearestUtility.tile.name}).
If it's already owned, a set of dice will be rolled and you will pay 10 times that amount to its owner.`,
		effect: function(player, session) {
			player.advance(nearestUtility.distance);
			if (!player.ownsTile() && nearestUtility.tile.owner) {
				let roll = session.throwDice();
				player.pay(roll.sum * 10);
				nearestUtility.tile.owner.earn(roll.sum * 10);
			} else if (!nearestUtility.tile.owner) {
				session.handleProperty(nearestUtility.tile);
			}
		}
	}
};

function getOutOfJail() {
	return {
		message: `${player.username} drew a Get out of Jail card.`,
		effect: function(player) {
			if (player.session.hasChanceOutOfJail) {
				player.ownsFreedomChance = true;
				session.hasChanceOutOfJail = false;
			} else return null;
		}
	};
};

function goBack3Spaces(player) {
	return {
		message: `${player.username} goes back 3 steps.`,
		effect: function(whatever, session) {
			player.goBack(-3);
			session.handleTileAction(player);
		}
	};
};

function jailPlayer(player) {
	return {
		effect: player.jail({reason: "card"})
	};
};

function receiveAmount(player, amount, message) {
	return {
		message,
		effect: player.earn.bind(player, amount)
	};
};

function receiveReturnOnInvestment(player) {
	return receiveAmount(player, 150, `Your building and loan matures. Receive $150.`);
};

function winCrosswords(player) {
	return receiveAmount(player, 100, `You won a crosswords competition. Receive $100.`);
};

function receiveDividents(player) {
	return receiveAmount(player, 50, "Bank pays you a divident of $50.");
};

function payAllPlayers() {
	return {
		message: "You have been elected Chairman of the Board. Pay each player $50.",
		effect: function(player, session) {
			for (let [userID, playerProfile] of session.players) {
				if (!isEqual(otherPlayer, player)) {
					player.pay(50);
					otherPlayer.earn(50);
				}
			}
		}
	};
};

const reference = {
	payAllPlayers,
	receiveDividents,
	winCrosswords,
	receiveReturnOnInvestment,
	jailPlayer,
	goBack3Spaces,
	advanceToNearestUtility,
	advanceToIllinois,
	advanceToBoardwalk,
	advanceToStCharles,
	advanceToGo,
	getOutOfJail
};

const CardHandler = new AbstractCard(reference);


function drawCard(session) {
	let chosenToggler = CardHandler.selectToggler(session.hasChanceOutOfJail);
	return chosenToggler.next().value;
}

module.exports = function(session) {
	const card = drawCard(session);
	return card;
};
