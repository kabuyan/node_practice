var http=require('http');
var path=require('path');
var express=require('express');
var bodyparser=require('body-parser');
var mongoose=require('mongoose');
var fileUpload=require('express-fileupload');
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var session=require('express-session');

// スキーマをインポート
var User=require('./schema/User')
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

// ミドルウェアとして追加
app.use(bodyparser());
app.use(session({secret: 'HogeFuga'}));
app.use(passport.initialize());
app.use(passport.session());

// テンプレートエンジンとして設定
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

// 画像ファイルの設定
app.use("/image",express.static(path.join(__dirname,'image')));
app.use("/avatar",express.static(path.join(__dirname,'avatar')));

app.get("/",function(req,res,next){
    // データを取得
    // find(クエリ,コールバック関数)
    Message.find({},function(err,msgs){
        if(err) throw err;
        return res.render('index',{
            messages: msgs,
            user: req.session && req.session.user ? req.session.user : null
        });
    });
});

app.get("/signin",function(req,res,next){
    return res.render('signin');
});

app.post("/signin",fileUpload(),function(req,res,next){
    var avatar=req.files.avatar;
    avatar.mv('./avatar/'+avatar.name,function(err){
        if(err) throw err;
        var newUser=new User({
            username: req.body.username,
            password: req.body.password,
            avatar_path: '/avatar/'+avatar.name
        });
        newUser.save((err)=>{
            if(err) throw err;
            return res.redirect("/");
        });
    });
});

app.get("/login",function(req,res,next){
    return res.render('login');
});

// 認証が成功した場合コールバック関数が呼ばれる
app.post('/login',passport.authenticate('local'),function(req,res,next){
    User.findOne({_id: req.session.passport.user},function(err,user){
        if(err||!user||!req.session) return res.redirect('./login');
        else{
            req.session.user={
                username: user.username,
                avatar_path: user.avatar_path
            };
            return res.redirect("/");
        }
    });
});

// セッションが設定されていない場合の処理
passport.use(new LocalStrategy(function(username,password,done){
    User.findOne({username: username},function(err,user){
        // done(エラーが発生した場合trueと評価される値,登録済みのユーザーの場合true)
        if(err) return done(err);
        if(!user) return done(null,false,{message:'Incorrect username.'});
        if(user.password!==password) return done(null,false,{message:'Incorrect password.'});
        return done(null,user);
    });
}));

passport.serializeUser(function(user,done){
    done(null,user._id)
});

passport.deserializeUser(function(id,done){
    User.findOne({_id: id},function(err,user){
        done(err,user);
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