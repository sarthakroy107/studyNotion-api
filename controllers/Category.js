const Category = require("../models/Category");
const Course = require("../models/Course");

//createCategory
exports.createCategory = async (req, res) => {

    try {
        //fetch details
        const {name, description} = req.body;
        //check if Category alreay exists

        const findCategory = await Category.findOne({name: name});
        if(findCategory) {
            return res.status(401).json({
                success: false,
                message: "Category already exists"
            })
        }
        //create entry to db
        const newCategory = await Category.create({
            name, description
        });
        console.log(newCategory);
        res.status(200).json({
            success: true,
            message: "Category created"
        })
    }
    catch(err) {
        return res.status(400).json({
            success: false,
            message: "Failed creating Category"
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
            //get categoryId
            const {categoryId} = req.body;
            //get courses for specified categoryId
            // const selectedCategory = await Category.findById(categoryId)
            //                                 .populate("course")
            //                                 .exec();

            // const topCourses = await Category.findById(categoryId).limit(3).populate("course").sort({ numberOfStudents: -1}).exec();
            // const newCourses = await Category.findById(categoryId).limit(3).populate("course").sort({createdAt: -1}).exec();

            const topCourses = await Course.find({category: categoryId, published: true}).sort({numberOfStudents: -1}).limit(10)
            const newCourses = await Course.find({category: categoryId, published: true}).sort({createdAt: -1}).limit(10)
            const avgRatings = await Course.aggregate([
                {
                    $match:{
                        category: categoryId,
                        published: true,
                    },
                },
                {
                    $unwind: "$ratingAndReviews",
                },
                {
                    $group: {
                        _id: "$_id",
                        avgRatings: {$avg: "$ratingAndReviews.rating"}
                    }
                }
            ])
            const avgRatingsMap = new Map(avgRatings.map((course) => [course._id.toString(), course.avgRating]));
            const topCoursesWithAvgRating = topCourses.map((course) => ({
                ...course.toObject(),
                avgRating: avgRatingsMap.get(course._id.toString()) || 0, // Set avgRating to 0 if not found in the map
              }));
              const newCoursesWithAvgRating = newCourses.map((course) => ({
                ...course.toObject(),
                avgRating: avgRatingsMap.get(course._id.toString()) || 0, // Set avgRating to 0 if not found in the map
              }));
            if(!topCourses) {
                return res.status(404).json({
                    success:false,
                    message:'Top courses data Not Found',
                });
            }
            //get coursesfor different categories
            // const differentCategories = await Category.find({
            //                              _id: {$ne: categoryId},
            //                              })
            //                              .populate("course")
            //                              .exec();

            //get top 10 selling courses
            //HW - write it on your own

            //return response
            return res.status(200).json({
                success:true,
                data: {
                    topCourses: topCoursesWithAvgRating,
                    newCourses: newCoursesWithAvgRating
                },
            });

    }
    catch(error ) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

//showAllCategorys
exports.showAllCategories = async (req, res) => {
    
    try {
        const allCategorys = await Category.find({}, {name:true});
        res.status(200).json({
            success: true,
            message: "Categorys found",
            data: allCategorys
        })
    }
    catch(err) {
        return res.status(402).json({
            success: false,
            message: "Failed to fetch All Categorys /controller/Category"
        })
    }
    
}