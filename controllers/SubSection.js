const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utilis/imageUploader");
const Course = require("../models/Course");

//create subsection
exports.createSubSection = async (req, res) => {
    try {
        
        const {title, timeDuration, sectionId, courseId} = req.body;
        console.log(req.body)
        console.log("Here")
        console.log(req.files)
        const file = req.files.material; //fetching video or image file
        
        //upload file to cloudinary
        const url = await uploadImageToCloudinary(file);//error might happen
        console.log("Hello")
        console.log(url)
        //create entry to db
        const newSubSection = await SubSection.create({
            title, videoUrl: url.secure_url, timeDuration
        });
        await Section.findByIdAndUpdate(sectionId,{
            $push: {
                subSection: newSubSection._id,
            }
        });
        await Course.findByIdAndUpdate(courseId, {
            $inc: {
                lessons: 1,
            },
        })
        console.log("Hii")
        return res.status(200).json({
            success: true,
            message: "Sub section created."
        });
    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "Sub section creation failed."
        })
    }
}

//update subsection
exports.updateSubSection = async (req, res) => {
    try {
        //fetch data
        const {timeDuration, title, videoUrl, subSectionId} = req.body;
        console.log(req.body)
        //const file = req.files.material;
        // if(file) {
        //     console.log("If file")
        //     const newFile = await uploadImageToCloudinary(file);//error might happen
        //     console.log("HIIIIII")
        //     videoUrl =  newFile.secure_url;
        //     console.log("Cloudinary")
        // }

        //updateData
        await SubSection.findByIdAndUpdate(subSectionId, {
            title: title,
            timeDuration: timeDuration,
            videoUrl: videoUrl,
        });

        return res.status(200).json({
            success: true,
            message: "Sub section updation complete."
        })

    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "Subsection updation failed."
        })
    }
}

//delete subsection
exports.deleteSubSection = async (req, res) => {
    try {
        //fetch data
        const {subSectionId, sectionId, courseId} = req.body;
        console.log(req.body)
        //delete sub section
        await SubSection.findByIdAndDelete(subSectionId);
        await Section.findByIdAndUpdate(sectionId, {
            $pull: {
                subSection: subSectionId,
            }
        })
        await Course.findByIdAndUpdate(courseId, {
            $inc: {
                lessons: -1,
            }
        })
        return res.status(200).json({
            success: true,
            message: "Sub section deletation successful",
        })
    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "Sub section deletation failed."
        })
    }
}