/*  !!!!!!!!!!!!!!!!!!!!!!
Для запуска и обновления установить, если не установлен
npm install -g nodemon
и потом запускать с ком. строки
nodemon app.js
http://localhost:3000/
*/

const express = require('express')
const app = express()
const db = require("./database.js")

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
app.get('/posts', function (req, res) {
    var sql = "SELECT * FROM posts"
    db.all(sql, [], (err, rows) => {
        if (err) {
          res.status(400)
          res.send("database error:" + err.message)
          return;
        }
        res.render('posts', {activePage: "posts", posts: rows})
      });
     })

app.get('/new_post', function (req, res) {
    res.render('new_post', {activePage: "new_post"})
    })

app.post('/new_post', function (req, res) {
    var data = [
    req.body.title,
    req.body.author,
    req.body.body
  ]
  var sql = "INSERT INTO posts (title, author, body) VALUES (?,?,?)"
  db.run(sql, data, function (err, result) {
    if (err) {
      res.status(400)
      res.send("database error:" + err.message)
      return;
    }
    res.render('new_post_answer', {activePage: "new_post", formData: req.body})
  });
 })

 app.get('/posts/:id/edit', function (req, res) {
    var sql = "SELECT * FROM posts WHERE id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400)
        res.send("database error:" + err.message)
        return;
      }
      res.render('edit_post', {post: row, activePage: "posts"})
    });
   })

   app.post('/posts/:id/edit', function (req, res) {
    var data = [
      req.body.title,
      req.body.author,
      req.body.body,
      req.params.id
    ]
    db.run(
      `UPDATE posts SET
         title = COALESCE(?,title),
         author = COALESCE(?,author),
         body = COALESCE(?,body)
         WHERE id = ?`,
      data,
      function (err, result) {
        if (err) {
          res.status(400)
          res.send("database error:" + err.message)
          return;
        }
        res.redirect('/posts')
      });
   })

   app.get('/posts/:id/delete', function (req, res) {
    var sql = "DELETE FROM posts WHERE id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400)
        res.send("database error:" + err.message)
        return;
      }
      res.redirect('/posts')
    });
   })
   
    
   
   app.listen(3000)
