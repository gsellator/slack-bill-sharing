import path from "path";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
//import cookieParser from "cookie-parser";
//import favicon from "serve-favicon";
//import morgan from "morgan";
import mongoose from "mongoose";
import Slack from "slack-client";
import fs from "fs";
import q from "q";
import config from "./config";

import auth from "./helpers/auth";
import billSharing from "./helpers/billSharing";
import expense from "./helpers/expense";
import initializer from "./helpers/initializer";
import member from "./helpers/member";
import adminCtrl from "./controllers/admin";
import loginCtrl from "./controllers/login";

const debug = require("debug")("bot");

var app = express();

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

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
