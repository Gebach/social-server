import { model, Schema } from 'mongoose'

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  picture: { type: String },
  isActivated: { type: Boolean, required: true, default: false },
  activationLink: { type: String },
  friendsRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendsToAccept: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

export default model('User', userSchema)
