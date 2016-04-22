var memberModel = require('../models/member');

module.exports = {
  create: function(req, res) {
    var member = {
      username: req.body.username
    };
    memberModel.create(member)
    .then(function(result){
      res.redirect('/admin');
    });
  },

  delete: function(req, res) {
    memberModel.remove(req.params.id)
    .then(function(result){
      res.redirect('/admin');
    });
  },

  deleteAll: function(req, res) {
    memberModel.removeAll()
    .then(function(result){
      res.redirect('/admin');
    });
  }
}