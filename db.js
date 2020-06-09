require('dotenv').config();

const mysql = require('mysql');

// Database Connection
const connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD, // or the original password : 'apaswword'
    database : process.env.DATABASE_SCHEMA,
    // insecureAuth : true,
    port : process.env.DATABASE_PORT
});

connection.connect(function(err) {
    // in case of error
    if(err){
        console.log('[ERROR]: ' + err.code + ' - ' + err.fatal);
    }
});

module.exports = connection;