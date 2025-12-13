import 'dotenv/config'
import nodemailer from 'nodemailer'
import userModel from '../models/userModel.js'
import ApiError from '../exceptions/apiError.js'

class emailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  async verifyProfile(userID) {
    const user = await userModel.findById(userID)

    if (!user) {
      throw ApiError.UnauthorizedError()
    }

    const info = await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Verify your profile!',
      html: `<p>To verify your account follow the link: <a href="${process.env.ORIGIN_URL}/api/verify/${user.activationLink}" target="_blank"><b>VERIFY MY ACCOUNT</b></a></p>`,
    })
    console.log(info)

    return info
  }
}

export default new emailService()
