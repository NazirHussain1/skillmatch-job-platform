/**
 * Data Transfer Objects for Application
 */

export class ApplicationResponseDTO {
  constructor(application) {
    this._id = application._id;
    this.jobId = application.jobId;
    this.userId = application.userId;
    this.jobTitle = application.jobTitle;
    this.companyName = application.companyName;
    this.status = application.status;
    this.matchScore = application.matchScore;
    this.appliedAt = application.appliedAt;
    this.createdAt = application.createdAt;
    this.updatedAt = application.updatedAt;
  }
}

export class CreateApplicationDTO {
  constructor(data, userId) {
    this.jobId = data.jobId;
    this.userId = userId;
    this.jobTitle = data.jobTitle;
    this.companyName = data.companyName;
    this.matchScore = data.matchScore;
    this.status = 'Pending';
  }
}
