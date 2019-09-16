const { App } = require('@slack/bolt');
const config = require("./config.json");
const package = require("./package.json")

const app = new App({
    token: config.slack.token,
    signingSecret: config.slack.signingSecret
});

(async () => {
    await app.start(config.port || 3000)

    app.command("/notebookit", async ({ command, ack, say, context }) => {
        ack(); // acknowledge that the message was received

        const saveNumber = + + command.text || 1;
        const channel = command.channel_id;
        const channelName = command.channel_name

        if (saveNumber > 1000) {
            return say("**Uh oh!** I only support saving a maximum of 1000 entries")
        } else if (saveNumber < 1) {
            return say("**Uh oh!** I can only save 1 or more messages.")
        }

        let result;

        try {
            result = await app.client.channels.history({
                token: context.botToken,
                channel: channel,
                count: saveNumber
            })
        } catch (e) {
            console.error(e)
            return say(`An error (${e}) occurred while fetching the messages.`)
        }
        console.log(result)

        say(`I've documented the last ${saveNumber} message${saveNumber != 1 && `s`} that were sent in ${channelName} in the engineering notebook.`)
    })

    console.log(`📓 ${package.name} v${package.version} started on port ${config.part || 3000}.`)
})();