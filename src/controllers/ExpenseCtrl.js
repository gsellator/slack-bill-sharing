import ExpenseModel from "../models/ExpenseModel";

const ExpenseCtrl = {
  create: (req, res)  => {
    let expense = {
      from: req.body.from,
      to: req.body.to,
      value: req.body.value
    };
    ExpenseModel.create(expense)
    .then((result) => {
      res.redirect('/admin');
    });
  },

  delete: (req, res) => {
    ExpenseModel.remove(req.params.id)
    .then((result) => {
      res.redirect('/admin');
    });
  },

  deleteAll: (req, res) => {
    ExpenseModel.removeAll()
    .then((result) => {
      res.redirect('/admin');
    });
  }
};

export default ExpenseCtrl;