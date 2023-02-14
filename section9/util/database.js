const Sequelize = require('sequelize');
const secrets = require('./secret')

const sequelize = new Sequelize('node-complete', 'root', secrets.password,{
    dialect: 'mysql', 
    host: 'localhost'
});

module.exports = sequelize;