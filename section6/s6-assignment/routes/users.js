const express = require('express');

const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
    console.log(adminData.users)
    const users = adminData.users;
    
    res.render('users', {
      users: users, 
      docTitle: "All users", 
      path: "/", 
    });

});
module.exports = router;
