

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/user"),
    flash       = require("connect-flash");
    passport     = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,   
     HttpsProxyAgent = require('https-proxy-agent'),
     LocalStrategy = require('passport-local').Strategy,
     FacebookStrategy = require('passport-facebook').Strategy;
    
mongoose.connect("mongodb://localhost/authdb");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//fb strategy
passport.use(new FacebookStrategy({
    'clientID': '268194597051640',
    'clientSecret': 'b84d1ae367cb4c3f913528c26df5bda7',
    'callbackURL': 'http://localhost:8080/facebook/auth/callback'
    
}, 
//   function(accessToken, refreshToken, profile, done) {
//          User.findOrCreate({ googleId: profile.id }, function (err, user) {
//           return done(err, user);
//          });
//     console.log("passport callback function fired");
//     console.log(profile);
//   }
function(accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
        User.findOne({'facebook': profile.id}, function(err, user){
            if(err)
                return done(err);
            if(user)
                return done(null, user);
            else {
                var newUser = new User();
                newUser.facebook.id = profile.id;
                newUser.facebook.token = accessToken;
                newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                newUser.facebook.email = profile.emails[0].value;

                newUser.save(function(err){
                    if(err)
                        throw err;
                    return done(null, newUser);
                })
                console.log(profile);
            }
        });
    });
}
));
// google strategy


passport.use(new GoogleStrategy({
    clientID: "145003743700-dmh0r95qg1fcinuqbqhqdgs5ddpub542.apps.googleusercontent.com",
    clientSecret: "Li_RAACeIFYOucZ4_fiqLimS",
    callbackURL: "/auth/google/redirect",
}, 
  function(accessToken, refreshToken, profile, done) {
//           User.findOrCreate({ googleId: profile.id }, function (err, user) {
//            return done(err, user);
//           });
//   //  console.log("passport callback function fired");
//    // console.log(profile);
//   }
    process.nextTick(function(){
        User.findOne({'googleId': profile.id}, function(err, user){
            if(err)
                return done(err);
            if(user)
                return done(null, user);
            else {
                var newUser = new User();
                newUser.google.id = profile.id;
                newUser.google.token = accessToken;
                newUser.google.name = profile.displayName;
                newUser.google.email = profile.emails[0].value;

                newUser.save(function(err){
                    if(err)
                        throw err;
                    return done(null, newUser);
                })
                console.log(profile);
            }
        });
    });
}


));


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "WE GOT OZIL ! MESUT OZIL!",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
 });

 

// ROUTES START HERE
app.get("/", function(req, res){
    res.render('home');
});
//LOGIN FORM
app.get("/login", function(req, res){
    res.render("login");
});
//LOGIN LOGIC
app.post("/login",function(req,res) 
    {   
        passport.authenticate("local")(req, res, function(){
            req.flash('success', "successfully Loged In!");
           res.redirect("/content"); 
        });  
       
});

// logout route
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
 });

app.get('/content',function(req, res){
    res.render("content")
})

//Google login
app.get('/auth/google',
  passport.authenticate('google', { 
      scope: ['profile'] 
}));
// app.get("/auth/google/redirect", function(req, res){
//     res.send("this is the callback URI")
// });
app.get('/auth/google/redirect', 
  passport.authenticate('google', { failureRedirect: '/',
                                   successRedirect:'/content' }),
//   function(req, res) {
//     res.redirect('/');
//   }
);

//facebook login

app.get('/facebook/auth',
  passport.authenticate('facebook', { 
      scope: ['profile'] 
}));
app.get("/facebook/auth/callback", 
passport.authenticate('facebook', { failureRedirect: '/',
successRedirect:'/content' }),
    );

//SIGN UP FORM
app.get("/register", function(req, res){
    res.render("register")
});



//SIGNUP LOGIC
//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash('success', "successfully registered");
           res.redirect("/content"); 
        });
    });
});




app.listen(3000, function(){
    console.log("SERVER IS RUNNING!");
})

