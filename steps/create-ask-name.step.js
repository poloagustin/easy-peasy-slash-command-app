const builder = require('botbuilder');

module.exports = session => {
    builder.Prompts.text(session, 'Who do you wanna add?');
};
