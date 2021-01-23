
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create your schemas and models.
var ContactSchema = new Schema({
	name: String ,
	phone: {
        type:String,
        default:"x"
    },
	email: {
        type:String,
        unique:true
    }, 
});

// Export model to use on contacts.js
module.exports = mongoose.model('Contact', ContactSchema);
