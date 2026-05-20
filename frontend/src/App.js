import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PanelistAvailability from './pages/PanelistAvailability';
import CandidateAvailability from './pages/CandidateAvailability';
import MatchingSlots from './pages/MatchingSlots';
import InterviewScheduler from './pages/InterviewScheduler';
import UpcomingInterviews from './pages/UpcomingInterviews';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<MatchingSlots />} />
            <Route path="/panelist" element={<PanelistAvailability />} />
            <Route path="/candidate" element={<CandidateAvailability />} />
            <Route path="/matches" element={<MatchingSlots />} />
            <Route path="/schedule" element={<InterviewScheduler />} />
            <Route path="/interviews" element={<UpcomingInterviews />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;