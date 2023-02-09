const path = require('path');
const express = require('express');

const adminController = require('../controllers/admin')
const router = express.Router();


// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// first argument is the path in the url to connec tthis to, secont is the function to handle what happens when you go there.
router.get('/products', adminController.getProducts); 

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);


module.exports = router;