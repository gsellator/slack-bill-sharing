var mongoose = require('mongoose'),
    q = require('q'),
    Schema = mongoose.Schema,
    model = module.exports;


var ExpenseSchema = new Schema({
  from: { type: String },
  to: { type: String },
  value: {type: Number, min: 0}
});

mongoose.model('Expense', ExpenseSchema);
var ExpenseModel = mongoose.model('Expense');

//CRUD WelcomePack

//return q.ninvoke(UsersModel, 'findOne', {"_id": _id})
//    .then(function(result){
//    if (result === null)
//      throw new Error("_id does not exist");
//    return result;
//  });


model.createExpenses = function (array, callback) {
  ExpenseModel.create(array, function(err, result){
    callback(result);
  });
  //  var array = [{ type: 'jelly bean' }, { type: 'snickers' }];
  //  Candy.create(array, function (err, jellybean, snickers) {
  //    if (err) // ...
  //      });

  //  var newExpense = new ExpenseModel({
  //    from: from,
  //    to: to,
  //    value: value
  //  });
  //  newExpense.save(function (err, result) {
  //    callback(result);
  //  });
};

model.getExpenses = function (from, to, callback) {
  ExpenseModel.find({from: from, to: to}, function (err, result) {
    if (err) { throw err; }
    callback(result);
  });
};

model.getExpensesSum = function (from, to, callback) {
  ExpenseModel.aggregate()
  .match({ from: from, to: to })
  .group({ _id:{ from: "$from", to: "$to" }, total: {$sum: "$value"} })
  .exec(function (err, result) {
    if (err) { throw err; }
    if (result.length == 0)
      callback(0);
    else
      callback(result[0].total);
  });
};

model.getAllExpenses = function (callback) {
  ExpenseModel.find({}, function (err, result) {
    if (err) { throw err; }
    callback(result);
  });
};

model.removeExpense = function (_id, callback) {
  ExpenseModel.remove({_id: _id}, function (err, result) {
    if (err) { throw err; }
    callback(result);
  });
};

model.removeAllExpenses = function (callback) {
  ExpenseModel.remove({}, function (err, result) {
    if (err) { throw err; }
    callback(result);
  });
};