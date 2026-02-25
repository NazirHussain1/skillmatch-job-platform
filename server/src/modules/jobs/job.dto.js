/**
 * Data Transfer Objects for Job
 */

export class JobResponseDTO {
  constructor(job) {
    this._id = job._id;
    this.title = job.title;
    this.employerId = job.employerId;
    this.companyName = job.companyName;
    this.location = job.location;
    this.salary = job.salary;
    this.type = job.type;
    this.description = job.description;
    this.requiredSkills = job.requiredSkills || [];
    this.postedAt = job.postedAt;
    this.isActive = job.isActive;
    this.createdAt = job.createdAt;
    this.updatedAt = job.updatedAt;
  }
}

export class CreateJobDTO {
  constructor(data, employerId) {
    this.title = data.title;
    this.employerId = employerId;
    this.companyName = data.companyName;
    this.location = data.location;
    this.salary = data.salary;
    this.type = data.type;
    this.description = data.description;
    this.requiredSkills = data.requiredSkills;
  }
}

export class UpdateJobDTO {
  constructor(data) {
    if (data.title) this.title = data.title;
    if (data.companyName) this.companyName = data.companyName;
    if (data.location) this.location = data.location;
    if (data.salary) this.salary = data.salary;
    if (data.type) this.type = data.type;
    if (data.description) this.description = data.description;
    if (data.requiredSkills) this.requiredSkills = data.requiredSkills;
    if (data.isActive !== undefined) this.isActive = data.isActive;
  }
}
