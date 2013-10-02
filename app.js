var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;


var TWITTER_CONSUMER_KEY = "YOUR CONSUMER KEY";
var TWITTER_CONSUMER_SECRET = "YOUR CONSUMER SECRET";

// Passport sessionのセットアップ
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// PassportでTwitterStrategyを使うための設定
passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:3000/auth/twitter/callback"
}, 
function(token, tokenSecret, profile, done) {
    profile.twitter_token = token;
    profile.twitter_token_secret = tokenSecret;

    process.nextTick(function () {
      return done(null, profile);
    });
  }
));


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // 以下を追加
  app.use(express.cookieParser()); 
  app.use(express.session({secret: "hogehoge"}));
  app.use(passport.initialize()); 
  app.use(passport.session()); 
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/users', user.list);

// -- 追加したルート --
// ユーザーからリクエストをもらうルート
app.get("/auth/twitter", passport.authenticate('twitter'));

// Twitterからcallbackうけるルート
app.get("/auth/twitter/callback", passport.authenticate('twitter', {
  successRedirect: '/timeline',
  failureRedirect: '/login'
}));

app.get('/timeline', function(req,res){
  // search tweets.
    passport._strategies.twitter._oauth.getProtectedResource(
        'https://api.twitter.com/1.1/statuses/user_timeline.json',
        'GET',
    req.user.twitter_token,
    req.user.twitter_token_secret,
    function (err, data, response) {
        if(err) {
            res.send(err, 500);
            return;
        }
        
        var jsonObj = JSON.parse(data);
        res.send(jsonObj);
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
