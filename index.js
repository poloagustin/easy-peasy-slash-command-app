const app = require('express')();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);

app.post('/', connector.listen());
app.get('/', () => 'Hello World!');

bot.dialog('/', require('./intents'));
bot.dialog('/create', require('./dialogs/create.dialog'));
// bot.dialog('/remove', require('./dialogs/remove.dialog'));
// bot.dialog('/update', require('./dialogs/update.dialog'));
// bot.dialog('/list', require('./dialogs/list.dialog'));

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
