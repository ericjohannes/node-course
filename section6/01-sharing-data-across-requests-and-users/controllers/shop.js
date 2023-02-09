const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll(products => {
        res.render('shop/product-list', { // first argument is view to return, second argument is data to send to the view
            prods: products,
            pageTitle: "Products!",
            path: "/products",
        });
    });
}

exports.getIndex = (req, res, next) => {
    const products = Product.fetchAll(products => {
        res.render('shop/index', {
            pageTitle: "Shop",
            path: "/",
            prods: products,
        });
    });

}
exports.getCart = (req, res, next) => {
    res.render('shop/cart', { // the view
        pageTitle: "Cart :)",
        path: '/shop/cart',
    });
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', { // the view
        pageTitle: "Your Orders",
        path: '/shop/orders',
    });
}

exports.getCheckout = (req, res, next) =>{
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}