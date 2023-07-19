const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    sectionName: {
        type:String,
        required: true,
    },
    subSection: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",    
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model("Section", sectionSchema);