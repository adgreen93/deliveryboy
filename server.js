require('dotenv').config();

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var multer = require('multer');
//makes log comments readable 
var morgan = require('morgan');
var stripe = require('stripe');
//enables you to set cookies and take data from html form 
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//sets up sessions(users are logged in across pages until logged out)
var session = require('express-session');

//installs templating engine 
var exphbs  = require('express-handlebars');

//sets up database
var configDB = require('./config/database.js');

//connects to database 

mongoose.connect(configDB.url);

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname + '/public'));


app.use(bodyParser.json()); // get information from html forms

 // set up handlebars for templating
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// required for passport
app.use(session({ 
	secret: 'howdy2k16',
	resave: true,
    saveUninitialized: true
	 })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./config/passport')(passport); // pass passport for configuration
// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);