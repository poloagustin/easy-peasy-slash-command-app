const builder = require('botbuilder');

const luisRecognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b965890c-d40b-4d16-bfdb-a926759f20d4?subscription-key=4a373a52f2aa42c788e0319f735b8d37&verbose=true&timezoneOffset=-3.0&q=');

const intentDialog = new builder.IntentDialog({
    recognizers: [luisRecognizer]
});

intentDialog.matches('create', require('./waterfalls/create.waterfall'));
intentDialog.matches('list', require('./waterfalls/list.waterfall'));

intentDialog.onDefault(require('./waterfalls/default.waterfall'));

module.exports = intentDialog;