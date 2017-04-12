const builder = require('botbuilder');

const intents = new builder.IntentDialog();

intents.matches(/add/, require('./waterfalls/create.waterfall'));

intents.onDefault(require('./waterfalls/default.waterfall'));

module.exports = intents;