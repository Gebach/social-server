export default class UserDto {
  id
  email
  isActivated

  constructor(user) {
    this.id = user.id
    this.email = user.email
    this.isActivated = user.isActivated
  }
}
