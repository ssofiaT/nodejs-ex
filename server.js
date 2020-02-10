//  OpenShift sample Node application
const
  express = require('express'),
  app = express(),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  webhookRoute = require('./api/routes/webhook');
  
Object.assign = require('object-assign')

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.engine('html', require('ejs').renderFile);
// morgan to use dev format
app.use(morgan());

// add body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.render('index.html', { pageCountMessage: null });
});

app.get('/pagecount', function (req, res) {
  res.send('{ pageCount: -1 }');
});

app.use('/webhook', webhookRoute);

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ error: err });
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
