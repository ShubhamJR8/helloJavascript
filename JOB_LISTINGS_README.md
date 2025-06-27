# Job Listings Feature

## Overview
The job listings feature allows users to browse and search for JavaScript-related job opportunities. Jobs are managed by administrators only.

## Features

### For Users:
- **Browse Jobs**: View all available job listings
- **Search & Filter**: Search by job title, company, or description
- **Filter Options**: 
  - Location (All Locations, Remote, Major cities)
  - Experience Level (Entry, 2-5 years, 5+ years, 10+ years)
  - Job Type (Full-time, Part-time, Contract, Freelance, Internship)
- **Job Details**: Click "Details" to view full job information
- **Apply**: Click "Apply Now" to go to the external job application link
- **Share**: Share job listings via browser share API

### For Administrators:
- **Add Jobs**: Create new job listings via admin interface
- **Edit Jobs**: Modify existing job information
- **Delete Jobs**: Remove job listings
- **Manage Status**: Set jobs as active or inactive

## Setup Instructions

### 1. Seed Sample Data
To add sample jobs to the database:
```bash
cd backend
npm run seed:jobs
```

### 2. Access Admin Interface
Navigate to `/admin-job-manager` to manage jobs (requires authentication).

### 3. User Access
Users can access job listings at `/job-listings`.

## Job Data Structure

Each job includes:
- **title**: Job title
- **company**: Company name
- **location**: Job location
- **experience**: Experience level required
- **salary**: Salary range or rate
- **jobType**: Type of employment
- **description**: Detailed job description
- **skills**: Array of required skills
- **applyLink**: External application URL
- **status**: active/inactive/draft
- **uploadDate**: When the job was posted

## API Endpoints

### Public Endpoints:
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get specific job details

### Protected Endpoints (Admin Only):
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/user/jobs` - Get jobs posted by user

## Usage Examples

### Adding a Job via Admin Interface:
1. Navigate to `/admin-job-manager`
2. Click "Add New Job"
3. Fill in all required fields
4. Click "Add Job"

### Filtering Jobs:
1. Go to `/job-listings`
2. Use the filter options at the top
3. Jobs will update automatically based on your criteria

### Applying to a Job:
1. Browse jobs at `/job-listings`
2. Click "Details" to view full information
3. Click "Apply Now" to go to the external application

## Notes
- Jobs are only visible if their status is "active"
- External links open in new tabs
- All job management requires authentication
- The feature is designed for admin-only job creation 