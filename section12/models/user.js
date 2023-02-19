const mongoDb = require('mongodb');

const getDb = require('../util/database').getDb;

const ObjectId = mongoDb.ObjectId;

class User{
  constructor(username, email, cart, id){
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }
  save(){
    const db = getDb();
    return db.collection('users')
      .insertOne(this)

  }
  addToCart(product){
    const cartProductIndex = this.cart.items.findIndex(cp=>{
      return cp.productId.toString() ===  product._id.toString()
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    // if it's in the cart add to quantity
    if(cartProductIndex >= 0){
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {     // add it to cart
      updatedCartItems.push({
        productId: new ObjectId(product._id), 
        quantity: newQuantity
      });
    }

    const updatedCart = {items: updatedCartItems};
    const db = getDb();
    return db
      .collection('users')
      .updateOne({_id: new ObjectId(this._id)}, 
      {$set: {cart: updatedCart}} // only overwrite user.cart with updatedCart
    );
  }

  getCart(){
    const db = getDb();
    const productIds = this.cart.items.map(prod=>prod.productId);
    return db
      .collection('products')
      .find({_id: {$in: productIds}}) // get all products whose _id is in the array productIds
      .toArray()
      .then(products=>{
        return products.map(p=>{
          return {
            ...p, 
            quantity: this.cart.items.find(item=> { 
              return item.productId.toString() === p._id.toString()
            }).quantity
          };
        });
  });
  }
  deleteItemFromCart(productId){
    const updatedCartItems = this.cart.items.filter(item=>{ // filter out item i don't want
      return item.productId.toString() !== productId.toString();
    })
    const db = getDb();
    return db
      .collection('users')
      .updateOne({_id: new ObjectId(this._id)}, 
      {$set: {cart: {items: updatedCartItems}}} // only overwrite user.cart with updatedCart
    );

  }
  addOrder(){
    const db = getDb();
    return this.getCart().then(products=>{
      const order = {
        items: products,
        user: {
          _id: new ObjectId(this._id),
          name: this.name,
          email: this.email,
        }
      }
      return db
        .collection('orders')
        .insertOne(order)
    })
      .then(result =>{
        this.cart = {items: []};
        return db
          .collection('users')
          .updateOne(
            {_id: new ObjectId(this._id)}, 
            {$set: {cart: {items: []}}} // only overwrite user.cart with updatedCart
          )
      })
  }
  getOrders(){
    const db = getDb();
    return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
  }
  static findById(userId){
    const db = getDb();
    return db.collection('users')
      .findOne({_id: new ObjectId(userId)})
     
  }
}

module.exports = User;
