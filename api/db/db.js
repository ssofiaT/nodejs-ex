const 
    mongoose = require('mongoose'),
    Event = require('./models/event');

function saveEvent(ownerId, date, name, description, priority, callbackfn) {
    let event = new Event({
        _id: mongoose.Types.ObjectId(),
        ownerId: ownerId,
        date: date,
        name: name,
        description: description,
        priority: priority
    });
    event.save((err, event) => {
        callbackfn (err, event);
    });
}

function listAllEvents(sender_id, callbackfn) {
    Event.find({ ownerId: new RegExp(sender_id, 'i') }, (err, events) => {
        callbackfn(err, events);
    });
}

module.exports = {saveEvent, listAllEvents}
