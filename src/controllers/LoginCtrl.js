import bcrypt from "bcrypt-as-promised";

const LoginCtrl = {
  get: (req, res) => {
    res.render('login.ejs');
  },

  post: (req, res) => {
    new Promise((resolve, reject) => {
      if (req.body.username != process.env.ADMIN_USER || req.body.password != process.env.ADMIN_PASS)
        return reject(new Error("bad username or password"));
      return resolve(bcrypt.hash(process.env.ADMIN_PASS, 8));
    })
    .then((hash) => {
      res.writeHead(302, {
        'Set-Cookie': 'access_token=' + hash,
        'Content-Type': 'text/plain',
        'Location': '/admin'
      });
      res.end();
    })
    .then(undefined, (err) => {
      console.log(err.message);
      res.redirect('/login?error=1');
    });
  }
};

export default LoginCtrl;