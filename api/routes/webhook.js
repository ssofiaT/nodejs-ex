const
    express = require('express'),
    request = require('request'),
    util = require('util'),
    db = require('../db/db');

router = express.Router();

// Adds support for GET requests to our webhook
router.get('/', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    console.log('WEBHOOK: mode:' + mode + ', token:' + token + ', challenge:' + challenge /*+ ', verify_token:' + VERIFY_TOKEN*/);

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            console.log('WEBHOOK_FAILED');
            res.sendStatus(403);
        }
    } else {
        console.log('WEBHOOK: NOT FOUND');
        res.sendStatus(404);
    }
});

// Adds support for POST requests to our webhook
router.post('/', (req, res) => {

    let body = req.body;

    //console.log('BODY:' + util.inspect(body, { depth: null }));

    // Checks this is an event from a page subscription
    if (body.object === 'page') {
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_id = webhook_event.sender.id;
            let recipient_id = webhook_event.recipient.id;

            console.log('SenderID:' + sender_id + ', RecipentID:' + recipient_id);

            if ('message' in webhook_event &&
                'text' in webhook_event.message) {
                let text = webhook_event.message.text;

                if (text.search(/^@help$/gmi) >= 0) {
                    let sHelp = 'commands:\n@saveevent\ndYYYY-MM-DDTHH:MM:SS\nnName\n<cDescription>\n<pPriority>\n\n@listevents\n'
                    callSendAPItext(sender_id, sHelp);

                } else if (text.search(/^@saveevent$/gmi) >= 0) {
                    console.log('Saving event...');
                    let eventDate = null;
                    let eventName = '';
                    let eventComment = '';
                    let eventPriority = '';

                    try {
                        // date
                        let match = text.match(/^D(.+)$/);
                        if (!match) throw "Event date is missing <dYYYY-MM-DDTHH:MM:SS>"
                        eventDate = new Date(match[1]);

                        // name
                        match = text.match(/^N(.+)$/);
                        if (!match) throw "Event Name is missing <nName>"
                        eventName = match[1];

                        // comment
                        match = text.match(/^C(.+)$/);
                        if (match) {
                            eventComment = match[1];
                        }

                        // priority
                        match = text.match(/^P(\d+)$/);
                        if (match) {
                            eventPriority = match[1];
                        }

                        // save
                        db.saveEvent(sender_id, eventDate, eventName, eventComment, +eventPriority, (err, event) => {
                            if (err) {
                                console.log('db.saveEvent: ' + err);
                                callSendAPItext(sender_id, 'Error @saveevent: ' + err);
                            } else {
                                console.log('db.saveEvent: Done.');
                                callSendAPItext(sender_id, 'Saved the Event.');
                            }
                        });
                    }
                    catch (err) {
                        console.log('Error @saveevent: ' + err);
                        callSendAPItext(sender_id, 'Error @saveevent: ' + err);
                    }
                } else if (text.search(/@listevents/gmi) >= 0) {
                    console.log('Getting events event...');
                    db.listAllEvents(sender_id, (err, events) => {
                        if (err) {
                            console.error('Error @listevents: ' + err);
                            // send response
                            callSendAPItext(sender_id, 'Error @listevents: ' + err);

                        } else {
                            /*
                            { 
                                _id: 5e42324eb7fa7a00190cc18b,
                                ownerId: '3485581948181443',
                                date: 2020-02-11T14:30:00.000Z,
                                name: 'Meeting',
                                description: 'Very important WebDev meeting',
                                priority: 0,
                                __v: 0 
                            }
                            */
                            console.log('@listevents: ' + events);
                            let allEvents = ''
                            events.forEach((event) => {
                                allEvents += 'D' + event.date + '\n';
                                allEvents += 'N' + event.name + '\n';
                                if (event.description.length)
                                    allEvents += 'C' + event.description + '\n';
                                if (event.priority.length)
                                    allEvents += 'P' + event.priority + '\n';
                                allEvents += '\n'
                            });
                            callSendAPItext(sender_id, allEvents);
                        }
                    });
                } else {
                    // random answers
                    let answers = [
                        'and you?',
                        'dont know',
                        'well...',
                        'so what?',
                        'not now',
                        'please!',
                        'yes',
                        'no',
                        'you are welcome',
                        'I need to check..',
                        'what is ur name?',
                        'my name is bot',
                        'is this supposed to be funny?',
                        'I am working hard!',
                        'and you?',
                        'it is too late',
                        'I am cold',
                        'I will work hard, I promise!',
                        'I told you so...',
                        'Dont worry',
                        'Be happy',
                        'You look good today... ;)',
                        'Sorry, can you repeat that?',
                        'Think about it...',
                        'Nothing'];

                    let choice = Math.floor(Math.random() * answers.length);
                    // log data
                    console.log('sender_id:' + sender_id + ', recipient_id:' + recipient_id + ', text:' + text + ', choice:' + answers[choice]);
                    // send response
                    callSendAPItext(sender_id, answers[choice]);
                }
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        console.log('WEBHOOK: NOT FOUND');
        res.sendStatus(404);
    }
});

function callSendAPItext(sender_psid, text) {
    let response = {
        "text": text
    };
    // send response
    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

module.exports = router;
