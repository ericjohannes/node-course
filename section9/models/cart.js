const e = require('express');
const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
  );

module.exports = class Cart {
    static addProduct(id, productPrice){
        // feetch teh previous cart
        fs.readFile(p, (err, fileContent)=>{
            let cart = {products: [], totalPrice: 0};
            if(!err){
                cart = JSON.parse(fileContent);
            }
            // analyze the car => find existing product
            const exisistingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const exisistingProduct = cart.products[exisistingProductIndex]
            let updatedProduct;
            // add new product / increase quantity
            if(exisistingProduct){
                updatedProduct= {...exisistingProduct};
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[exisistingProductIndex] = updatedProduct;

            } else {
                updatedProduct = { id: id, qty: 1};
                cart.products = [...cart.products, updatedProduct]
            }
            cart.totalPrice = Number(cart.totalPrice) + Number(productPrice);
            fs.writeFile(p, JSON.stringify(cart), err=>{
                console.log(err);
            });
        });

    }    
}