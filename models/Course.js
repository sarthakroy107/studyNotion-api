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
    instructor: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatWillyouLearn: {
        type: String,
        required: true
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

    },
    thumbnail:{
        type:String,
    },
    tag: {
        type: [String],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    studentsEnrolled: [{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    }]
});

module.exports = mongoose.model("Course", courseSchema);