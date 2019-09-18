# :notebook: NotebookIt

NotebookIt is a system that allows users to add slack messages to their Engineering notebook

## Instructions
1. Follow the installation instructions below.
2. In slack, type `/notebookit-link` to link your google drive account to slack.
3. Type `/notebookit` or `/notebookit <number of messages>` to add the past few slack messages to the notebook. If no number of messages is specified, NotebookIt saves 1.

## Installation
1. Download
2. `npm i`.
3. Create a new `config.json` file - it should follow the format below.
4. `npm start` 

## Configuration
```json
{
	"slack": {
		"signingSecret": "<secret>",
		"token": "<token>",
		"oauthUserId": "<the oauth id of a user who has granted app permissions>"
	},
	"googleDocs": {
		"installed": {
			"client_id": "<google clientid>",
			"project_id": "<google projectid>",
			"auth_uri": "https://accounts.google.com/o/oauth2/auth",
			"token_uri": "https://oauth2.googleapis.com/token",
			"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			"client_secret": "<client secret>",
			"redirect_uris": [
				"urn:ietf:wg:oauth:2.0:oob",
				"http://localhost"
			]
		}
	},
	"server": {
		"host": "<database host>",
		"user": "<databse username>",
		"password": "<database password>",
		"database": "<databse>"
	}
}
```
