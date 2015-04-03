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
  private: function(req, res, next) {
    var ftppass = path.resolve('.', '.ftppass'),
        cookies = parseCookies(req);

    q.fcall(function () {
      if (cookies == undefined && cookies.access_token == undefined)
        throw new Error("No cookie available");
      return q.nfcall(fs.readFile, ftppass, 'utf8')
    })
    .then(function(result){
      var data = JSON.parse(result);
      return q.nfcall(bcrypt.compare, data.admin.password, cookies.access_token);
    })
    .then(function(result){
      if (!result)
        throw new Error("Wrong username or password");
      next();
    })
    .then(undefined, function(err){
      console.log(err.stack);
      res.writeHead(302, {
        'Set-Cookie': 'access_token=',
        'Content-Type': 'text/plain',
        'Location': '/login'
      });
      res.end();
    });
  }
};