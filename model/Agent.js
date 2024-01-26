
const mongoose=require('mongoose');

const AgentSchema= new mongoose.Schema({
    userId:{type: String, require: true},
    uid:{type: String, require: true},
    company:{type: String, require: true},
    hq_address:{type: String, require: true},
    working_hrs:{type: String, require: true},
}, {timestamps:true});

module.exports=mongoose.model('Agent',AgentSchema)