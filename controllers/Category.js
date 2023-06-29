const Category = require("../models/Category");

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
            const selectedCategory = await Category.findById(categoryId)
                                            .populate("courses")
                                            .exec();
            //validation
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:'Data Not Found',
                });
            }
            //get coursesfor different categories
            const differentCategories = await Category.find({
                                         _id: {$ne: categoryId},
                                         })
                                         .populate("courses")
                                         .exec();

            //get top 10 selling courses
            //HW - write it on your own

            //return response
            return res.status(200).json({
                success:true,
                data: {
                    selectedCategory,
                    differentCategories,
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