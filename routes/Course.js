const express = require("express");
const router = express.Router();

//Import Controllers

//Course controllers
const {getCourseDetails, getAllCourses, showAllCourrses, createCourse, publishCourse, getMyCourses} = 
require("../controllers/Course");

//Section controllers
const {createSection, updateSection, deleteSection, getSections} = require("../controllers/Section");

//Categories controller
const {createCategory, showAllCategories, categoryPageDetails} = require("../controllers/Category");

//Subsection controllers
const {createSubSection, updateSubSection, deleteSubSection} = require("../controllers/SubSection");

//Rating controllers
const {createRatingAndReview, getAverageRating, getAllRating} = require(("../controllers/RatingAndReview"));

//Importing middlewares
const {auth, isStudent, isAdmin, isEducator} =  require("../middlewares/auth");


// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isEducator, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isEducator, createSection)
// Update a Section
router.post("/updateSection", auth, isEducator, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isEducator, deleteSection)
//publish course
router.post("/publishCourse", auth, isEducator, publishCourse)
// Edit Sub Section
router.post("/updateSubSection", auth, isEducator, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isEducator, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isEducator, createSubSection)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
//get section names
router.put("/getSections", getSections)
//get my courses
router.put("/getMyCourses", auth, isEducator, getMyCourses)


// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)


// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRatingAndReview)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router