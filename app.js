var http=require('http');
var path=require('path');
var express=require('express');
var bodyparser=require('body-parser');
var mongoose=require('mongoose');

// スキーマをインポート
var Message=require('./schema/Message');

var app=express();

// MongoDBに接続
mongoose.connect('mongodb://localhost:27017/chatapp',function(err){
    if(err){
        console.error(err);
    }else{
        console.log("successfully connected to MongoDB.");
    }
});

app.use(bodyparser());

// テンプレートエンジンとして設定
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.get("/",function(req,res,next){
    // データを取得
    // find(クエリ,コールバック関数)
    Message.find({},function(err,msgs){
        if(err) throw err;
        return res.render('index',{
            messages: msgs
        });
    });
});

app.get("/update",function(req,res,next){
    return res.render('update');
});

app.post("/update",function(req,res,next){
    // データを格納
    var newMessege=new Message({
        username: req.body.username,
        message: req.body.message
    });
    // データを保存
    newMessege.save((err)=>{
        if(err) throw err;
        return res.redirect("/");
    });
});

var server=http.createServer(app);
server.listen('3000')