var mongoose = require('mongoose');

// DATABASE_SERVICE_NAME
// MONGODB_PORT
// MONGODB_USER
// MONGODB_PASSWORD
// MONGODB_DATABASE

const mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
    mongoPort = process.env[mongoServiceName + '_PORT'],
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'],
    mongoUser = process.env[mongoServiceName + '_USER'];

mongoURL = 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoPort + '/' + mongoDatabase;

mongoose.connect(mongoURL, { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

var eventSchema = new mongoose.Schema({
    ownerId: String,
    date: Date,
    name: String,
    description: String,
    priority: Number
});

var Event = mongoose.model('Event', eventSchema);

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