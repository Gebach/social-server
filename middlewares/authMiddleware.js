import 'dotenv/config'
import jwt from 'jsonwebtoken'

export default function (err, req, res, next) {
  console.log(err)
  try {
    const authHeader = req.headers.Authorization
    if (!authHeader) return res.status(401).json({ message: 'Нет авторизации' })

    const token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Нет токена' })

    const userData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN)
    req.user = userData
  } catch (err) {
    return res.status(401).json({ message: 'токен невалиден' })
  }
}
