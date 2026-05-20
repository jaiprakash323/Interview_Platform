import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">Matching Slots</Link>
      <Link to="/panelist">Panelist Availability</Link>
      <Link to="/candidate">Candidate Availability</Link>
      <Link to="/schedule">Schedule Interview</Link>
      <Link to="/interviews">Upcoming Interviews</Link>
    </nav>
  );
};

export default Navbar;