const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');
const creds = require('./util/secret')
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('63f2895ce3987ff712efdc03')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const connectionString = `mongodb+srv://rick:${creds.mongoDb.password}@cluster0.l3rlxng.mongodb.net/shop`;
mongoose.connect(connectionString)
.then(result =>{
  User.findOne().then(user=>{
    if(!user){ // only create a user if there's not one user in the database
      const user = new User({
        name: "rick",
        email: 'eric@test.com',
        cart: {
          items: [],
        }
      })
      user.save();
    }
  });
  app.listen(3000)
}).catch(console.log);