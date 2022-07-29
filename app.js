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
//app.use(typeSort)

app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

app.use(express.urlencoded())



app.get('/', function (req, res) {
  //console.log(res);
  //console.log(req.query);
    res.render('index', {activePage: "home"}) 
}) 
app.get('/contact(s)?', function (req, res) {//адрес contact и contacts
  //let obj = { title:'Новость', id: 4, paragraphs:['Параграф', 'Обычный текст', 'Числа: 3, 7, 24', 476]};
  //res.render('contact', {activePage: "contact", newsId: req.params.id, newParam: 535, obj: obj});
  res.render('contact', {activePage: "contact"});

})
//test
        app.get('/about', function (req, res) {
          res.send("<h1>Это мы, опилки</h1>" );
          console.log("</br> pronjkol + Url:  " + req.protocol + " " + req.url + " " + req.ip) ;

        })
        app.get('/about/:id1/:id2', function (req, res) {
          res.send("Это мы, опилки " +req.params.id1+ " и " +req.params.id2 );
          res.sendFile(__dirname + '/views/test.html');
        })
    /*    app.use(function(req, res) {
          res.status(404).send('not found');
        }); 
    */
 //test

      
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
        res.render('posts',  {activePage: "posts", posts: rows, flagSort:"" })
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
    console.log(req.body)
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
    var sqlP = "SELECT * FROM posts WHERE id = ?"
    var params = [req.params.id]
    db.get(sqlP, params, (err, row) => {
      if (err) {
        res.status(400)
        res.send("database error:" + err.message)
        return;
      }
      postP = row;
      //res.render('show_post', {postP: postP, activePage: "posts"})
    });
    //console.log(postP);
    var sqlC = "SELECT * FROM coments"
    db.all(sqlC, [], (err, rows) => {
        if (err) {
          res.status(400)
          res.send("database error:" + err.message)
          return;
          
        }
      postC = rows;
      //console.log(postP);
      console.log(postC);
      // нет гарантии что успеют прийти все данные из первой таблицы
      res.render('show_post',  {postP:postP, postC:postC, activePage: "posts" })
      });
   
     })


app.post('/posts/:id/show', function (req, res) {
    var data2 = [
    req.body.postId,
    req.body.author,
    req.body.comment
  ]
  var sql = "INSERT INTO coments (postId, author, comment) VALUES (?,?,?)"
  db.run(sql, data2, function (err, result) {
    if (err) {
      res.status(400)
      res.send("database error:" + err.message)
      return;
    }
    res.render('show_post', {activePage: "posts", formData1: req.body})
    console.log(req.body)
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
  
    res.render('login', {activePage: "login", error: "", })
    
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
      if (error !== "") { //что это значит
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
        res.redirect("/posts");
      });
   
    })
   })
   
   function setCurrentUser(req, res, next) {
    
    if (req.session.loggedIn) {
      var sql = "SELECT * FROM users WHERE id = ?"
      var params = [req.session.userId]
      db.get(sql, params, (err, row) => {
        if (row !== undefined) {
          res.locals.currentUser = row
        }
        //console.log(res.locals.currentUser);
        return next()
      });
    } else {
      return next()
    }
   }

   //function typeSort(sort){ return sort;}
 
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
      return next();
    } else {
      res.redirect('/login');
    }
   }
  
    app.get('/posts/:id', function(req, res){
      //let obj = { title:'Новость', id: 4, paragraphs:['Параграф', 'Обычный текст', 'Числа: 3, 7, 24', 476]};
      var sql = "SELECT * FROM posts"
    db.all(sql, [], (err, rows) => {
        if (err) {
          res.status(400)
          res.send("database error:" + err.message)
          return;
        }
      res.render('posts',   {activePage: "posts", posts: rows, flagSort: req.params.id});
      //console.log(res.locals.currentUser);
    });
  })




   app.listen(3000, function() {
    console.log('running on http://localhost:3000/');
  });
