const process = require('process'),
    mongoose = require('mongoose');

// DATABASE_SERVICE_NAME
// MONGODB_PORT
// MONGODB_USER
// MONGODB_PASSWORD
// MONGODB_DATABASE


function saveEvent(ownerId, date, name, description, priority) {
    let event = new Event({
        ownerId: ownerId,
        date: date,
        name: name,
        description: description,
        priority: priority
    });

    event.save(function (err, event) {
        if (err) {
            return console.error(err);
        }
    });
}

function listAllEvents(sender_id, callbackfn) {
    Event.find(function (err, events) {
        callbackfn(err, events);
    });
}
