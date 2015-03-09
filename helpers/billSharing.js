var path = require('path'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    q = require('q'),
    memberModel = require('../models/member'),
    expenseModel = require('../models/expense');

var sendResponse = function(response, channel){
  return q.fcall(function(){
    channel.send(response);
    console.log(response);
    return;
  });
}

var getTotal = function(name1, name2, channel, currency){
  q.all([
    expenseModel.getSum(name1, name2),
    expenseModel.getSum(name2, name1)
  ])
  .then(function(results){
    var total = results[0] - results[1];
    if (total.toFixed(2) != "0.00"){
      if (total < 0)
        return sendResponse(name1 + " owes " + name2 + " " + -total.toFixed(2) + currency, channel);
      else if (total > 0)
        return sendResponse(name2 + " owes " + name1 + " " + total.toFixed(2) + currency, channel);
    }
  });
};

var addExpense = function(cmd, channel, currency){
  return memberModel.getAll()
  .then(function(team){
    if (team == null)
      throw new Error("Oink oink, it seems your team is empty... Add someone by asking me \"add bob\".");

    // Get from
    var from = cmd.split(" paid ")[0].replace(' ', '');
    cmd = cmd.split(" paid ")[1];

    // Get to
    var toArray = [];
    var value = 0;
    var recipients = 0;

    if (cmd.indexOf(' to ') != -1) {
      value = parseFloat(cmd.split(" to ")[0].replace('$', '').replace('€', '').replace(' ', ''));
      toArray = cmd.split(" to ")[1].split(" ");
      recipients = toArray.length;
    } else {
      value = parseFloat(cmd.replace('$', '').replace('€', '').replace(' ', ''));
      team.forEach(function(elt) {
        if (from != elt.username)
          toArray[toArray.length] = elt.username;
      });
      recipients = toArray.length + 1;
    }

    if (recipients === 0 || isNaN(value))
      throw new Error("Oink oink, well... I think you made a mistake in your message...");

    var query = [];
    value = value / recipients;
    toArray.forEach(function(elt, i) {
      query[query.length] = {
        from: from,
        to: elt,
        value: value
      }
    });

    return expenseModel.createFromArray(query);
  })
  .then(function(){
    return showDigest(channel, currency)
  })
};

var addMember = function(cmd, channel){
  cmd = cmd.replace(' add ', '').replace(' ', '');
  return memberModel.create({username: cmd})
  .then(function(){
    return sendResponse("Oink oink, got it! I added " + cmd + " to your team!", channel);
  });
};

var removeMember = function(cmd, channel){
  cmd = cmd.replace(' remove ', '').replace(' ', '');
  return memberModel.removeByUsername(cmd)
  .then(function(){
    sendResponse("Oink oink, got it! I removed " + cmd + " from your team!", channel);
  });
};

var showTeam = function(channel){
  return memberModel.getAll()
  .then(function(result){
    if (result === null)
      throw new Error("Oink oink, it seems your team is empty... Add someone by asking \"add bob\".");

    var team = "";
    for (var i=0; i<result.length; i++){
      team += result[i].username;
      if (i < result.length-2)
        team += ", ";
      else if (i == result.length-2)
        team += " & ";
    }
    return sendResponse("Oink oink, here is you team pal: " + team, channel);
  })
  .then(function (){
    return sendResponse("Remember you can add or remove someone by asking \"add sandy\" or \"remove bob\".", channel);
  });
};

var showDigest = function(channel, currency){
  var tmpArray = [];

  return sendResponse("Oink oink, here is your report:", channel)
  .then(function(){
    return memberModel.getAll()
  })
  .then(function(team){
    var done = q.defer();

    for(var i=0; i<team.length; i++){
      for(var j=i+1; j<team.length; j++){
        tmpArray[tmpArray.length] = [team[i].username, team[j].username];
      }
    }
    for(var i=0; i<tmpArray.length; i++){
      var name1 = tmpArray[i][0];
      var name2 = tmpArray[i][1];
      getTotal(name1, name2, channel, currency);
      if (i == tmpArray.length-1) {done.resolve()}
    }
    return done.promise;
  })
};

module.exports = {
  manageMsg :function(text, botId, channel, currency){
    if (text.indexOf(botId) == 0){
      q.fcall(function () {
        return text.replace(botId + ':', '').replace(botId, '').toLowerCase();
      })
      .then(function(cmd){
        if (cmd.indexOf(' paid ') != -1)
          return addExpense(cmd, channel, currency);
        if (cmd.indexOf(' add ') == 0)
          return addMember(cmd, channel);
        if (cmd.indexOf(' remove ') == 0)
          return removeMember(cmd, channel);
        if (cmd.indexOf(' team') == 0)
          return showTeam(channel);
        if (cmd.indexOf(' report') == 0)
          return showDigest(channel, currency);
        throw new Error("Oink oink, I did't get what you just said...");
      })
      .then(undefined, function(err){
        sendResponse(err.message, channel);
      });
    }
  }
};