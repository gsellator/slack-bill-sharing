var expenseModel = require('../models/expense');

module.exports = {
  get: function(req, res) {
    expenseModel.getAllExpenses(function(result){
      res.render('admin.ejs', {result: result});
    });
  }
}