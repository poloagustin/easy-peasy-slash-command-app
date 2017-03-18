/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/


 This is a sample Slack Button application that provides a custom
 Slash command.

 This bot demonstrates many of the core features of Botkit:

 *
 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately

 # RUN THE BOT:

 Create a Slack app. Make sure to configure at least one Slash command!

 -> https://api.slack.com/applications/new

 Run your bot from the command line:

 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js

 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.


 # EXTEND THE BOT:

 Botkit is has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

var config = {}
if (process.env.DATABASE_URL) {
    const firebaseStorage = require('botkit-storage-firebase')({
        firebase_uri: process.env.DATABASE_URL
    });

    config = {
        storage: firebaseStorage,
    };
} else {
    config = {
        json_file_store: './db_slackbutton_slash_command/',
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands'],
    }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


//
// BEGIN EDITING HERE!
//

controller.on('slash_command', function (slashCommand, message) {
    switch (message.command) {
        case "/panadero": //handle the `/echo` slash command. We might have others assigned to this app too!
            // The rules are simple: If there is no text following the command, treat it as though they had requested "help"
            // Otherwise just echo back to them what they sent us.

            // but first, let's make sure the token matches!
            if (message.token !== process.env.VERIFICATION_TOKEN) return; //just ignore it.

            if (message.text === 'help') {
                slashCommand.replyPrivate(
                    message,
                `<empty> - Quien tiene que comprar?\n
                add <name> - Agregar alguien a la lista\n
                remove <name> - Sacar alguien de la lista\n
                change <from> <to> - Cambiar el nombre de alguien`);
                return;
            } else if (message.text === '') {
                // slashCommand.replyPrivate(
                //     message,
                //     'Buscando deudores...',
                //     () => controller.storage.teams.get(
                //         'newcomers', 
                //         (x, newcomers) => slashCommand.replyPrivateDelayed(message, formatNewcomersText(newcomers))));
                controller.storage.teams.get(
                    'newcomers', 
                    (x, newcomers) => slashCommand.replyPrivate(message, formatNewcomersText(newcomers)));
                return;
            } else if (!message.text.indexOf('add')) {
                const name = message.text.replace('add ', '').trim();
                controller.storage.teams.get('newcomers', (x, newcomers) => {
                    newcomers.newcomers = newcomers.newcomers || [];
                    newcomers.newcomers.push(name);
                    controller.storage.teams.save(newcomers, () => 
                        slashCommand.replyPrivate(message, `Agregue a ${name}!`)
                    );
                });
            } else if (!message.text.indexOf('remove')) {
                const name = message.text.replace('remove ', '').trim();
                controller.storage.teams.get('newcomers', (x, newcomers) => {
                    newcomers.newcomers = newcomers.newcomers || [];
                    const indexOfName = newcomers.newcomers.indexOf(name);
                    if (indexOfName > -1) {
                        newcomers.newcomers.splice(indexOfName, 1);
                        controller.storage.teams.save(newcomers, () => slashCommand.replyPrivate(message, `Removi a ${name}!`));
                    } else {
                        slashCommand.replyPrivate(message, `${name} no existe`);
                    }
                });
            } else if (!message.text.indexOf('rename')) {
                const names = message.text.replace('rename ', '').trim();
                const namesArray = names.split(' ');
                const from = namesArray[0], to = namesArray[1];

                controller.storage.teams.get('newcomers', (x, newcomers) => {
                    newcomers.newcomers = newcomers.newcomers || [];
                    const indexOfName = newcomers.newcomers.indexOf(from);
                    if (indexOfName > -1) {
                        newcomers.newcomers[indexOfName] = to;
                        controller.storage.teams.save(newcomers, () => slashCommand.replyPrivate(message, `${from} ahora se llama ${to}!`));
                    } else {
                        slashCommand.replyPrivate(message, `${from} no existe`);
                    }
                });
            } else {
                slashCommand.replyPrivate(message, "Don't really know what to do with `" + message.text + "`");
                return;
            }
            break;
        default:
            slashCommand.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet.");
    }

function formatNewcomersText(value) {
    const newcomers = value.newcomers || [];
    return newcomers.length ? `ATENCION!\nLos que todavia no compraron comida son:\n- ${newcomers.join('\n- ')}` : 'Nadie debe facturas...';
}
});

