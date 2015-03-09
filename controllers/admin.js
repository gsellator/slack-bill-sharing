var q = require('q'),
    expenseModel = require('../models/expense'),
    memberModel = require('../models/member');

module.exports = {
  get: function(req, res) {
    q.all([
      memberModel.getAll(),
      expenseModel.getAll()
    ])
    .then(function(results){
      res.render('admin.ejs', {members: results[0], expenses: results[1]});
    });
  }
}