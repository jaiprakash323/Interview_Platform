# Interview_Platform

A full-stack application for managing interview scheduling, panelist and candidate availability, matching common slots, and tracking interview statuses.
![image alt](https://github.com/jaiprakash323/Interview_Dashboard/blob/9b6be9e2a41b77ba98c04f51d8b2b4fdeee786e8/Screenshot%20(69).png)
## Features

- **Panelist Availability**: Panelists can submit their available time slots with interview type and daily limits
- **Candidate Availability**: Candidates can submit their preferred time slots
- **Smart Matching**: Automatically finds common available slots between panelists and candidates
- **Interview Scheduling**: Schedule interviews with automatic meeting link generation
- **Conflict Prevention**: Prevents double-booking for both panelists and candidates
- **Status Tracking**: Track interviews as Scheduled, Completed, No Show, Rescheduled, or Cancelled
- **Search & Filter**: Filter interviews by date, status, panelist, candidate, and round
- **Pagination**: Efficient pagination for large datasets

## Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js + Express
- **Database**: SQLite
- **HTTP Client**: Axios

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
  
### Frontend Setup
cd frontend
npm install
npm start
### Backend Setup

```bash
cd backend
npm install
npm start
