import nodemailer from 'nodemailer'

const transpoter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "97596bb632ad25",
        pass: "9ee82f7423d841"
    }
})

export default transpoter