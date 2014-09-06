// Load required packages
var mongoose = require('mongoose');

var PacketSchema = mongoose.Schema({
    image: {
    	type: Schema.Types.Mixed,
    	required: true
    },
    created: {
    	type: Date,
    	required: true
    },
    caption: {
    	type: String,
    	required: false
    },
    expires: {
    	type: Date,
    	required: false
    },
    timer: {
    	type: Number,
    	required: false
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Packet', PacketSchema);