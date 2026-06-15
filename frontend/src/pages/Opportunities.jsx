import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import OpportunityCard from '../components/OpportunityCard';

export default function Opportunities({ studentId }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());

  const [filters, setFilters] = useState({
    category: '',
    direction: '',
    format: '',
    grade_level: '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  useEffect(() => {
    if (studentId) {
      fetchSavedOpportunities();
    }
  }, [studentId]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities(filters);
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedOpportunities = async () => {
    try {
      const data = await api.getSavedOpportunities(studentId);
      const savedIds = new Set(data.map(item => item.opportunity.id));
      setSaved(savedIds);
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
    }
  };

  const handleSave = async (opportunityId) => {
    if (!studentId) {
      alert('Please login first');
      return;
    }

    try {
      if (saved.has(opportunityId)) {
        await api.unsaveOpportunity(opportunityId, studentId);
        setSaved(prev => {
          const newSet = new Set(prev);
          newSet.delete(opportunityId);
          return newSet;
        });
      } else {
        await api.saveOpportunity(opportunityId, studentId);
        setSaved(prev => new Set([...prev, opportunityId]));
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const categories = ['олимпиада', 'стажировка', 'хакатон', 'конкурс', 'стипендия', 'программа', 'конференция'];
  const directions = ['STEM', 'Business', 'Finance', 'Programming', 'Science', 'Social Impact'];
  const formats = ['online', 'offline', 'hybrid'];
  const grades = ['8-9', '9-11', '10-11', '8-11'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-12">Education Opportunities</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { key: 'category', label: 'Category', options: categories },
          { key: 'direction', label: 'Direction', options: directions },
          { key: 'format', label: 'Format', options: formats },
          { key: 'grade_level', label: 'Grade Level', options: grades },
        ].map(({ key, label, options }) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{label}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading opportunities...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No opportunities found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opportunity => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onSave={() => handleSave(opportunity.id)}
              saved={saved.has(opportunity.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
