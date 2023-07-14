const { default: mongoose } = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utilis/mailSender");
const crypto = require("crypto");

//capture the payment and initiate the order
exports.capturePayment = async (req, res) => {
    const {courses} = req.body;
    const userId = req.user.id
    if(courses.length === 0) {
        return res.json({success:false, message:"Please provide Course Id"});
    }
    let totalAmount = 0;
    console.log(courses)
    for(const course_id of courses) {
        let course
        try{
            console.log(course_id)
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(200).json({success:false, message:"Could not find the course"});
            }
            console.log("UserOd: " + userId)
            const uid  = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({success:false, message:"Student is already Enrolled"});
            }
            console.log("After")
            totalAmount += course.price;
        }catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
        const currency = "INR";
        const options = {
            amount: totalAmount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
        }
        try{
            const paymentResponse = await instance.orders.create(options);
            res.status(200).json({
                success:true,
                message:paymentResponse,
            })
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, mesage:"Could not Initiate Order"});
        }
    }
}

//verify signature of Razorpay and server

exports.verifySignature = async (req, res) => {
    console.log("IN VERIFY SIGNATURE")
    const webhookSecret = "28052003";

    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", webhookSecret);//hashing algorithm
    shasum.update(JSON.stringify(req.body));//converts to string
    const digest = shasum.digest("hex");
    if(signature === digest) {
        console.log("Payment is authorized");

        const {courseId, userId} = req.body.payload.payment.entity.notes;
        console.log(req.body)
        console.log(courseId)
        console.log(userId)
        try {
            //find course and add student in course
            const enrolledCourse = await Course.findByIdAndUpdate(courseId, {
                $push: {
                    studentsEnrolled: userId,
                }
            }, {new: true});
            console.log(enrolledCourse)
            if(!enrolledCourse) {
                return res.status(402).status({
                    success: false,
                    message: "Course not found /controllers/Payment"
                })
            }
            //add course to student model
            const enrolledStudents = await User.findByIdAndUpdate(userId, {
                $push: {
                    courses: courseId,
                }
            }, {new: true});

            console.log(enrolledStudents); 
            try {
                const emailResponse = await mailSender(enrolledStudents.email,
                    "Congratulations from Sarthak", "Congratulations, you are onboarded into new CodeHelp Course");
            }catch(err) {
                return res.status(401).json({
                    success: false,
                    messaage: "Problem in sending mail in verifySignature"
                })
            }
            console.log("Successful verification")
            return res.status(200).json({
                success: true,
                messaage: "Signature verified and student enrolled in course!"
            })
        }
        catch(err) {
            return res.status(500).json({
                success: false,
                messaage: "Something went wrong in verifySignature /controllers/Payment"
            })
        }
    }
    else {
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }
}
