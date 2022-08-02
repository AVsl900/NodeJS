/*  !!!!!!!!!!!!!!!!!!!!!!
Для запуска и обновления установить, если не установлен
npm install -g nodemon
и потом запускать с ком. строки
nodemon app.js
http://localhost:3000/
2 способа
npm install validator
<script src="https://unpkg.com/validator@latest/validator.min.js"></script>

*/

const express = require('express')
const app = express()
const db = require("./database.js")
const bcrypt = require('bcrypt')
const session = require('express-session')

app.use('/static', express.static(__dirname + '/public'));

app.use(session({
 secret: 'randomly generated secret',
}))
app.use(setCurrentUser) //имеет значение место вызова, в конце - не работает
//app.use(typeSort)

app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

app.use(express.urlencoded())

var validator = require('validator'); //npm install validator

app.get('/', function (req, res) {
  //console.log(res);
  //console.log(req.query);
    res.render('index', {activePage: "home"}) 
}) 
app.get('/contact(s)?', function (req, res) {//адрес contact и contacts
  //let obj = { title:'Новость', id: 4, paragraphs:['Параграф', 'Обычный текст', 'Числа: 3, 7, 24', 476]};
  res.render('contact', {activePage: "contact"});

})
//test
        app.get('/about', function (req, res) {
          res.send("<h1>Это мы, опилки</h1>" );
          //console.log("</br> protokol + Url:  " + req.protocol + " " + req.url + " " + req.ip) ;

        })
        app.get('/about/:id1', function (req, res) {
          res.sendFile(__dirname + '/views/test.html');
        })
        app.get('/about/:id1/:id2', function (req, res) {
          res.send("Это мы, опилки " +req.params.id1+ " и " +req.params.id2 );
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
        res.render('posts',  {activePage: "posts", posts: rows, flagSort:"", Get:""})
      });
     })

     app.get('/search_posts', function (req, res) {
  
      var urlib=require('url');
      var arr=urlib.parse(req.url,true)
      //var url = arr.pathname // имя пути
      var GetS = arr.query // Сбор данных
      //console.log(url,GET)// /NP {user:'xxx',pwd:'xxxxx'}
      let s = "%" + GetS.search + "%";
      //console.log(GetS)
      var sql = "SELECT * FROM posts WHERE title like" + "'" + s + "'";
      db.all(sql, [], (err, rows) => {
          if (err) {
            res.status(400)
            res.send("database error:" + err.message)
            return;
          }
          res.render('posts',  {activePage: "posts", posts: rows, flagSort: "", Get:GetS.search })
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

  for(let i=0; i<data.length; i++)
  {data[i] = validator.escape(data[i]);
  }

  var sql = "INSERT INTO posts (title, author, body) VALUES (?,?,?)"
  db.run(sql, data, function (err, result) {
    if (err) {
      res.status(400)
      res.send("database error:" + err.message)
      return;
    }
    res.render('new_post_answer', {activePage: "new_post", formData: req.body})
    //console.log(req.body)
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
    var sqlC = "SELECT * FROM coments"
    db.get(sqlP, params, (err, row) => {
      if (err) {
        res.status(400)
        res.send("database error:" + err.message)
        return;
      }
      postP = row;
      //res.render('show_post', {postP: postP, activePage: "posts"})
      db.all(sqlC, [], (err, rows) => { //чтение БД coments вложено в posts
        if (err) {
          res.status(400)
          res.send("database error:" + err.message)
          return;    
        }
      postC = rows;
      //console.log(postP);
      // нет гарантии что успеют прийти все данные из первой таблицы
      res.render('show_post',  {postP:postP, postC:postC, activePage: "posts" })
      });
    });
  })


app.post('/posts/:id/show', function (req, res) {
    var data = [
    req.body.postId,
    req.body.author,
    req.body.comment
  ]
  console.log(req.body.postId); //это странно, как id стало postId ????? почему с ним нет проблем в get???
  for(let i=0; i<data.length; i++)
  {data[i] = validator.escape(data[i]);
  }
 
  var sql = "INSERT INTO coments (postId, author, comment) VALUES (?,?,?)"
  db.run(sql, data, function (err, result) {
    if (err) {
      res.status(400)
      res.send("database error:" + err.message)
      return;
    }
  });

var sqlP = "SELECT * FROM posts WHERE id = ?"
var params = [req.params.id]
var sqlC = "SELECT * FROM coments"
db.get(sqlP, params, (err, row) => {
  if (err) {
    res.status(400)
    res.send("database error:" + err.message)
    return;
  }
  postP = row;
  db.all(sqlC, [], (err, rows) => { //чтение БД coments вложено в posts
    if (err) {
      res.status(400)
      res.send("database error:" + err.message)
      return;    
    }
  postC = rows;
  // нет гарантии что успеют прийти все данные из первой таблицы
  res.render('show_post',  {postP:postP, postC:postC, activePage: "posts" })
  });
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

      for(let i=0; i<data.length; i++)
      {data[i] = validator.escape(data[i]);
      }

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
      return next();
    } else {
      res.redirect('/login');
    }
   }
  
    app.get('/posts/:id', function(req, res){
      var sql = "SELECT * FROM posts"
    db.all(sql, [], (err, rows) => {
        if (err) {
          res.status(400)
          res.send("database error:" + err.message)
          return;
        }
      res.render('posts',   {activePage: "posts", posts: rows, flagSort: req.params.id, Get:""});
      //console.log(res.locals.currentUser);
    });
  })

   app.listen(3000, function() {
    console.log('running on http://localhost:3000/');
  });
