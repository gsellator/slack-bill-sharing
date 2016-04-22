import mongoose from "mongoose";

let model = module.exports;

let ExpenseSchema = new mongoose.Schema({
  from: { type: String },
  to: { type: String },
  value: {type: Number, min: 0}
});

let Expense = mongoose.model('Expense', ExpenseSchema);

const ExpenseModel = {
  create: (expense) => {
    return Expense.create(expense);
  },

  createFromArray: (array) => {
    return  Expense.create(array);
  },

  get: (from, to) => {
    return Expense.find({from: from, to: to});
  },

  getSum: (from, to) => {
    return Expense.aggregate()
    .match({ from: from, to: to })
    .group({ _id:{ from: "$from", to: "$to" }, total: {$sum: "$value"} })
    .exec()
    .then(function (result) {
      if (result.length == 0)
        return 0;
      else
        return result[0].total;
    });
  },

  getAll: () => {
    return Expense.find({});
  },

  remove: (_id) => {
    return Expense.remove({_id: _id});
  },

  removeAll: () => {
    return Expense.remove({});
  },
}

export default ExpenseModel;