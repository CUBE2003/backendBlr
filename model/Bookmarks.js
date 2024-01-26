const mongoose = require('mongoose');

const Bookschemas = new mongoose.Schema({
    job:{type:mongoose.Schema.Types,ObjectId, ref: "Job"},
    userId:{type:String, required:true},
    
    
}, {timestamp:true});

module.exports = mongoose.model('Book', Bookschemas);