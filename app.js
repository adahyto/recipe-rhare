const express = require('express');
const app = express();
const path = require('path');
const handles = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const port = process.env.PORT || 3000;

// database
const {mongoDbUrl} = require('./config/database');
mongoose.connect(mongoDbUrl)
  .then((db)=>{console.log(`${mongoDbUrl} connected`);})
  .catch(error=>console.log(error));

// set static & engine
app.use(express.static(path.join(__dirname, 'public')));
const {select, generateDate, paginate} = require('./helpers/handlebars-helpers');
app.engine('handlebars', handles({defaultLayout: 'home', helpers:{generateDate:generateDate, paginate:paginate}}));
app.set('view engine', 'handlebars');
// Upload Middleware
app.use(upload());

// body parser & method override
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// SESSIONS &flash
app.use(session({
  secret: 'secretcode123',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());

//local variables using Middleware
app.use((req, res, next)=>{
  res.locals.user = req.user || null;
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error');
  next();
});

// load&use routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const recipes = require('./routes/admin/recipes');
const comments = require('./routes/admin/comments');
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/recipes', recipes);
app.use('/admin/comments', comments);

// enjoy
app.listen(port, ()=>{
  console.log(`listening on ${port}`);
});
