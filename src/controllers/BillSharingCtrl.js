import q from "q";
import MemberModel from "../models/MemberModel";
import ExpenseModel from "../models/ExpenseModel";

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

let sendResponse = (response, channel) => {
  return q.fcall(() => {
    channel.send(response);
    console.log(response);
    return;
  });
}

let getTotal = (name1, name2, channel, currency) => {
  Promise.all([
    ExpenseModel.getSum(name1, name2),
    ExpenseModel.getSum(name2, name1)
  ])
  .then((results) => {
    let total = results[0] - results[1];
    if (total.toFixed(2) != "0.00"){
      if (total < 0)
           return sendResponse(name1 + " owes " + name2 + " " + -total.toFixed(2) + currency, channel);
      else if (total > 0)
          return sendResponse(name2 + " owes " + name1 + " " + total.toFixed(2) + currency, channel);
    }
  });
};

function getDebt(name1, name2){
  let test;
  
  return Promise.all([
    ExpenseModel.getSum(name1, name2),
    ExpenseModel.getSum(name2, name1)
  ])
  .then((results) => {
    let total = results[0] - results[1];
    return total;
  });
};

let addExpense = (cmd, channel, currency) => {
  let from,
      toArray = [],
      value = 0,
      recipients = 0,
      query = [];

  return MemberModel.getAll()
  .then((team) =>   {
    if (team == null)
      throw new Error("Oink oink, it seems your team is empty... Add someone by asking me \"add bob\".");

    // Get from
    from = cmd.split(" paid ")[0].replace(' ', '');
    cmd = cmd.split(" paid ")[1];

    // Get to
    if (cmd.indexOf(' to ') != -1) {
      value = parseFloat(cmd.split(" to ")[0].replace('$', '').replace('€', '').replace(' ', ''));
      toArray = cmd.split(" to ")[1].split(" ");
      recipients = toArray.length;
    } else {
      value = parseFloat(cmd.replace('$', '').replace('€', '').replace(' ', ''));
      team.forEach((elt) => {
        if (from != elt.username)
          toArray[toArray.length] = elt.username;
      });
      recipients = toArray.length + 1;
    }

    if (recipients === 0 || isNaN(value))
      throw new Error("Oink oink, well... I think you made a mistake in your message...");

    value = value / recipients;
    toArray.forEach((elt, i) => {
      query[query.length] = {
        from: from,
        to: elt,
        value: value
      }
    });

    return MemberModel.get(from)
  })
  .then((result) => {
    if (result == null)
      throw new Error("Oink oink, " + from + " is not a member of your team. Add him with the command \"add " + from + "\".");

    let arrayOfPromises = [];
    for(let i=0; i<toArray.length; i++){
      arrayOfPromises[arrayOfPromises.length] = MemberModel.get(toArray[i])
    }
    return Promise.all(arrayOfPromises)
  })
  .then((results) => {
    results.forEach((elt, i) => {
      if (elt === null)
        throw new Error("Oink oink, " + toArray[i] + " is not a member of your team. Add him with the command \"add " + toArray[i] + "\".");
      if (elt.username === from)
        throw new Error("Oink oink, beware! A user cannot owe money to himself!");
    });
    return ExpenseModel.createFromArray(query);
  })
  .then(() => {
    return showNewDigest(channel, currency)
  })
};

let addMember = (cmd, channel) => {
  cmd = cmd.replace(' add ', '').replace(' ', '');
  return MemberModel.get(cmd)
  .then((result) => {
    if (result != null)
      throw new Error("Oink oink, " + cmd + " is already a member of your team.");
    return MemberModel.create({username: cmd});
  })
  .then(() => {
    return sendResponse("Oink oink, got it! I added " + cmd + " to your team!", channel);
  });
};

let removeMember = (cmd, channel) => {
  cmd = cmd.replace(' remove ', '').replace(' ', '');


  return MemberModel.get(cmd)
  .then((result) => {
    if (result === null)
      throw new Error("Oink oink, I couldn't find any " + cmd + " in your team.");
    return MemberModel.removeByUsername(cmd)
  })
  .then(() => {
    sendResponse("Oink oink, got it! I removed " + cmd + " from your team!", channel);
  });
};

let showTeam = (channel) => {
  return MemberModel.getAll()
  .then((result) => {
    if (result === null)
      throw new Error("Oink oink, it seems your team is empty... Add someone by asking \"add bob\".");

    let team = "";
    for (let i=0; i<result.length; i++){
      team += result[i].username;
      if (i < result.length-2)
        team += ", ";
      else if (i == result.length-2)
        team += " & ";
    }
    return sendResponse("Oink oink, here are your team members: " + team, channel);
  })
  .then(function (){
    return sendResponse("Remember you can add or remove someone by asking \"add sandy\" or \"remove bob\".", channel);
  });
};

let showDigest = (channel, currency) => {
  let tmpArray = [];

  return sendResponse("Oink oink, here is your report:", channel)
  .then(() => {
    return MemberModel.getAll()
  })
  .then((team) => {
    let done = q.defer();

    for(let i=0; i<team.length; i++){
      for(let j=i+1; j<team.length; j++){
        tmpArray[tmpArray.length] = [team[i].username, team[j].username];
      }
    }
    for(let i=0; i<tmpArray.length; i++){
      let name1 = tmpArray[i][0];
      let name2 = tmpArray[i][1];
      getTotal(name1, name2, channel, currency);
      if (i == tmpArray.length-1) {done.resolve()}
    }
    return done.promise;
  })
};

let showNewDigest = (channel, currency) => {
  //Tableau des dettes (X to Y : +/-Z€)
  let tmpArray = [];
  
  //Tableau des dettes agrégées
  let debtArray = [];
  
  return sendResponse("Oink oink, to even things out:", channel)
  .then(() => {
    return MemberModel.getAll()
  })
  .then((team) => {

    //Tableau des dettes X à Y
    let arrayOfPromises = [];
      
    //On récupère les noms et on prépare le tableau de dettes (X to Y : +/-Z€)
    for(let i=0; i<team.length; i++){
      for(let j=i+1; j<team.length; j++){
        tmpArray[tmpArray.length] = [team[i].username, team[j].username];
        arrayOfPromises[arrayOfPromises.length] = getDebt(team[i].username, team[j].username);
      }
    }
    return Promise.all(arrayOfPromises);
  })
  .then((data) =>{
    
    //On remplit la dernière colonne du tableau de dettes (+/-Z€)
    for(let i=0; i<tmpArray.length; i++)
      tmpArray[i][2] = data[i];
    
    //On prépare le tableau des soldes (en fait on récupère chaque noms uniques)
    for(let i=0; i<tmpArray.length;i++){
      if(!isInArray(tmpArray[i][0], debtArray))
        {
           debtArray[debtArray.length] = tmpArray[i][0];
        }
      if(!isInArray(tmpArray[i][1], debtArray))
        {
           debtArray[debtArray.length] = tmpArray[i][1];
        }
    }
    
    //On crée les autres colonnes
    //nom | dû | avancé | solde
    for(let i=0; i<debtArray.length;i++){
           debtArray[i] = [debtArray[i], 0, 0 ,0];
            
    }
    
    //On remplit le tableau des soldes
    for(let i=0; i<tmpArray.length; i++){
      let j=0;
      let k=0;

          //On cherche X (de X doit à Y)
          while(debtArray[j][0] != tmpArray[i][0]){
            j++;
          }
        
          //On cherche Y (de X doit à Y)
          while(debtArray[k][0] != tmpArray[i][1]){
            k++;
          }
      
      //X a avancé Y
      if(tmpArray[i][2] >= 0)
        {    
          debtArray[j][2] += tmpArray[i][2];
          debtArray[k][1] += tmpArray[i][2]; 
        }
      
      //Y a avancé à X
      else if(tmpArray[i][2] < 0)
        {    
          debtArray[j][1] += -tmpArray[i][2];
          debtArray[k][2] += -tmpArray[i][2]; 
        }
      
      //Mise à jour des dettes (avancé - dût)
      debtArray[j][3] = debtArray[j][2] - debtArray[j][1];
      debtArray[k][3] = debtArray[k][2] - debtArray[k][1];
    }

    
    //On trie une première fois par ordre décroissant sur le solde
    debtArray.sort(function(a, b) {
      return parseFloat(b[3]) - parseFloat(a[3]);
    });
    
    //Tant que le solde le plus élevé n'est pas 0
    while(debtArray[0][3] != 0){
      
      //Le solde le plus bas donne au solde le plus haut à hauteur
      var max = Math.min(Math.abs(debtArray[0][3]), Math.abs(debtArray[debtArray.length - 1][3]));
      //console.log(debtArray[debtArray.length - 1][0] + " gives " + debtArray[0][0] + " " + Math.round(max * 100) / 100 + " €");
      sendResponse(debtArray[debtArray.length - 1][0] + " gives " + debtArray[0][0] + " " + Math.round(max * 100) / 100 + " €" ,channel);
      debtArray[debtArray.length - 1][3] += max;
      debtArray[0][3] -= max;
      
      //On retrie les soldes par ordre décroissant
      debtArray.sort(function(a, b) {
        return parseFloat(b[3]) - parseFloat(a[3]);
      });
      
    }
  })
};

const BillSharingCtrl = {
  manageMsg :(text, botId, channel, currency) => {
    if (text.indexOf(botId) == 0){
      q.fcall(function () {
        return text.replace(botId + ':', '').replace(botId, '').toLowerCase();
      })
      .then((cmd) => {
        if (cmd.indexOf(' paid ') != -1)
          return addExpense(cmd, channel, currency);
        if (cmd.indexOf(' add ') == 0)
          return addMember(cmd, channel);
        if (cmd.indexOf(' remove ') == 0)
          return removeMember(cmd, channel);
        if (cmd.indexOf(' team') == 0)
          return showTeam(channel);
        if (cmd.indexOf(' report') == 0)
          return showNewDigest(channel, currency);
        throw new Error("Oink oink, I didn't get what you just said...");
      })
      .then(undefined, (err) => {
        sendResponse(err.message, channel);
      });
    }
  }
};

export default BillSharingCtrl;