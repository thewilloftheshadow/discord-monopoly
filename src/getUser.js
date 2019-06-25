module.exports = function getUser(message, argument) {
	if (message.mentions.everyone || message.mentions.here) {
		return false;
	}
	let [command, ...leftovers] = message.content.trim().split(" ");
	let stitched = leftovers.join(" ");
	let name = stitched.toLowerCase();
	if (message.mentions.members.size) {
		let {user} = message.mentions.members.first();
		if (user.bot) return false;
		return user;
	}
	if (!name.length) {
		return false;
	}
	let {members} = message.channel.guild;
	let foundUsers = members.filter(function(member) {
		if (member.user.bot) return false;
		if (member.nickname) return member.nickname.toLowerCase().includes(name);
		return member.user.username.toLowerCase().includes(name);
	});
	if (foundUsers.size) {
		return foundUsers.first().user;
	}
	return false;
};
