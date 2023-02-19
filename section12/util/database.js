const mongodb = require('mongodb');
const secrets = require('./secret');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback)=>{
  MongoClient.connect(`mongodb+srv://${secrets.mongoDb.user}:${secrets.mongoDb.password}@cluster0.l3rlxng.mongodb.net/shop?retryWrites=true&w=majority`)
  .then((client)=>{
    console.log('connected');
    _db = client.db();
    callback()
  }).catch((err)=>{
    console.log(err);
    throw err;
  });
}

const getDb = () =>{
  if(_db){
    return _db;
  }
  throw 'No database found!'
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

