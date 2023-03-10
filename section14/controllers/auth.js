const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').split("=")[1].trim()
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Log in',
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    User.findById('63f2895ce3987ff712efdc03')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((err)=>{ //be sure session is created in db before redirecting
                console.log(err);
                res.redirect('/');
            })
        })
        .catch(err => console.log(err));
};
exports.postLogout = (req, res, next) => {
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/');
    });
};