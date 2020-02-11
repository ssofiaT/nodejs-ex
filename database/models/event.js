const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  _id:  mongoose.Schema.Types.ObjectId,
  ownerId: String,
  date: Date,
  name: String,
  description: String,
  priority: Number
});

module.exports = mongoose.model('Event', eventSchema);
