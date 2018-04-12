const express = require('express');
const router = express.Router();
const Recipe = require('../../models/Recipe');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
/*const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;*/

router.all('/*', (req, res, next)=>{
  req.app.locals.layout = 'home';
  next();
});

router.get('/', (req, res)=>{
    const perPage = 8;
    const page = req.query.page || 1;
    Recipe.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .populate('user')
    .then(recipes =>{
      Recipe.count().then(recipeCount=>{
          res.render('home/index', {
            recipes: recipes,
            current: parseInt(page),
            pages: Math.ceil(recipeCount / perPage)
          });
      });
    });
});

router.get('/recipe/:slug', (req, res)=>{
    Recipe.findOne({slug: req.params.slug})
      .populate({path: 'comments', match: {approveComment: true}, populate:{path: 'user', model: 'users'}})
      .populate('user')
      .then(recipe=>{
          res.render('home/recipe', {recipe: recipe});
      });
});

router.get('/users', (req, res)=>{
    User.find({})
    .then(users=>{
      res.render('home/users', {users: users});
    });
});

router.get('/about', (req, res)=>{
  res.render('home/about');
});

router.get('/login', (req, res)=>{
    res.render('home/login');
});

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
    console.log(email);
    User.findOne({email: email}).then(user=>{
      if(!user) return done(null, false, {message: 'No user found'});
      bcrypt.compare(password, user.password, (err, matched)=>{
        if(err) return err;
        if(matched){
          return done(null, user);
        }else{
          return done(null, false, {message:'wrong password'});
        }
      });
    });
}));

/*passport.use(new GoogleStrategy({
    clientID: '177626534674-0estjm9pmru2njl7j5ehfbp6euj4aofu.apps.googleusercontent.com',
    clientSecret: 'x',
    callbackURL: "/auth/google/callback"
  },
  (token, tokenSecret, profile, done)=>{
    User.findOne({nickName: profile.displayName})
      .then(user=>{
        if(!user){
          const newUser = new User({
            nickName: profile.displayName,
            email: 'gmailUser'
          });
          newUser.save().then(savedUser=>{
            return savedUser;
          });
        }else{
            console.log('user already registered?');
        }
      });
      console.log(profile);
  }
));*/

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

/*router.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }), (req, res)=>{
    res.redirect('/admin');
});*/

router.get('/logout', (req, res)=>{
  req.logOut();
  res.redirect('/');
});

router.get('/register', (req, res)=>{
  res.render('home/register');
});
router.post('/register', (req, res)=>{
  let errors = [];
  if(!req.body.nickName) {
    errors.push({message: 'please add a nickName'});
  }
  if(!req.body.email) {
    errors.push({message: 'please add an email'});
  }
  if(!req.body.password) {
    errors.push({message: 'enter your password'});
  }
  if(!req.body.passwordConfirm) {
    errors.push({message: 'repeat your password'});
  }
  if(req.body.password !== req.body.passwordConfirm) {
    errors.push({message: 'please match password'});
  }
  if(errors.length > 0){
    res.render('home/register', {
      errors: errors,
      nickName: req.body.nickName,
      email: req.body.email,
  })
}else{
  User.findOne({email: req.body.email})
    .then(user=>{
      if(!user){
        const newUser = new User({
          nickName: req.body.nickName,
          email: req.body.email,
          password: req.body.password
        });
        bcrypt.genSalt(10, (err, salt)=>{
          bcrypt.hash(newUser.password, salt, (err, hash)=>{
              newUser.password = hash;
              newUser.save().then(savedUser=>{
                res.redirect('/login');
              });
          });
        });
      }else{
        res.redirect('/register');
      }
    });
}
});

module.exports = router;
