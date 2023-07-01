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
        type: String,
        required: true,
    },
    thumbnail:{
        type:String,
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
    }]
});

module.exports = mongoose.model("Course", courseSchema);