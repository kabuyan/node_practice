var http=require('http')
var express=require('express')

var app=express()

app.use(function(req,res,next){
    return res.send('Hello World')
});

var server=http.createServer(app);
server.listen('3000')