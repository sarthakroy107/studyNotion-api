const RatingAndReview = require("../models/RatingAndReview");
const User = require("../models/User");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

exports.createRatingAndReview = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const {courseId, rating, review} = req.body;
        const courseDetails = await Course.findOne(
            {_id:courseId,
            studentsEnrolled: {$elemMatch: {$eq: userId} },
        });
        //will find the course details and user is enrolled or not with userId in the course.
        if(!courseDetails) {
            return res.status(402).json({
                success: false,
                message: "User is not enrolled"
            })
        }
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId, course:courseId,
        })
        if(alreadyReviewed) {
            return res.status(201).json({
                success: true,
                message: "Rating and Review already exists"
            });
        }
        const ratingReview = await RatingAndReview.create({
            rating, review, 
            course:courseId,
            user:userId,
        });
        console.log("Rating created")
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            {new: true});
        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//aggregate all ratings
exports.getAverageRating = async (req, res) => {
    try {
        //get course ID
        const courseId = req.body;
        if(!courseId) {
            return res.status(401).json({
                success: false,
                message: "Course not found getAvgRating"
            })
        }
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                },
            },
            {
                $given: {
                    _id: null,
                    averageRating: { $avg: "$rating"}
                }
            }  
        ])
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({}).sort({rating: "desc"}).populate({
                path:"user",
                select:"firstName lastName email image",
            }).populate({
                    path:"course",
                    select: "courseName",
            }).exec();

            
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}