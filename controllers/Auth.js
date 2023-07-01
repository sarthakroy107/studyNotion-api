const User = require("../models/User");
const OTP = require("../models/OTP")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const mailSender = require("../utilis/mailSender");
require("dotenv").config();


//OPT generator
exports.generateOTP = async (req, res) => {
    try {
        //fetch email from body
        const {email} = req.body;
        //check if user already exists
        const checkUser = await User.findOne({email});
        console.log(checkUser)
        if(checkUser) {
            return res.status(500).json({
                success: false,
                message: "User already exits so OTP can't be sent."
            });
        }
        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        //Check if otp already exists
        let checkOTP = await OTP.findOne({otp: otp});
        while(checkOTP) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            })
            checkOTP = await OTP.findOne({otp: otp});
        }
        //Add to db
        const addOTPtoDB = await OTP.create({
            email, otp, 
        });
        console.log(otp)
        res.status(200).json({
            success: true,
            message: `OTP added to DB successfully. OTP: ${addOTPtoDB}`
        })
    }
    catch(err) {
        return res.status(405).json({
            success: false,
            message: "Something went wrong in generateOTP"
        });
    }
}

//Signup
exports.signup = async (req, res) => {
    try{
        //fetch data
        const {firstname, lastname, email, role, password, confirmPassword, otp} = req.body;

        //check both passwords are same
        if(password !== confirmPassword) {
            return res.status(501).json({
                success:false,
                message: "Password do not match"
            })
        }
        //check if user already exists
        const checkUser = await User.findOne({email});
        if(checkUser) {
            return res.status(500).json({
                success: false,
                meassage: "User already exists",
            });
        }
        //generate otp
        const mostRecentOTP = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log(`Most recent OTP saved in DB: ${mostRecentOTP}`);
        if(mostRecentOTP.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP.length === 0"
            })
        }
        else if(mostRecentOTP.otp !== otp) {
            console.log(mostRecentOTP.otp);
            return res.status(400).json({
                success: false,
                message: "Wrong OTP"
            });
        }
        console.log("OTP matched")
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        //save in db
        const profileDetails = await Profile.create({
            gender: "Male",
            dateOfBirth:null,
        });
        const createUser = User.create({
            firstname, 
            lastname,
            email, 
            role, 
            password: hashedPassword,
            profile: (await profileDetails._id),
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastname}`,
        });
        console.log(`User created successfully: ${createUser}`);

        res.status(200).json({
            success: true,
            message: "User created successfully!"
        })
    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "User creation failed."
        })
    }
}

//Login
exports.login = async (req, res) => {
    try {
        //fetch data from req body
        const {email, password} = req.body;

        //check if user does not exist
        const checkUser = await User.findOne({email});
        if(!checkUser) {
            return res.status(500).json({
                success: false,
                message: "User does not exists"
            });
        }
        //check password
        console.log(`Password from DB: ${checkUser.password}`)
        const checkPassword = await bcrypt.compare(password, checkUser.password);
        if(!checkPassword) {
            return res.status(500).json({
                success: false,
                message: "Passwords don't match"
            })
        }
        const payload = {
            email: checkUser.email,
            id: checkUser._id,
            role: checkUser.role,
            token: "",
        }
        //generate token
        const token = jwt.sign({ email: checkUser.email, id: checkUser._id, role: checkUser.role }, 
            "sarthak107", {
            expiresIn: "24h"
        });
        checkUser.token = token;
        checkUser.password = undefined;

        //create cookie and send response
        const options = {
            expires: new Date(Date.now() + 24*60*60*1000),
            httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            checkUser,
            meassage: "Logged in successfully"
        })
    }
    catch(err) {
        return res.status(500).json({
            success: false,
            message: "Login failed"
        })
    }
}

//Change Password
exports.changePassword = async (req, res) => {
    try {
        //fetch details
        const userId = req.user.id;
        const {email, password, confirmPassword} = req.body;
        if(password !== confirmPassword) {
            return res.status(500).json({
                success: false,
                message: "Please check two passwords"
            })
        }
        //check if user exists or not
        const userDetails = await User.findById({email: email});
        if(!userDetails) {
            return res.status(401).json({
                success: false,
                message: "User do not exist"
            })
        }
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);
        try {
            const emailResponse = await mailSender(updatedUserDetails.email, 
            `Password updated successfully for ${updatedUserDetails.firstname} ${updatedUserDetails.lastname}`)
            console.log("Email sent successfully:", emailResponse.response);
        }catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    }catch(err) {
        return res.status(402).json({
            success: false,
            message: `Error occured while changingg password, Error: ${err}`
        })
    }
}