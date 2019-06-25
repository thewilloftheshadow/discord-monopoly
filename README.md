## Discord Monopoly

This is a simple add-on you can implement to your Discord bots so they can manage a Monopoly game.

### Feature coverage

With the official vanilla Monopoly ruleset in mind, this program covers around 80% of anything you should be capable to do whenever playing, including buying assets, drawing chance / community chest cards, and bankruptcy behavior handling. The unimplemented 20% includes lands upgrading (building houses, hotels, whatever), and trading assets between players in game, even though the latter is highly unlikely to be implemented someday. Some work is still required in general, and these will be probably included in a later update, so for now, if you enjoy a game where the highest paid rent would be $10 out of the starting $1500, not counting perks and $200 bonuses, go ahead and play.

### Setup

First of all, you need to install the package with npm:

`npm i discord-monopoly`

All you need is one additional package, discord.js v11.anything. Since you're creating a bot application, you might already have installed it. If not, type:

`npm install`

in the bot's directory. As per the library's official guideline, any warning regarding any additional dependencies can be safely ignored.

Now to initiate the application:

```js
const monopoly = require("discord-monopoly");
const Discord = require("discord.js");
const bot = new Discord.Client();
const MonopolyRunner =  new monopoly({
  // config settings go here 
});

bot.on("message", (message) => {
   // whatever you're doing
   MonopolyRunner(message);
});

bot.login(/* your bot token */);
```

Read about the config settings below.

### Config settings

As you can see, there must be some parameters you should pass to the constructor. Any parameter that has a default value can be omitted. The properties are case-sensitive. This is the full reference:

* `owners`: designates who's in control of the bot's "admin" commands. Most of the time it's you. Accepts user IDs as a single Number-like (a string convertible to number or a number) for a single user or an array of several IDs. Read more about the way Discord handles IDs and how to obtain them [here](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID). 
* `channel`: if no ID is provided, the bot will initiate a session each and every time you send its start command in any channel. If provided, it will only respond to the channel whose ID matches the one you've given it.
* `bidDuration`: when battling for a property, this parameter defines how many seconds does the auction stay active for. Defaults to 20 seconds.
* `turnDuration`: anyone whose turn is the current one has that amount of seconds to type the command to run his turn. Defaults to 15 seconds.
* `cooldownDuration`: a not-so-impactful property that determines the interval between each of the bot's messages during one's current turn. Defaults to 900ms (0.9s).
* `prefix`: a string defining what should each command concerning the bot start with (example, `r!dice`). Defaults to `r!`.

### Error handling

If any provided config argument isn't from the expected type, an error will be thrown and none will be handled.

### Lifecycle control

The bot comes with some predetermined commands to control its behavior. All commands are owner-only unless otherwise specified:

* `r!start`: will bind a new session to the message's channel, if there wasn't already.

* `r!add <player>`: adds a targeted user to the current player list. Note that you need at least two players to start a proper session. Cannot be run once the game starts.
* `r!remove <player>`: removes a targeted user from the current player list. You can also remove players while the game is ongoing.
* `r!clear`: completely wipes the player list. Cannot be run once the game starts.
* `r!play`: Close registrations and begin playing.

* `r!end`: End current session. Enables a new session to be launched from the same channel.
* `r!dice`: Any player whose turn is active should send this command for his turn to be handled.

### User detection algorithm

In order to properly add or remove a player, here's the way the bot knows who's the concerned user:

* The argument for the commands can be a string or a mention (like @someuser) and is case-insensitive.
* The argument must be part of the desired user's username or nickname.
* The desired user must not be a bot.
* The message must not have a @everyone or @here mention.
* The bot will search the guild user list for the provided argument and will return the first occurence if other conditions are valid.

Here's a practical example.

Consider that I'm adding the user "N_tonio36" whose nickname is "Líf". The following works:

* `r!add tonio` (if there isn't any other user carrying "tonio" as part of his names)
* `r!add TONIO36`
* `r!add N_tonio36`
* `r!add líf`
* `r!add <mention of N_tonio36>`

The following, however, doesn't:

* `r!add someguycalledN_tonio36`
* `r!add @everyone` or `r!add @here`
* `r!add Riifu`
* `r!add LIF` (notice the difference between i and í, but if it's too much of a trouble typing any special character, you can just mention the user).

### Possible enhancements

* With some will, regulate the different inconsistencies in code style.
* Reduce code coupling.
* Implement property upgrade.
* Allow user-provided messages and commands.
* * This can be taken even further to permit multi-language support.

### Credits

So I was about to thank the person whom I took the Board.json from, but I completely forgot about them. If you're that person, please notify me so I can credit you properly.

### License

This software is licensed under the MIT License.