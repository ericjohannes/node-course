const mongoDb = require('mongodb');

const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id;
    this.userId = userId
  }
  save(){
    const db = getDb();
    let dbOp;
    if(this._id){
      // update the product
      this._id = new mongoDb.ObjectId(this._id);
      dbOp = db.collection('products')
        .updateOne(
          {_id: this._id}, // filter that returns one document
          {$set: this} // could make it {$set: {title: this.title...etc}}
          )
        .then(result=>{console.log(result)})
        .catch(err=>console.log(err));
    } else{
      dbOp = db.collection('products')
        .insertOne(this)
        .then(result=>{console.log(result)})
        .catch(err=>console.log(err));
    }
    return dbOp
  }
  static fetchAll(){
    const db = getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then(products=>{
        return products
      })
      .catch(console.log);
  }
  static findById(prodId){
    const db = getDb();
    return db.collection('products')
      .find({_id: new mongoDb.ObjectId(prodId)})
      .next() // gets next document returned by find
      .then(product=>{
        return product
      })
      .catch(console.log)
  }
  static deleteById(prodId){
    const db = getDb();
    return db.collection('products')
      .deleteOne({_id: new  mongoDb.ObjectId(prodId)})
      .then(()=>console.log('Deleted'))
      .catch(console.log);
  }
}

module.exports = Product;
