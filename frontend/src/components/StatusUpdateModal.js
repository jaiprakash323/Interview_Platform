import React, { useState } from 'react';

const StatusUpdateModal = ({ interview, onClose, onUpdate }) => {
  const [status, setStatus] = useState(interview.status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(interview.id, status);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Update Interview Status</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Interview with {interview.candidate_name} & {interview.panelist_name}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="No Show">No Show</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={loading}>Update</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;