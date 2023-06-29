const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect("mongodb+srv://sarthakroy2003:JeARNLB0S5vQrx0w@cluster0.sgimdgj.mongodb.net/studyNotion", {
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("DB connected"))
    .catch((err)=>{
        console.log("Error occured while connectiong to DB");
        console.log(`Error: ${err}`);
    })
}