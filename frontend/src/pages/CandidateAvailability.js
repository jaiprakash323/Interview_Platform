import React, { useState } from 'react';
import { createCandidateAvailability } from '../services/api';

const CandidateAvailability = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    slots: [{
      start_datetime: '',
      end_datetime: '',
      preferred_type: ''
    }]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddSlot = () => {
    setFormData({
      ...formData,
      slots: [...formData.slots, {
        start_datetime: '',
        end_datetime: '',
        preferred_type: ''
      }]
    });
  };

  const handleRemoveSlot = (index) => {
    const newSlots = formData.slots.filter((_, i) => i !== index);
    setFormData({ ...formData, slots: newSlots });
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...formData.slots];
    newSlots[index][field] = value;
    setFormData({ ...formData, slots: newSlots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await createCandidateAvailability(formData);
      setMessage({ type: 'success', text: 'Availability added successfully!' });
      setFormData({
        name: '',
        email: '',
        slots: [{
          start_datetime: '',
          end_datetime: '',
          preferred_type: ''
        }]
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add availability' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Candidate Availability</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <h3>Availability Slots</h3>
          {formData.slots.map((slot, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={slot.start_datetime}
                  onChange={(e) => handleSlotChange(index, 'start_datetime', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={slot.end_datetime}
                  onChange={(e) => handleSlotChange(index, 'end_datetime', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preferred Interview Type (Optional)</label>
                <input
                  type="text"
                  value={slot.preferred_type}
                  onChange={(e) => handleSlotChange(index, 'preferred_type', e.target.value)}
                  placeholder="e.g., Technical, HR"
                />
              </div>
              {formData.slots.length > 1 && (
                <button type="button" onClick={() => handleRemoveSlot(index)} style={{ backgroundColor: '#e74c3c' }}>
                  Remove Slot
                </button>
              )}
            </div>
          ))}
          
          <button type="button" onClick={handleAddSlot} style={{ marginRight: '1rem', backgroundColor: '#27ae60' }}>
            Add Another Slot
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Availability'}
          </button>
        </form>
        
        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginTop: '1rem' }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateAvailability;