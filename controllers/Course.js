const Course = require("../models/Course");
const User = require("../models/User");
const Tag = require("../models/Tags");
const cloudinary = require("cloudinary");
require("dotenv").config();

//Create course
exports.createCourse = async (req, res) => {
    try {
        //fetch data
        const {coursename, coursedescription, whatWillyouLearn, price, tag} = req.body;

        //fetch thumbmail
        const tumbNail = req.files.thumbNailImage;
        //fetch user id from cookie
        const userId = req.cookie.id;
        //find educator details from userId
        const educatorDetails = await User.findById(userId);
        if(!educatorDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        //check if th tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "No matching tag found"
            });
        }

        //Upload image to cloudinary
        try{
            const thumbNailImage = await cloudinary.uploader.upload(tumbNail, process.env.THUMBNAIL_FOLDER);
        }
        catch(err) {
            return res.status(500).json({
                success: false,
                message: "Image upload to cloudinary failed"
            })
        }
        //make entry to db
        const newCourse = await Course.create({
            coursename,
            coursedescription,
            whatWillyouLearn,
            price,
            tag: tagDetails._id,
            educator: userId,

        })

        //add course to User model
        await User.findByIdAndUpdate(userId, {
            $push: {
                courses: newCourse._id
            }
        }, {new: true});

        //add course to model
        await Tag.create(userId,{
            $push: {
                course: newCourse._id,                
            }
        });

        //return response
        res.status(200).json({
            success: false,
            message: "New course added"
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
        const {courseId} = req.body;
        //get all the details
        const courseDetails = Course.findById({_id: courseId}).populate(
            {
                path: "instructor",
                populate: {
                     path: profile
                }
            }
        ).populate("category").populate({
            path: courseSection,
            populate: {
                path: subSection,
            }
        }).exec();
        //validation
        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course details not found /controllers/Course/getAllDetails"
            });
        }

        return res.status(200).json({
            success: true,
            message: "All course details fetched successfully /controller/Course/getAllDetails",
            data: courseDetails
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
			.populate("instructor")
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
