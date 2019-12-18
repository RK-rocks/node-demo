const nodemailer = require("nodemailer");

async function sendMail(to,html,subject) {
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		requireTLS: true,
		auth: {
			user: 'rajkamdiya2@gmail.com', // generated ethereal user
			pass: '9428575328'
		}
	});
		
	transporter.verify(function(error, success) {
		if (error) {
			console.log(error);
		} else {
			console.log("Server is ready to take our messages");
		}
	});
	//send mail with defined transport object
	let info = await transporter.sendMail({
			from: 'dexterapp@gmail.com', // sender address
			to: to, // list of receivers
			subject: subject, // Subject line
			html: html // html body
	});
	if(info){
		return 1
	}else{
		console.log("kinklnlknkljnkl")
		return 0
	}
}

exports.sendMail= sendMail
