const {App} = require('@slack/bolt');
const config = require("./config.json");
const pkg = require("./package.json");
const mysql = require("mysql");
const {promisify} = require("util");

const {google} = require('googleapis');

const app = new App({
    token: config.slack.token,
    signingSecret: config.slack.signingSecret
});

const db = mysql.createConnection(config.server);
db.connect();

db.q = promisify(db.query);


const SCOPES = ["https://www.googleapis.com/auth/drive"];
const {client_secret, client_id, redirect_uris} = config.googleDocs.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);


(async () => {
    await app.start(config.port || 3000);

    app.command("/notebookit", async ({command, ack, say, respond}) => {
        ack(); // acknowledge that the message was received

        const saveNumber = ++command.text || 1;
        const channel = command.channel_id;
        const channelName = command.channel_name;

        if (saveNumber > 1000) {
            return say("**Uh oh!** I only support saving a maximum of 1000 entries")
        } else if (saveNumber < 1) {
            return say("**Uh oh!** I can only save 1 or more messages.")
        }

        let result;

        try {
            result = await app.client.channels.history({
                token: config.slack.oauthUserId,
                channel: channel,
                count: saveNumber
            })
        } catch (e) {
            console.error(e);
            return say(`An error (${e}) occurred while fetching the messages.`)
        }
        console.log(result.messages);

        db.query("SELECT googleToken FROM USERS WHERE user = ?", [command.user_id], (err, results) => {
            if (!results) {
                respond({
                    text: "You need to connect your account by typing `\notebookit-link` prior to using `\notebookit`.",
                    mrkdwn: true,
                    ephemeral: true
                })
            } else {
                let gdocsToken = results[0];

                let docs = google.docs({
                    version: 'v1',
                    auth: gdocsToken
                });

                docs.documents.batchUpdate({
                    requestBody: {
                        requests: [
                            {
                                ins
                            }
                        ]
                    }
                })
            }
        });

        say(`I've documented the last ${saveNumber} message${saveNumber !== 1 ? `s` : ``} that were sent in ${channelName} in the engineering notebook.`)
    });

    app.command("/notebookit-link", async ({command, ack, respond}) => {
        ack();

        if (!command.text) {
            try {
                const authURL = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: SCOPES,
                });

                respond({
                    text: `Hi! To link your account visit <${authURL}|this link>, then type \`/notebookit-link <code>\`, replacing <code> with the code that it generates.`,
                    mrkdwn: true,
                    ephemeral: true
                })
            } catch (e) {
                respond({text: "An unexpected error occurred.", ephemeral: true});
                console.error(e)
            }
        } else {
            oAuth2Client.getToken(command.text, (err, token) => {
                db.query("SELECT id FROM users WHERE user = ?", [command.user_id], (err, results) => {
                    if (results && results[0]) {
                        db.query("UPDATE users SET googleToken = ? WHERE id = ?", [JSON.stringify(token), results[0]], (err) => {
                            if (err) {
                                console.error(err);
                                return respond({
                                    text: "An unexpected error occurred.",
                                    ephemeral: true
                                })
                            }

                            return respond({
                                text: "Your account was updated! Congrats.",
                                ephemeral: true
                            })
                        })
                    } else {
                        db.query("INSERT INTO users (user, googleToken) VALUES (?, ?)", [command.user_id, JSON.stringify(token)], (err) => {
                            if (err) {
                                console.error(err);
                                return respond({text: "An unexpected error occurred.", ephemeral: true});
                            }

                            respond({
                                text: `Your google account is linked! Congrats.`,
                                ephemeral: true
                            })
                        })
                    }
                })
            });
        }
    });


    console.log(`📓 ${pkg.name} v${pkg.version} started on port ${config.port || 3000}.`)
})();