const { default: mongoose } = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utilis/mailSender")

//capture the payment and initiate the order
exports.capturePayment = async (req, res) => {
    try {
        //get course details
        const {courseId} = req.body;
        const userId = req.user.id;
        //validate courseId
        if(!courseId) {
            return res.status(404).json({
                success: false,
                message: "Course id not present."
            })
        }
        let course;
        try {
            //check if course exist or not
            course = await Course.findById(courseId);
            if(!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course id does not match."
                });
            }
            //Check if user already enrolled in this course
            const uid = new mongoose.Types.ObjectId(user);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success: false,
                    message: "User is alreay enrolled in the course."
                })
            }
        }
        catch(err) {
            return res.status(402).json({
                success: false,
                message: "Something went wrong while fetching student ans course details in, /controllers/payment"
            })
        }
        //order create
        const amount = course.price;
            const currency = "INR";
        
        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes:{
                courseId: courseId,
                userId,
            }
        };
        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            //return response
            return res.status(200).json({
                success:true,
                courseName: course.coursename,
                courseDescription: course.coursedescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });
        }
        catch(error) {
            console.log(error);
            res.json({
                success:false,
                message:"Could not initiate order",
            });
        }
    }
    catch(err) {
        return res.status(403).json({
            success: false,
            message: "Something went wrong in Payment try."
        })
    }
}

//verify signature of Razorpay and server

exports.verifySignature = async (req, res) => {
    const webhookSecret = "28052003";

    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", webhookSecret);//hashing algorithm
    shasum.update(JSON.stringify(req.body));//converts to string
    const digest = shasum.diges("hex");
    if(signature === digest) {
        console.log("Payment is authorized");

        const {courseId, userId} = req.body.payload.payment.entity.notes;
        
        try {
            //find course and add student in course
            const enrolledCourse = await Course.findByIdAndUpdate(courseId, {
                $push: {
                    studentsEnrolled: userId,
                }
            }, {new: true});
            if(!enrolledStudents) {
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
            return res.status(200).json({
                success: true,
                messaage: "Signature varified and student enrolled in course!"
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
