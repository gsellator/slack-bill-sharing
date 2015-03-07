var path = require('path'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    q = require('q');

var parseCookies = function(request) {
  var list = {},
      rc = request.headers.cookie;
  rc && rc.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = unescape(parts.join('='));
  });
  return list;
};


module.exports = {
  //  ftppass = path.resolve('.', '.ftppass')
  //
  //    q.nfcall(fs.readFile, ftppass, 'utf8')
  //    .then(function(result){
  //      console.log(result);
  //
  //      var data = JSON.parse(result);
  //      if (req.body.username != data.admin.username || req.body.password != data.admin.password)
  //        throw new Error("bad username or password");
  //      return q.nfcall(bcrypt.hash, data.admin.password, 8);
  //    })
  //    .then(function(hash){
  //      res.writeHead(302, {
  //        'Set-Cookie': 'access_token=' + hash,
  //        'Content-Type': 'text/plain',
  //        'Location': '/admin'
  //      });
  //      res.end();
  //    })
  //    .then(undefined, function(err){
  //      console.log(err.message);
  //      res.redirect('/login?error=1');
  //    });



  private: function(req, res, next) {
    var ftppass = path.resolve('.', '.ftppass'),
        cookies = parseCookies(req);

    if (cookies != undefined && cookies.access_token != undefined) {
      fs.readFile(ftppass, 'utf8', function(err, result){
        var data = JSON.parse(result);

        bcrypt.compare(data.admin.password, cookies.access_token, function(err2, res) {
          if (res){ next(); }
          else {
            res.writeHead(302, {
              'Set-Cookie': 'access_token=""',
              'Content-Type': 'text/plain',
              'Location': '/login'
            });
            res.end();
          }
        });

      });
    } else {
      res.redirect('/login');
    }
  }
};