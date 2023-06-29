const User = require("../models/User");
const mailSender = require("../utilis/mailSender")
const bcrypt = require("bcrypt");
const crypto = require('crypto');

//reset password token
exports.resetPasswordToken = async (req, res) => {
    try {

        //fetch email from body
        const {email} = req.body;

        //check whether user exits or not
        const checkUser = await User.findOne({email});
        if(!checkUser) {
            return res.status(402).json({
                success: false,
                message: "User does not exist."
            });
        }

        //generate token
        const token = await crypto.randomUUID();
        console.log(`Token generated ${token}`)
        //create url for reseting password
        const url = `http://localhost:3000/reset-password/${token}`;

        //insert token in db
        const userId = await User.findOne({email: email});
        await User.findByIdAndUpdate(userId, {
            token: token,
            resetPasswordVaildTime: Date.now() + 15*60*1000,

        }, {new: true})
        console.log("Toekn inserted in DB")
        //send mail
        try{
            const info = await mailSender(email, "Password reset link", `Click in this link to reset password: ${url}`)
            console.log(info)
        }
        catch(err) {
            return res.status(500).json({
                success: false,
                message: "Failed sendiing password reset link"
            });
        }

        res.status(200).json({
            success: true,
            message: "Password resend mail send successfully"
        })
    }
    catch(err) {

        return res.status(500).json({
            success: false,
            message: "Problem in sendPasswordresetLink"
        })
    }
}

//reset password
exports.resetPassword = async (req, res) => {
    try {
        //fetch email from body
        const {email, password1, password2, token} = req.body;
        //search for the user
        const user = User.findOne({email});
        if(!user) {
            return res.status(402).json({
                success: false,
                message: "User does not exists"
            });
        }
        //check if password match
        if(password1 !== password2) {
            return res.status(500).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        //verify with token
        const userDetails = await User.findOne({token});
        
        //check if token is there or not
        if(!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found."
            });
        }
        //
        if(userDetails.resetPasswordVaildTime > Date.now()) {
            return res.json({
                success:false,
                message:'Token is expired, please regenerate your token',
            });
        }
        const newPassword = await bcrypt.hash(password1, 10);
        await User.findByIdAndUpdate(userDetails._id, {password: newPassword})
        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    }
    catch(err) {
        return res.status(401).json({
            success: false,
            message: "Failed changing password"
        })
    }
}