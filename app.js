var http=require('http');
var express=require('express');

var app=express();

app.get("/",function(req,res,next){
    return res.send('Hello World');
});

app.get("/hoge",function(req,res,next){
    return res.send('Hoge');
});

var server=http.createServer(app);
server.listen('3000')