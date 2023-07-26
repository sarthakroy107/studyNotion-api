const mongoose = require('mongoose');
const Course = require("../models/Course");
const User = require("../models/User");
const RatingAndReview = require("../models/RatingAndReview")
const Category = require("../models/Category")
const { uploadImageToCloudinary } = require("../utilis/imageUploader");
require("dotenv").config();

//Create course
exports.createCourse = async (req, res) => {
    try {
        //fetch data
        let { coursename, coursedescription, courselength, whatWillYouLearn, price, category, numberOfStudents } = req.body;
        console.log(req.body)

        //fetch thumbmail
        const tumbnail = req.files.thumbNailImage;
        console.log(req.files.thumbNailImage)
        //fetch user id from cookie
        const userId = req.user.id;
        //find educator details from userId
        const educatorDetails = await User.findById(userId);
        if(!educatorDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found, what the fuck"
            })
        }
        if(!numberOfStudents) {
            numberOfStudents = "0"
        }
        const num = parseInt(numberOfStudents);
        //check if th tag is valid or not
        // const tagDetails = await Tag.findById(tag);
        // if(!tagDetails) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "No matching tag found"
        //     });
        // }
        //Upload image to cloudinary
        let thumbNailImageUrl
        try{
            thumbNailImageUrl = await uploadImageToCloudinary(tumbnail);
        }
        catch(err) {
            return res.status(500).json({
                success: false,
                message: "Image upload to cloudinary failed"
            })
        }
        const categoryDetails = await Category.findById(category);
        //make entry to db
        let newCourse
        try{
            console.log("Before course creation")
            newCourse = await Course.create({
                coursename,
                coursedescription,
                whatWillYouLearn,
                price: price,
                educator: educatorDetails._id,
                thumbnail: thumbNailImageUrl.secure_url,
                category: categoryDetails._id,
                courselength,
    
            })
        }
        catch(err) {
            return res.status(401).json({
                success: false,
                message: err
            })
        }
        console.log("after db")
        //add course to User model
        await User.findByIdAndUpdate(userId, {
            $push: {
                myCourses: newCourse._id
            }
        }, {new: true});
        await Category.findByIdAndUpdate(categoryDetails._id, {
            $push: {
                course: newCourse._id
            }
        })

        //add course to model
        // await Tag.create(userId,{
        //     $push: {
        //         course: newCourse._id,                
        //     }
        // });
        console.log("I'm before 200")
        //return response
        res.status(200).json({
            success: true,
            message: "New course added",
            data: newCourse._id
        })
    }
    catch(err) {
        return res.status(500).json({
            success: false,
            message: "Course generation failed"
        });
    }
}

//get all courses handler function
exports.showAllCourrses = async (req, res) => {
    try {
        const allCourses = Course.findById({});
        
        return res.status(200).json({
            success: true,
            message: "All courses data fetched.",
            data: allCourses
        })
    }
    catch(err) {
        return res.status(500).json({
            success: false,
            message: "Failed fetching course data"
        })
    }

}

//Get all the details of course
exports.getCourseDetails = async (req, res) =>{
    try {
        //fetch courseId
        const { courseId } = req.body;
        //get all the details
        console.log(courseId)
        const courseDetails = await Course.findById(courseId).populate([
            {
                path: "educator",
                select: "firstname lastname image"
            },
            {
                path: "category",
                select: "name"
            },
            {
                path: "courseSection",
                populate: {
                    path: "subSection"
                }
            }
            
        ])
        //console.log(courseDetails)
        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course details not found /controllers/Course/getAllDetails"
            });
        }
        const avgRating = await RatingAndReview.aggregate([{
            $group:{ _id: courseId, avgR: {$avg:"$rating"}}
        }])
        const allDetails = {
            ...courseDetails.toObject(),
            avgRating: avgRating[0].avgR
        }
        return res.status(200).json({
            success: true,
            message: "All course details fetched successfully /controller/Course/getAllDetails",
            data: allDetails
        })
    }
    catch(err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all details of course /controllers/Course/getAllDetails"
        })
    }
}

exports.getAllCourses = async (req, res) => {
	try {
		const allCourses = await Course.find(
			{},
			{
				coursename: true,
				price: true,
				thumbnail: true,
				educator: true,
				ratingAndReviews: true,
				studentsEnrolled: true,
			}
		)
			.populate("educator")
			.exec();
		return res.status(200).json({
			success: true,
			data: allCourses,
		});
	} catch (error) {
		console.log(error);
		return res.status(404).json({
			success: false,
			message: `Can't Fetch Course Data`,
			error: error.message,
		});
	}
};

exports.publishCourse = async (req, res) => {
    try {
        const {courseId} = req.body;
        const course = await Course.findById(courseId);
        if(course.published) {
            return res.status(200).json({
                success: true,
                message: "Course is already published",
                data: true
            })
        }
        const pub = await Course.findByIdAndUpdate(courseId, {
            published: true
        }, {new:true})
        return res.status(200).json({
            success: true,
            message: "Course published",
            data: pub.published
        })
    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "Course publish failed"
        })
    }
}
exports.getMyCourses = async (req, res) => {
    try {
        const id = req.user.id
        const user = await User.findById(id).populate("myCourses").exec();
        return res.status(200).json({
            success: true,
            message: "Course data fetched",
            data: user
        })
    }
    catch(err) {
        console.log(err)
    }
    
}

exports.getEnrolledCourses = async (req, res) => {
    try{
        const id = req.user.id;
        const courses = await Course.find({studentsEnrolled: id});
        console.log(courses)
        return res.status(200).json({
            success: true,
            message: "Data fetching succesfull",
            data: courses
        })

    }
    catch(err) {
        return res.status(500).json({
            success: false,
            message: "Enrolled coursses data fetching failed"
        })
    }
}