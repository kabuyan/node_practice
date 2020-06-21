var http=require('http');
var path=require('path');
var express=require('express');

var app=express();

// テンプレートエンジンとして設定
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.get("/",function(req,res,next){
    // HTMLをレスポンスとして返す場合は'res.render'を使用する
    // res.render(ファイル名,埋め込みたい変数)
    return res.render('index',{ 
        title: 'Hello World'
    });
});

var server=http.createServer(app);
server.listen('3000')