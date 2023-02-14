const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products=>[
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      })
    ])
    .catch(err=>{console.log(err)});
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  
  Product.findById(prodId).then((product)=>{
    res.render('shop/product-detail', {
      pageTitle: product.title,
      path: '/products',
      product: product,
    });
  }).catch(err=>console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products=>[
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Welcome to the store!',
        path: '/'
      })
    ])
    .catch(err=>{console.log(err)});
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart=>{
      return cart.getProducts()
        .then(products=>{
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });
        })
        .catch(err=>console.log(err));
    }).catch(err=>console.log(err));
};

exports.postCart = (req, res, next) =>{
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  req.user.getCart(cart=>{

  })
    .then(cart=>{
      fetchedCart = cart;
      return cart.getProducts({where: {id: prodId}})
    })
    .then(products=>{
      let product;
      if(products.length > 0){
        product = products[0]
      }
      if(product){
        // add to quantity
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1; 
        return product;
      }
      // product not part of cart
      return Product.findById(prodId)
    })
    .then(product=>{
      return fetchedCart.addProduct(product, {through: {quantity: newQuantity }}) // add the product to the cart

    })
    .then(()=>{
      res.redirect('/cart')
    })
    .catch(console.log)
}

exports.postCartDeleteItem = (req, res, next) =>{
  const prodId = req.body.productId;
  req.user.getCart()
    .then(cart=>{
      return cart.getProducts({where:{id:prodId}})
    })
    .then(products=>{
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(results=>{
      res.redirect('/cart')
    })
    .catch(console.log)
}

exports.postOrder = (req, res, next)=>{
  let fetchedCart;
  req.user.getCart()
  .then(cart=>{
    fetchedCart = cart;
    return cart.getProducts()
  }).then(products=>{
    return req.user.createOrder()
      .then(order=>{
        order.addProducts(products.map(product=>{
          product.orderItem = {quantity: product.cartItem.quantity};
          return product
        }))
      }).catch(console.log)
  }).then(result=>{
    return fetchedCart.setProducts(null); // remove items from cart
  }).then(result=>{
    res.redirect('/orders');
  }).catch(console.log)
}

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include: ['products']})
    .then(orders=>{
      console.log(orders[0].products[0])
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(console.log)

};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
