import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/solid';
import { getJobs } from '../services/apiService';
import { formatTimeRange } from '../utils/timeUtils';
import { useToast } from '../context/ToastContext';

interface Job {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  location_lat: number | null;
  location_lon: number | null;
  time_balance_hours: number;
  start_time: string | null;
  end_time: string | null;
  broadcasted: boolean;
  created_at: string;
  creator_user_id: number;
  creator_first_name: string;
  creator_last_name: string;
  creator_email: string;
}

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJobs();
      
      if (response.success) {
        setJobs(response.jobs || []);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err?.data?.message || 'Failed to fetch jobs');
      showToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto font-prompt p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-secondary-text mt-4">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto font-prompt p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchJobs}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-prompt p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text mb-2">Available Jobs</h1>
        <p className="text-secondary-text">Find opportunities to help others and earn time credits</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">

          <h3 className="text-xl font-semibold text-primary-text mb-2">No jobs available</h3>
          <p className="text-secondary-text">Check back later for new opportunities!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-surface border border-border-color rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-primary-text mb-2">{job.title}</h3>
                <p className="text-secondary-text text-sm line-clamp-3">{job.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-secondary-text">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>{job.time_balance_hours} hours</span>
                </div>
                
                {job.start_time && job.end_time && (
                  <div className="flex items-center text-sm text-accent">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>{formatTimeRange(job.start_time, job.end_time)}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-secondary-text">
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span>{job.creator_first_name} {job.creator_last_name}</span>
                </div>
              </div>

              {job.required_skills && job.required_skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-accent-light text-accent text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary-text">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
                <Link 
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
