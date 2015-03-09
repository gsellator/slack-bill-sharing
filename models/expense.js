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
model.create = function (expense) {
  return  q.ninvoke(ExpenseModel, 'create', expense);
};

model.createFromArray = function (array) {
  return  q.ninvoke(ExpenseModel, 'create', array);
};

model.get = function (from, to) {
  return q.ninvoke(ExpenseModel, 'find', {from: from, to: to});
};

model.getSum = function (from, to) {
  return ExpenseModel.aggregate()
  .match({ from: from, to: to })
  .group({ _id:{ from: "$from", to: "$to" }, total: {$sum: "$value"} })
  .exec()
  .then(function (result) {
    if (result.length == 0)
      return 0;
    else
      return result[0].total;
  });
};

model.getAll = function () {
  return q.ninvoke(ExpenseModel, 'find', {});
};

model.remove = function (_id) {
  return q.ninvoke(ExpenseModel, 'remove', {_id: _id});
};

model.removeAll = function () {
  return q.ninvoke(ExpenseModel, 'remove', {});
};