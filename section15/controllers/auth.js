const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');
const { sendgridKey } = require('../util/secret')
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: { api_key: sendgridKey }
}));
exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: { 
      email: "", 
      password: "", 
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: { 
      email: "",
      password: "", 
    },
    validationErrors: [],

  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Log in',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email, 
        password: password, 
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Log in',
          errorMessage: 'Invalid email or password.',
          oldInput: { 
            email: email, 
            password: password, 
          },
          validationErrors: [],
        });
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => { // get here whether the password match or not
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              return res.redirect('/')
            });
          }

          res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Log in',
            errorMessage: 'Invalid email or password.',
            oldInput: { 
              email: email, 
              password: password, 
            },
            validationErrors: [],
          });
        })
        .catch(err => {
          console.log(err)
          res.redirect('/login')
        })


    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email, 
        password: password, 
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array(),

    });
  }

  bcrypt.hash(password, 12)
    .then(hassedPassword => {
      const user = new User({
        email: email,
        password: hassedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'ericjohannesblom@gmail.com',
        subject: 'Signup completed!',
        html: '<h1>You sucessfully signed up!</h1>'
      });
    }).catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset password',
    errorMessage: message,

  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('error', 'No account with that email found.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'ericjohannesblom@gmail.com',
          subject: 'Password reset',
          html: `
        <p>You requested a password reset</p>
        <p>Click <a href="http://localhost:3000/reset/${token}">this link</a> to se a new password.</p>
        `
        });
      })
      .catch(console.log)
  });
}

exports.getNewpassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      })
    })
    .catch(console.log);


}

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    // resetTokenExpiration: {$gt: Date.now()},
    _id: userId,
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(password, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      return res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/');

    })



}