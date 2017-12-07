import path from "path";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import favicon from "serve-favicon";
import morgan from "morgan";
import mongoose from "mongoose";
import Slack from "slack-client";
import config from "./config";

import AdminCtrl from "./controllers/AdminCtrl";
import AuthCtrl from "./controllers/AuthCtrl";
import BillSharingCtrl from "./controllers/BillSharingCtrl";
import ExpenseCtrl from "./controllers/ExpenseCtrl";
import InitializerCtrl from "./controllers/InitializerCtrl";
import LoginCtrl from "./controllers/LoginCtrl";
import MemberCtrl from "./controllers/MemberCtrl";

const debug = require("debug")("bot");

// Initialize express server
const server = express();
mongoose.connect('mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + config.bddUri, { server: { ssl: true }}, (err, res) => {
  if (err) {debug ('Mongo error:' + config.bddUri + '. ' + err);}
  else {debug ('Mongo success: ' + config.bddUri);}
});

// Usual express stuff
server.use(morgan(server.get("env") === "production" ? "combined" : "dev"));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(compression());
server.use(favicon(path.resolve(__dirname, "./public/favicon.png")));
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs');
server.engine('html', require('ejs').renderFile);
server.use(express.static(path.join(__dirname, 'public')));
InitializerCtrl.start(server);

// Admin
server.get('/admin', AuthCtrl.private, AdminCtrl.get);
server.get('/login', LoginCtrl.get);
server.post('/login', LoginCtrl.post);

server.get('/member/delete-all', AuthCtrl.private, MemberCtrl.deleteAll);
server.get('/member/delete/:id', AuthCtrl.private, MemberCtrl.delete);
server.post('/member/create', AuthCtrl.private, MemberCtrl.create);

server.get('/expense/delete-all', AuthCtrl.private, ExpenseCtrl.deleteAll);
server.get('/expense/delete/:id', AuthCtrl.private, ExpenseCtrl.delete);
server.post('/expense/create', AuthCtrl.private, ExpenseCtrl.create);

// Slack app
let token = process.env.SLACK_TOKEN,
    botId = process.env.SLACK_BOT,
    currency = process.env.SLACK_CURRENCY || '€',
    autoReconnect = true,
    autoMark = true;

let slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', () => {
  let channels = [],
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

slack.on('message', (message) => {
  let type = message.type,
      channel = slack.getChannelGroupOrDMByID(message.channel),
      user = slack.getUserByID(message.user),
      time = message.ts,
      text = message.text,
      response = '';

  console.log('Received: %s %s @%s %s "%s"', type, (channel.is_channel ? '#' : '') + channel.name, user.name, time, text);

  if (type === 'message') {
    BillSharingCtrl.manageMsg(text, botId, channel, currency);
  }
});

slack.on('error', (error) => {
  console.error('Error: %s', error);
});

slack.login();

server.use((req, res, next) => { res.redirect('/login');} );

server.set('port', (process.env.PORT || 3000));
server.listen(server.get('port'), () => {
  console.log('Node app is running on port', server.get('port'));
});
