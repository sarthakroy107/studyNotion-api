const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    coursename: {
        type: String,
        required: true,
    },
    coursedescription: {
        type: String,
        required: true,
    },
    educator: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatWillYouLearn: {
        type: String,
        
    },
    courseSection: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section",
        }
    ],
    ratingAndReviews: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview",
        }
    ],
    price: {
        type: Number,
        required: true,
    },
    thumbnail:{
        type:String,
        required: true,
    },
    courselength:{
        type: Number,
        required: true,
    },
    tag: {
        type: [String],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    studentsEnrolled: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    published: {
        type: Boolean,
        default: false,
    },
    numberOfStudents: {
        type: Number,
        default: 0,
    },
    totalRating: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    lastEdited: {
        type:Date,
        default: Date.now,
        required: true,
    },
});

module.exports = mongoose.model("Course", courseSchema);