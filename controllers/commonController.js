const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");

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

async function sendMailWithAttachment(to,html,subject,attachment) {
	try {
		
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
				html: html, // html body
				attachments: [{
					path: attachment,
					encoding: 'utf8'
				}]
		});
		if(info){
			return 1
		}else{
			console.log(info.error)
			return 0
		}
	} catch (error) {
		console.log(error)
	}
}

async function createPDF(data){
	try {
		console.log(data)
		// return
		var templateHtml = fs.readFileSync(path.join(process.cwd(), 'assets/PdfTemplate/template.html'), 'utf8');
		var template = handlebars.compile(templateHtml);
		var html = template(data);
	
		// var milis = new Date();
		// milis = milis.getTime();
	
		var pdfPath = path.join('assets/PdfTemplate/pdf', `${data.name}-${data.milis}.pdf`);
	
		var options = {
			width: '1230px',
			headerTemplate: "<p></p>",
			footerTemplate: "<p></p>",
			displayHeaderFooter: false,
			margin: {
				top: "10px",
				bottom: "30px"
			},
			printBackground: true,
			path: pdfPath
		}
	
		const browser = await puppeteer.launch({
			args: ['--no-sandbox'],
			headless: true
		});
	
		var page = await browser.newPage();
		
		await page.goto(`data:text/html;charset=UTF-8,${html}`, {
			waitUntil: 'networkidle0'
		});
	
		let info = await page.pdf(options);

		if(info){
			return 1
		}else{
			console.log(info.error)
			return 0
		}

		// await browser.close();
	} catch (error) {
		console.log(error)
	}
}

exports.sendMail= sendMail
exports.sendMailWithAttachment= sendMailWithAttachment
exports.createPDF= createPDF
