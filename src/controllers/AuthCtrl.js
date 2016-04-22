//import bcrypt from "bcrypt-as-promised";

let parseCookies = (request) => {
  let list = {},
      rc = request.headers.cookie;
  rc && rc.split(';').forEach(( cookie ) => {
    let parts = cookie.split('=');
    list[parts.shift().trim()] = unescape(parts.join('='));
  });
  return list;
};

const AuthCtrl = {
  private: (req, res, next) => {
    let cookies = parseCookies(req);

    new Promise((resolve, reject) => {
      if (cookies == undefined && cookies.access_token == undefined)
        return reject(new Error("No cookie available"));
      return resolve(process.env.ADMIN_PASS === cookies.access_token);
//      return resolve(bcrypt.compare(process.env.ADMIN_PASS, cookies.access_token));
    })
    .then((result) => {
      if (!result)
        throw new Error("Wrong username or password");
      next();
    })
    .then(undefined, (err) => {
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

export default AuthCtrl;