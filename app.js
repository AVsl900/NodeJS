/*  !!!!!!!!!!!!!!!!!!!!!!
Для запуска и обновления установить, если не установлен
npm install -g nodemon
и потом запускать с ком. строки
nodemon app.js
*/

const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
app.get('/', function (req, res) {
    res.render('index', {activePage: "home"})   
   })
    
   app.listen(3000)
