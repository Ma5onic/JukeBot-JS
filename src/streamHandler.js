const yt         = require("ytdl-core");
const superagent = require("superagent")
const sbuffer    = require("buffered2").BufferedStream;

const formats   = ["249", "250", "251", "140", "141", "171"];

exports.play = async function play(guild, client) {
	if (!client.guilds.get(guild.id)                  ||
		!client.voiceConnections.get(guild.id)        ||
		client.voiceConnections.get(guild.id).playing ||
		client.voiceConnections.get(guild.id).paused
	) return;

	let song = guild.queue[0];

	if (song.src === "youtube") {

		let buffer = new sbuffer();
		yt(song.id, { filter: "audioonly" }).pipe(buffer);

		guild.msgc.createMessage({embed: {
			color: 0x1E90FF,
				title: "Now Playing",
				description: `[${song.title}](https://youtu.be/${song.id})`
		}});
		client.voiceConnections.get(guild.id).play(buffer);
		client.voiceConnections.get(guild.id).once("end", () => {
			queueCheck(guild, client, song);
		});

	} else if (song.src === "soundcloud") {

		guild.msgc.createMessage({embed: {
			color: 0x1E90FF,
			title: "Now Playing",
			description: song.title
		}});
		client.voiceConnections.get(guild.id).play(song.id);
		client.voiceConnections.get(guild.id).once("end", () => {
			queueCheck(guild, client, song);
		});

	}

}

function queueCheck(guild, client, song) {
	guild.queue.shift();
	if (guild.queue.length > 0) return exports.play(guild, client);
	guild.msgc.createMessage({embed: {
		color: 0x1E90FF,
		title: "Queue concluded!",
	}});
	if (client.voiceConnections.get(guild.id).channelID) client.leaveVoiceChannel(guild.id);
}