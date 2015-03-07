var path = require('path'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    q = require('q');

module.exports = {
  get: function(req, res) {
    if (req.param('error')==1) {
      res.render('login.ejs');
    } else {
      res.render('login.ejs');
    }
  },

  post: function(req, res) {
    var ftppass = path.resolve('.', '.ftppass')

    q.nfcall(fs.readFile, ftppass, 'utf8')
    .then(function(result){
      var data = JSON.parse(result);
      if (req.body.username != data.admin.username || req.body.password != data.admin.password)
        throw new Error("bad username or password");
      return q.nfcall(bcrypt.hash, data.admin.password, 8);
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
