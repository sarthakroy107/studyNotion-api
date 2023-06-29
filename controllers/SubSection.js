const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utilis/imageUploader")

//create subsection
exports.createSubSection = async (req, res) => {
    try {
        //fetch data
        const {title, description, sectionId} = req.body;
        const file = req.files.material; //fetching video or image file
        //upload file to cloudinary
        const url = uploadImageToCloudinary(file, {folder: process.env.THUMBNAIL_FOLDER, resource: auto});//error might happen
        //create entry to db
        const newSubSection = await SubSection.create({
            title, description, videoUrl: url.secure_url
        });
        await Section.findByIdAndUpdate(sectionId,{
            $push: {
                subSection: newSubSection._id,
            }
        });

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
        const {subSectionId, subSectionName, videoUrl} = req.body;
        const file = req.files.materrial;
        if(file) {
            const newFile = uploadImageToCloudinary(file, {folder: process.env.THUMBNAIL_FOLDER, resource: auto});//error might happen
            videoUrl = (await newFile).secure_url;
        }
        //updateData
        await SubSection.findByIdAndUpdate(subSectionId, {
            title: subSectionName,
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
        const {subSectionId, sectionId} = req.body;
        //delete sub section
        await SubSection.findByIdAndDelete(subSectionId);
        await Section.findByIdAndUpdate(sectionId, {
            $pull: {
                subSection: subSectionId,
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