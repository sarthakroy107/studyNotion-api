const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect = () => {
	try {
		cloudinary.config({
			//!    ########   Configuring the Cloudinary to Upload MEDIA ########
			cloud_name: "dx2nblvo7",
			api_key: 312286655566758,
			api_secret: "j5PglPDW6YdJzmPDuJfyAUlcmb8",
		});
        console.log("Cloudinary connected");
	} catch (error) {
		console.log(error);
	}
};