const Section = require("../models/Section");
const Course = require("../models/Course");

//section creation
exports.createSection = async (req, res) => {
    //fetch data
    try {
        const {sectionName, courseId} = req.body;
        console.log(sectionName);
        console.log(courseId)
        const newSection = await Section.create({sectionName});
        await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseSection: newSection
            }
        }, {new: true});
        return res.status(200).json({
            success: true,
            message: "Section created",
            data: newSection,
        })
    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "Section creation failed"

        });
    }

}

//Update section
exports.updateSection = async (req, res) => {
    try {
        const {sectionName, sectionId}  = req.body;
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        return res.status(200).json({
            success: true,
            message: "Section updated.",
            data: updatedSection
        });
    }
    catch {
        return res.status(402).json({
            success: false,
            message: "Section updation failed"
        });
    }
}
//delete section
exports.deleteSection = async (req, res) => {
    try {
        //fetch section data
        const {sectionId, courseId} = req.body;
        console.log(sectionId)
        console.log(courseId)
        //delete section
        await Section.findByIdAndDelete(sectionId);
        await Course.findByIdAndUpdate(courseId, {
            $pull: {coursesection: sectionId},
        }, {new: true})
        console.log("Here")

        return res.status(200).json({
            success: true,
            message: "Section deleted succesfully"
        });
    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "Section deletation failed."
        })
    }
}

//get Section details of a course
exports.getSections = async (req, res) => {
    try{
        
        const {courseId} = req.body;

        const response = await Course.findById(courseId).populate({
            path: "courseSection",
            populate: {
                path: "subSection",
                model: "SubSection"
            }
        }).exec();
        
        return res.status(200).json({
            success: true,
            message: "Section details fetched",
            data: response
        })
    }
    catch(err) {
        return res.status(401).json({
            success:false,
            message: "Section details fetching failed"
        })
    }
}