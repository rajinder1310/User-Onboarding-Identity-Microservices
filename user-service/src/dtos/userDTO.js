class UserDTO {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.is_verified = user.is_verified;
    this.created_at = user.created_at;
  }
}

module.exports = UserDTO;
