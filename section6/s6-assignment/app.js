const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const users = require('./routes/users');
const userData = require('./routes/admin');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', userData.routes);

app.use(users);


app.listen(3000);
