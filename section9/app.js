const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next)=>{
    User.findById(1)
        .then(user=>{
            req.user = user;
            next();
        })
        .catch(err=>console.log(err));
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User,{constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product); // optional to repeat this
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});
// Product.belongsToMany(Order, {through: OrderItem});

sequelize
    // .sync({force: true}) // syncs my models to the database by creating the appropriate tables, force true overwrites tables
    .sync()
    .then(result=>{
        return User.findById(1);
        // console.log(result);
    }).then(user=>{
        if(!user){
            return User.create({name: "rick", email: "test@test.com"})
        }
        return Promise.resolve(user); // must return a promise, returning something in a then block defaults ot returning a promise but this is explicit
    })
    .then(user=>{
        // console.log(user)
        return user.createCart();
    // }).then(user=>{
    //     return user.createOrder();
    })
    .then(cart=>{
        app.listen(3000);

    })
    .catch(err=>{
        console.log(err)
    }); 
