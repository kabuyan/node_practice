var http=require('http');
var path=require('path');
var express=require('express');
var bodyparser=require('body-parser');
var mongoose=require('mongoose');
var fileUpload=require('express-fileupload');

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

// 画像ファイルの設定
app.use("/image",express.static(path.join(__dirname,'image')));

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

app.post("/update",fileUpload(),function(req,res,next){
    if(req.files&&req.files.image){
        // 保存先を指定
        req.files.image.mv('./image/'+req.files.image.name,function(err){
            if(err) throw err;
            // データを格納
            var newMessege=new Message({
                username: req.body.username,
                message: req.body.message,
                image_path: '/image/'+req.files.image.name
            });
            // データを保存
            newMessege.save((err)=>{
                if(err) throw err;
                return res.redirect("/");
            });
        });
    }else{
        // データを格納
        newMessege=new Message({
            username: req.body.username,
            message: req.body.message
        });
        // データを保存
        newMessege.save((err)=>{
            if(err) throw err;
            return res.redirect("/");
        });
    }
});

var server=http.createServer(app);
server.listen('3000')