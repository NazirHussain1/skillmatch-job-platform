/**
 * Data Transfer Objects for User
 */

export class UserResponseDTO {
  constructor(user) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.avatar = user.avatar;
    this.skills = user.skills || [];
    this.bio = user.bio || '';
    this.companyName = user.companyName || '';
    this.createdAt = user.createdAt;
  }
}

export class UserWithTokenDTO extends UserResponseDTO {
  constructor(user, token) {
    super(user);
    this.token = token;
  }
}

export class UpdateProfileDTO {
  constructor(data) {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.bio !== undefined) this.bio = data.bio;
    if (data.skills !== undefined) this.skills = data.skills;
    if (data.avatar) this.avatar = data.avatar;
    if (data.companyName) this.companyName = data.companyName;
    if (data.password) this.password = data.password;
  }
}
