const Board = require("./board.json");
const {isEqual, findIndex} = require("lodash");
const AbstractCard = require("./abstractCard.js");

function payout(message, amount) {
	return function(player) {
		return {
			message,
			effect: player.earn.bind(player, amount)
		};
	};
};

function advanceToGo(player) {
	return {
		message: `${player.username} advances straight to Go Tile and receives $200.`,
		effect: player.advance.bind(player, Board.length - player._position)
	};
};

function doctorFee(player) {
	return {
		message: `${player.username} pays $50 for doctor fees.`,
		effect: player.pay.bind(player, 50)
	};
};

function goToJail() {
	return {
		effect: function(player) {
			player.jail({reason: "card"});
		}
	};
};

function getOutOfJail(player) {
	return {
		message: `${player.username} draws a Get out of Jail card.`,
		effect: function(whatever, session) {
			if (session.hasCommunityOutOfJail) {
				player.ownsFreedomCommunity = true;
				session.ownsFreedomCommunity = false;
			}
		}
	};
};

function saleOfStocks(player) {
	return {
		message: `${player.username} receives $50 from stock sales.`,
		effect: player.earn.bind(player, 50)
	};
};

function bankError(player) {
	return {
		message: `${player.username} receives $200 from a bank error.`,
		effect: player.earn.bind(player, 200)
	};
};

function inheritance(player) {
	return {
		message: `${player.username} receives $100 from inheritance.`,
		effect: player.earn.bind(player, 100)
	};
};

function beautyContest(player) {
	return {
		message: `${player.username} receives $10 from a 2nd position in a beauty contest.`,
		effect: player.earn.bind(player, 10)
	};
};

function hospital(player) {
	return {
		message: `${player.username} has to pay $50 for hospital fees.`,
		effect: player.pay.bind(player, 50)
	};
};

function school(player) {
	return {
		message: `${player.username} has to pay $50 for school fees.`,
		effect: player.pay.bind(player, 50)
	};
};

function consultancy(player) {
	return {
		message: `${player.username} received $25 for consultancy fees.`,
		effect: player.earn.bind(player, 25)
	};
};

function birthday(player) {
	return {
		message: `${player.username} receives $10 from every other player because it's their birthday.`,
		effect: function(whatever, session) {
			let total = 0;
			for (let [p] of session.players.entries()) {
				if (!isEqual(p, player)) {
					p.pay(10);
					total += 10;
				}
			}
			player.earn(total);
		}
	};
};

function lifeInsurance(player) {
	return {
		message: `${player.username} receives $100 from life insurance.`,
		effect: player.earn.bind(player, 100)
	};
};

function incomeTax(player) {
	return {
		message: `${player.username} receives $20 for an income tax refund.`,
		effect: player.earn.bind(player, 20)
	};	
};

function grandOpera(player) {
	return {
		message: `${player.username} hosts an opera show and receives $50 from each player for opening night seats.`,
		effect: function(player, session) {
			let total = 0;
			for (let [p] of session.players.entries()) {
				if (!isEqual(p, player)) {
					p.pay(50);
					total += 50;
				}
			}
			player.earn(total);
		}
	};
};

const reference = {
	grandOpera,
	lifeInsurance,
	incomeTax,
	getOutOfJail,
	birthday,
	consultancy,
	school,
	hospital,
	advanceToGo,
	doctorFee,
	bankError,
	inheritance
};

const CardHandler = new AbstractCard(reference);

function drawCard(session) {
	let chosenToggler = session.hasCommunityOutOfJail ? CardHandler.cardfulToggler : CardHandler.cardlessToggler;
	return chosenToggler.next().value;
};

module.exports = function(session) {
	const card = drawCard(session);
	return card;
};
