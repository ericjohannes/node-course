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
            cart.totalPrice = +cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), err=>{
                console.log(err);
            });
        });

    }    
    static deleteProduct(id, price){
        fs.readFile(p, (err, fileContent)=>{
            if(err){
                return
            }
            const cart = JSON.parse(fileContent);
            const updatedCart = {...cart};
            const product = updatedCart.products.find(prod => prod.id === id);
            if(!product){
                return;
            }
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id );
            updatedCart.totalPrice = cart.totalPrice - price * productQty;
            fs.writeFile(p, JSON.stringify(updatedCart), err=>{
                console.log(err);
            });
        });
    }
    static getCart(cb){
        fs.readFile(p, (err, fileContent)=>{

            if(err){
                cb(null)
            } else{
                const cart = JSON.parse(fileContent);

                cb(cart);

            }
        });

    }
}