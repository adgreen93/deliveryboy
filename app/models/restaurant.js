// app/models/user.js
// load the things we need
var mongoose = require('mongoose');


// define the schema for our user model
var restaurantSchema = mongoose.Schema({

   	restaurantName: { type: String, default: '' },
    restaurantLocation: { type: String, default: '' },
    restaurantWebsite: { type: String, default: '' }
    
});



// create the model for users and expose it to our app
module.exports = mongoose.model('Restaurant', restaurantSchema);