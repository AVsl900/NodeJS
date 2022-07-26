let express = require('express');

let app = express();

app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
app.get('/about', function(req, res){
	res.sendFile(__dirname + '/about.html');
});

app.get('/news/:id', function(req, res){
	let obj = { title:'Новость', id: 4, paragraphs:['Параграф', 'Обычный текст', 'Числа: 3, 7, 24', 476]};
	res.render('news', {newsId: req.params.id, newParam: 535, obj: obj});
});
app.listen(3000);
