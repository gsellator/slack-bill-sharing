var config = require('./config/config'),
    auth = require('./helpers/auth'),
    billSharing = require('./helpers/billSharing'),
    expense = require('./helpers/expense'),
    initializer = require('./helpers/initializer'),
    member = require('./helpers/member'),
    adminCtrl = require('./controllers/admin'),
    loginCtrl = require('./controllers/login');

var express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    path = require('path'),
    mongoose = require('mongoose'),
    Slack = require('slack-client'),
    fs = require('fs'),
    q = require('q');

var app = express(),
    server = app.listen(config.port);

var bddUri = 'mongodb://' + process.env.DB_USER + ':' +  process.env.DB_PASS + '@' + config.bddUri;
mongoose.connect(bddUri, function (err, res) {
  if (err) {console.log ('Mongo error:' + bddUri + '. ' + err);}
  else {console.log ('Mongo success: ' + bddUri);}
});

// App Setup
var env = process.env.NODE_ENV || 'dev';
app.use(compression());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
initializer.start(app);

// Admin
app.get('/admin', auth.private, adminCtrl.get);
app.get('/login', loginCtrl.get);
app.post('/login', loginCtrl.post);

app.get('/member/delete-all', auth.private, member.deleteAll);
app.get('/member/delete/:id', auth.private, member.delete);
app.post('/member/create', auth.private, member.create);

app.get('/expense/delete-all', auth.private, expense.deleteAll);
app.get('/expense/delete/:id', auth.private, expense.delete);
app.post('/expense/create', auth.private, expense.create);

// Slack app
var token = process.env.SLACK_TOKEN,
    botId = process.env.SLACK_BOT,
    currency = process.env.SLACK_CURRENCY || '€',
    autoReconnect = true,
    autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
  var channels = [],
      groups = [],
      unreads = slack.getUnreadCount(),
      key;

  for (key in slack.channels) {
    if (slack.channels[key].is_member) {
      channels.push('#' + slack.channels[key].name);
    }
  }

  for (key in slack.groups) {
    if (slack.groups[key].is_open && !slack.groups[key].is_archived) {
      groups.push(slack.groups[key].name);
    }
  }

  console.log('Welcome to Slack. You are @%s of %s', slack.self.name, slack.team.name);
});

slack.on('message', function(message) {
  var type = message.type,
      channel = slack.getChannelGroupOrDMByID(message.channel),
      user = slack.getUserByID(message.user),
      time = message.ts,
      text = message.text,
      response = '';

  console.log('Received: %s %s @%s %s "%s"', type, (channel.is_channel ? '#' : '') + channel.name, user.name, time, text);

  if (type === 'message') {
    billSharing.manageMsg(text, botId, channel, currency);
  }
});

slack.on('error', function(error) {
  console.error('Error: %s', error);
});

slack.login();

app.use(function(req, res, next){ res.redirect('/login');} );
console.log('app running on port ' + config.port);
