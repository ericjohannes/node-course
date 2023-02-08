const express = require('express');

const users = [];

const router = express.Router();

// /admin/add-user => GET
router.get('/add-user', (req, res, next) => {
    res.render('add-user', {
      docTitle: "Add a user", 
    });
});
  
  // /admin/add-user => POST
  router.post('/add-user', (req, res, next) => {
    users.push({ name: req.body.name });
    res.redirect('/');
  });

exports.routes = router;

exports.users = users;