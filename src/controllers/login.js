var path = require('path'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    q = require('q');

module.exports = {
  get: function(req, res) {
    res.render('login.ejs');
  },

  post: function(req, res) {
    q.fcall(function () {
      if (req.body.username != process.env.ADMIN_USER || req.body.password != process.env.ADMIN_PASS)
        throw new Error("bad username or password");
      return q.nfcall(bcrypt.hash, process.env.ADMIN_PASS, 8);
    })
    .then(function(hash){
      res.writeHead(302, {
        'Set-Cookie': 'access_token=' + hash,
        'Content-Type': 'text/plain',
        'Location': '/admin'
      });
      res.end();
    })
    .then(undefined, function(err){
      console.log(err.message);
      res.redirect('/login?error=1');
    });
  }
};
