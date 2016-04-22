var expenseModel = require('../models/expense');

module.exports = {
  create: function(req, res) {
    var expense = {
      from: req.body.from,
      to: req.body.to,
      value: req.body.value
    };
    expenseModel.create(expense)
    .then(function(result){
      res.redirect('/admin');
    });
  },

  delete: function(req, res) {
    expenseModel.remove(req.params.id)
    .then(function(result){
      res.redirect('/admin');
    });
  },

  deleteAll: function(req, res) {
    expenseModel.removeAll()
    .then(function(result){
      res.redirect('/admin');
    });
  }
}