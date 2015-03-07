var pjson = require('./package.json'),
    config = require('./config/config'),
    bddUri = config.bddUri,
    auth = require('./helpers/auth'),
    initializer = require('./helpers/initializer'),
    expenseModel = require('./models/expense'),
    memberModel = require('./models/member'),
    adminCtrl = require('./controllers/admin'),
    loginCtrl = require('./controllers/login');

var express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    path = require('path'),
    mongoose = require('mongoose');

var app = express(),
    server = app.listen(config.port);

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

var manageMsg = function(text, bool, channel){
  if (text.indexOf('<@U03LYCL46>') == 0){
    text = text.replace('<@U03LYCL46>:', '').replace('<@U03LYCL46>', '').toLowerCase();

    if (text.indexOf(' paid ') != -1){
      memberModel.getMembers(function(team){
        if (team == null){
          sendResponse("Oink oink, it seems your team is empty... Add someone by asking me \"add bob\".", bool, channel);
        } else {
          // Get from
          var from = text.split(" paid ")[0].replace(' ', '');
          text = text.split(" paid ")[1];

          // Get to
          var toArray = [];
          var value = 0;
          var recipients = 0;

          if (text.indexOf(' to ') != -1) {
            value = parseFloat(text.split(" to ")[0].replace('$', '').replace('€', '').replace(' ', ''));
            toArray = text.split(" to ")[1].split(" ");
            recipients = toArray.length;
          } else {
            value = parseFloat(text.replace('$', '').replace('€', '').replace(' ', ''));
            team.forEach(function(elt) {
              if (from != elt.username)
                toArray[toArray.length] = elt.username;
            });
            recipients = toArray.length + 1;
          }

          if (recipients > 0 && !isNaN(value)) {
            var query = [];
            value = value / recipients;
            toArray.forEach(function(elt, i) {
              query[query.length] = {
                from: from,
                to: elt,
                value: value
              }
            });

            expenseModel.createExpenses(query, function(){
              sendResponse("Oink oink, got it!", bool, channel);
              writeDigest(bool, channel)
            });

          } else {
            sendResponse("Oink oink, well... I think you made a mistake when writing you message...", bool, channel);
          }
        }
      });
    } else if (text.indexOf(' add ') == 0){
      text = text.replace(' add ', '').replace(' ', '');

      memberModel.createMember(text, function(){
        sendResponse("Oink oink, got it! I added " + text + " to your team!", bool, channel);
      });

    } else if (text.indexOf(' remove ') == 0){
      text = text.replace(' remove ', '').replace(' ', '');

      memberModel.deleteMember(text, function(){
        sendResponse("Oink oink, got it! I removed " + text + " from your team!", bool, channel);
      });
    } else if (text.indexOf(' team') == 0){
      memberModel.getMembers(function(result){
        if (result==null){
          sendResponse("Oink oink, it seems your team is empty... Add someone by asking me \"add bob\".", bool, channel);
        } else {
          var team = "";
          for (var i=0; i<result.length; i++){
            team += result[i].username;
            if (i < result.length-2)
              team += ", ";
            else if (i == result.length-2)
              team += " & ";
          }
          sendResponse("Oink oink, here is you team pal: " + team, bool, channel);
          sendResponse("Remember you can add or remove someone by asking me \"add sandy\" or \"remove bob\".", bool, channel);
        }
      });
    } else if (text.indexOf(' report') == 0){
      sendResponse("Oink oink, here is your report:", bool, channel);
      writeDigest(bool, channel);
    } else {
      sendResponse("Oink oink, I did't get what you just said...", bool, channel);
    }
  }
};

var getTotal = function(name1, name2, bool, channel){
  expenseModel.getExpensesSum(name1, name2, function(total1){
    expenseModel.getExpensesSum(name2, name1, function(total2){
      var total = total1 - total2;
      if (total.toFixed(2) != "0.00"){
        if (total < 0)
          sendResponse(name1 + " owes " + name2 + " " + -total.toFixed(2) + "€", bool, channel);
        else if (total > 0)
          sendResponse(name2 + " owes " + name1 + " " + total.toFixed(2) + "€", bool, channel);
      }
    });
  });

};

var writeDigest = function(bool, channel){
  var tmpArray = [];
  memberModel.getMembers(function(team){
    for(var i=0; i<team.length; i++){
      for(var j=i+1; j<team.length; j++){
        tmpArray[tmpArray.length] = [team[i].username, team[j].username];
      }
    }
    for(var i=0; i<tmpArray.length; i++){
      var name1 = tmpArray[i][0];
      var name2 = tmpArray[i][1];
      getTotal(name1, name2, bool, channel);
    }
  });
};

// Slack app
var Slack = require('slack-client');

var token = 'xoxb-3712428142-LaJEln93jMRkP6rnLQC6bGzC', // Add a bot at https://my.slack.com/services/new/bot and copy the token here.
    botName = '<@U03LYCL46>',
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

var sendResponse = function(response, bool, channel){
  if (bool)
    channel.send(response);
  console.log(response);
}

slack.on('message', function(message) {

  var type = message.type,
      channel = slack.getChannelGroupOrDMByID(message.channel),
      user = slack.getUserByID(message.user),
      time = message.ts,
      text = message.text,
      response = '';

  console.log('Received: %s %s @%s %s "%s"', type, (channel.is_channel ? '#' : '') + channel.name, user.name, time, text);

  // Respond to messages with the reverse of the text received.

  if (type === 'message') {
    manageMsg(text, true, channel);
  }
});

slack.on('error', function(error) {
  console.error('Error: %s', error);
});

slack.login();

// Test
//app.get('/', function(req, res){
//  var text = "<@U03LYCL46>: Adrien paid 1";
//  var text = "<@U03LYCL46>: team";
//
//  //  manageMsg(text, false);
//  //  writeDigest(false);
//
//  res.send('ok');
//  res.end();
//});

app.get('/admin', auth.private, adminCtrl.get);
app.get('/login', loginCtrl.get);
app.post('/login', loginCtrl.post);


app.get('/delete', function(req, res){
  expenseModel.removeAllExpenses(function(result){
    res.redirect('/admin');
  });
});

app.get('/delete/:id', function(req, res){
  expenseModel.removeExpense(req.params.id, function(result){
    res.redirect('/admin');
  });
});

app.use(function(req, res, next){
  res.redirect('/login');
});

console.log('app running on port ' + config.port);
