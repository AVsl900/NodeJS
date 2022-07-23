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
const bcrypt = require('bcrypt')
const session = require('express-session')
app.use(session({
 secret: 'randomly generated secret',
}))
app.use(setCurrentUser) //имеет значение место вызова, в конце - не работает


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
   
   app.get('/posts/:id/show', function (req, res) {
    var sql = "SELECT * FROM posts WHERE id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400)
        res.send("database error:" + err.message)
        return;
      }
      res.render('show_post', {post: row, activePage: "posts"})
    });
   })

   app.get('/register', function (req, res) {
    res.render('register', {activePage: "register"})
   })
   
   app.post('/register', function (req, res) {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
      var data = [
        req.body.name,
        req.body.email,
        hash
      ]
      var sql = "INSERT INTO users (name, email, password) VALUES (?,?,?)"
      db.run(sql, data, function (err, result) {
        if (err) {
          res.status(400)
          res.send("database error:" + err.message)
          return;
        }
        res.render('register_answer', {activePage: "register", formData: req.body})
      });
    });
   })
   
   app.get('/register', function (req, res) {
    res.render('register', {activePage: "register"})
   })
   
   app.get('/login', function (req, res) {
    res.render('login', {activePage: "login", error: ""})
   })
   
   app.post('/login', function (req, res) {
    var sql = "SELECT * FROM users WHERE email = ?"
    var params = [req.body.email]
    var error = ""
    db.get(sql, params, (err, row) => {
      if (err) {
        error = err.message
      }
      if (row === undefined) {
        error = "Wrong email or password"
      }
      if (error !== "") {
        res.render('login', {activePage: "login", error: error})
        return
      }
      bcrypt.compare(req.body.password, row["password"], function(err, hashRes) {
        if (hashRes === false) {
          error = "Wrong email or password"
          res.render('login', {activePage: "login", error: error})
          return
        }
        req.session.userId = row["id"]
        req.session.loggedIn = true
        res.redirect("/")
      });
   
    })
   })
   
   function setCurrentUser(req, res, next) {
    //console.log("setCurrentUser");
    if (req.session.loggedIn) {
      var sql = "SELECT * FROM users WHERE id = ?"
      var params = [req.session.userId]
      db.get(sql, params, (err, row) => {
        if (row !== undefined) {
          res.locals.currentUser = row
        }
        return next()
      });
    } else {
      return next()
    }
   }
    
 
   app.get('/logout', function (req, res) {
    req.session.userId = null
    req.session.loggedIn = false
    res.redirect("/login")
   })
   
   app.get('/profile', checkAuth, function (req, res) {
    res.render('profile', {activePage: "profile"})
   })

   
   function checkAuth(req, res, next) {
    if (req.session.loggedIn) {
      return next()
    } else {
      res.redirect('/login')
    }
   }
   

   app.listen(3000)
