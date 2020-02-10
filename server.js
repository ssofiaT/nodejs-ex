//  OpenShift sample Node application
const
  express = require('express'),
  app = express(),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  webhookRoute = require('./api/routes/webhook');

Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
// morgan to use dev format
app.use(morgan());

// add body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function (err) { });
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ ip: req.ip, date: Date.now() });
    col.count(function (err, count) {
      if (err) {
        console.log('Error running count. Message:\n' + err);
      }
      res.render('index.html', { pageCountMessage: count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage: null });
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function (err) { });
  }
  if (db) {
    db.collection('counts').count(function (err, count) {
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.use('/webhook', webhookRoute);

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ error: err });
});

initDb(function (err) {
  console.log('Error connecting to Mongo. Message:\n' + err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
