const jwt = require("jsonwebtoken");
require("dotenv").config();

//auth
exports.auth = async (req, res, next) => {
    try {
        // console.log("I'm here");
        //extract token
        const token = req.cookies.token || localStorage.getItem("token") || 
                      req.body.token || req.header("Authorization").replace("Bearer ", "");
        console.log("from coikies: " + req.cookies.token);
        //check if token is available or not
        if(!token) {
            return res.status(400).json({
                success: false,
                message: "No coockie"
            })
        }
        //verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode)
            console.log(`Decoded information from cookie is: ${decode}`);
            req.user = decode;
        }
        catch(err) {
            return res.status(401).json({
                success: false,
                message: "Problem while verifing the token, /middlewares/auth"
            });
        }
        next();
    }
    catch(err) {
        return res.status(400).json({
            success: false,
            message: "Problem while cookie authentication, /middlewares/auth"
        })
    }
}

//Student route
exports.isStudent = async (req, res) => {
    try {
        if(req.user.role !== "student") {
            return res.status(400).json({
                success: false,
                message: "This routed is resticed for students"
            })
        }
        next();
    }
    catch{
        return res.status(402).json({
            success: false,
            message: "User role can not be verified"
        })
    }
}

//Educator route
exports.isEducator = async (req, res, next) => {
    try {
        if(req.user.role !== "educator") {
            return res.status(500).json({
                success: false,
                message: "This routed is resticed for educator"
            })
        }
        next();
    }
    catch{
        return res.status(402).json({
            success: false,
            message: "User role can not be verified, educator"
        })
    }
}

//Admin route
exports.isAdmin = async (req, res, next) => {
    try {
        console.log(req.user.role)
        if(req.user.role !== "admin") {
            return res.status(400).json({
                success: false,
                message: "This routed is resticed for admin"
            })
        }
        next()
    }
    catch(err){
        return res.status(402).json({
            success: false,
            message: "User role can not be verified, admin"
        })
    }
}
