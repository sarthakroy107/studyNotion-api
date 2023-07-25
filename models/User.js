const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim:true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    contactnumber: {
        type: Number,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    role: {
        type: String,
        enum: ["admin", "student", "educator", "tester"],
        required: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
    },
    token: {
        type: String
    },
    resetPasswordVaildTime: {
        type: Date,
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    myCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }
    ],
    image: {
        type: String,
        required: true,
    },
    coursepogress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress"
        }
    ]
})

module.exports = mongoose.model("User", userSchema);