const mysql = require('mysql2')
require('dotenv').config()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    typeCast: function (field, next) {
        if (field.type === 'DATE') {
            return field.string(); 
        }
        return next();
    }
})

db.connect((err) => {
    if(err) throw err
    console.log('MYSQL Connected')
})

module.exports = db