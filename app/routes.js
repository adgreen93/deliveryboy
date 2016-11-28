module.exports = function(app, passport) {

	var User = require('./models/user.js');
	var Product = require('./models/product.js');
	var Restaurant = require('./models/restaurant.js');

	var multer = require('multer');

	var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



	app.get('/', function(req, res){
		res.render('home');
	});

	
	app.delete('/products/:id', function(req, res) {
        Product.remove({ _id: req.params.id }, function(err, product) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });



	app.post('/charge', function(req, res, next) {
	  var stripeToken = req.body.stripeToken;
	  var amount = req.body.price * 100;

	  // ensure amount === actual product amount to avoid fraud

	  stripe.charges.create({
	    card: stripeToken,
	    currency: 'usd',
	    amount: amount
	  },
	  function(err, charge) {
	    if (err) {
	      console.log(err);
	      res.send('error');
	    } else {
	      res.send('success');
	    }
	  });
	});

	//the login form 

	app.get('/login', function(req, res){

		res.render('login', { message: req.flash('loginMessage') });
	});

	// process the login form 
	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/restaurants', // redirect to the secure profile section
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

	   //getting full index of products (this will need to be tied to restaurant)

	   app.get('/products', function(req, res){
	   	Product.find(function(err, products){
	   		res.render('product-list', {products:products});
	   		console.log(products);
	   		});
	   });

	   //getting a specific product 

	   app.get('/products/:id', function(req, res) {

		Product.find({ _id: req.params.id }, function(err, product) {
	
			console.log(product)
			
		  if (err)
                res.send('Could not find product.');
            else {
      return res.render('product', {productInfo: product});
      	
  }
		});
	});

	   //creating new products

	   app.post('/products', function(req, res) {

        // create a product
        Product.create({
            productName  : req.body.name,
            productDescription : req.body.description,
            productPrice : req.body.price
        }, function(err, product) {
            if (err)
                res.sendStatus(err);  
            else {
      return res.send('Success.');
    }
        });

    	});

	   //RESTAURANT API ROUTES

	   app.get('/restaurants', isLoggedIn, function(req, res){

	   	Restaurant.find(function(err, restaurants){
	   		res.render('restaurant-list', {restaurants:restaurants, user : req.user});
	   		console.log(process.env.STRIPE_SECRET_KEY)

	   		});
	   });

	   app.get('/restaurants/:id', isLoggedIn,function(req, res) {

		Restaurant.find({ _id: req.params.id }, function(err, restaurant) {
	
			console.log(restaurant)

		  if (err)
                res.send('Could not find restaurant.');
            else {
      return res.render('restaurant', {restaurantInfo: restaurant});

  }
		});
	});

	   app.get('/build', isLoggedIn, function(req, res){

	   	res.render('restaurant-builder', {user : req.user});

	   })

	   app.post('/restaurants/new', function(req, res) {

        // create a product
        Restaurant.create({
            restaurantName  : req.body.name,
            restaurantLocation : req.body.location,
            restaurantWebsite : req.body.website
        }, function(err, restaurant) {
            if (err)
                res.sendStatus(err);  
            else {
      return res.send('Restaurant successfully created.');
    	}
        });

    	});

	   
	   
		app.post('/upload', multer({  dest: 'public/uploads/'}).single('image'), function(req,res){
		 //form fields
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