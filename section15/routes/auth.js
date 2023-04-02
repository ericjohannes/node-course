const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.'),
    body(
        'password',
        'Passwords must be alphanumeric and at least 3 characters long.'
    )
        .isLength({ min: 3 })
        .isAlphanumeric(),
    authController.postLogin
);

router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            // if(value === 'test@test.com'){
            //     throw new Error('This email address is forbidden!')
            // } 
            // return true

            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) { // email exists
                    return Promise.reject(
                        'E-Mail exists already, please pick a different one'
                    );
                }
            })
        }),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 3 characters.' // second argument is the new default error message for all validators
    ).isLength({ min: 3 })
        .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match');
        }
        return true;
    }),
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewpassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;