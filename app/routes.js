module.exports = function(app, passport) {
	var User = require('./models/user.js');

	app.get('/', function(req, res){
		res.render('home');
	});

	//the login form 

	app.get('/login', function(req, res){

		res.render('login', { message: req.flash('loginMessage') });
	});

	// process the login form 
	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

	//the signup form

	app.get('/signup', function(req, res){

		res.render('signup', { message: req.flash('signupMessage') });
	});

	//process the signup form 
	app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


	app.get('/profile', isLoggedIn, function(req, res){
		res.render('profile', {
			user : req.user //get the user out of session and pass to the template
		});
	});

	  app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

	 //ability to edit user information 
	 app.get('/edit', isLoggedIn, function(req, res){
	 	res.render('edit', {
	 		user : req.user
	 	});
	 });

	   app.post('/edit', function(req, res) {
        var user            = req.user;
        user.local.email    = req.body.email;
        user.local.password = user.local.password;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
	   //display index of users


	   app.get('/index', isLoggedIn, function(req, res){
	   	 User.find(function(err, users) {
          res.render('index', { users: users});
     		});
	   });
};

//middleware to make sure a user is loggin in 

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}