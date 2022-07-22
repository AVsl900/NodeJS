/*  !!!!!!!!!!!!!!!!!!!!!!
Для запуска и обновления установить, если не установлен
npm install -g nodemon
и потом запускать с ком. строки
nodemon app.js
http://localhost:3000/
*/

const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

app.use(express.urlencoded())

app.get('/', function (req, res) {
    res.render('index', {activePage: "home"}) 
}) 
app.get('/contact', function (req, res) {
        res.render('contact', {activePage: "contact"})
})
       
app.post('/contact', function (req, res) {
    res.render('contact_answer', {activePage: "contact", formData: req.body})
})

    
   
   app.listen(3000)
