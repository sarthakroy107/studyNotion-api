const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: String,
        default: null
    },
    mobileNumber: {
        type: Number,
        default: null
    },
    about: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model("Profile", profileSchema);