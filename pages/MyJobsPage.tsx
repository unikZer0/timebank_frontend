import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { 
  getJobsByUser, 
  getJobApplications, 
  updateJobApplicationStatus
} from '../services/apiService';
import { formatTimeRange } from '../utils/timeUtils';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  UserGroupIcon, 
  MapPinIcon,
  EyeIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

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
  application_count: number;
}

interface JobApplication {
  id: number;
  user_id: number;
  status: string;
  applied_at: string;
  first_name: string;
  last_name: string;
  email: string;
  skills: string[];
  lat: number | null;
  lon: number | null;
  current_lat: number | null;
  current_lon: number | null;
}

const MyJobsPage: React.FC = () => {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobsByUser();
      
      if (response.success && response.jobs) {
        setJobs(response.jobs);
      }
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      showToast('Failed to load your jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId: number) => {
    try {
      const response = await getJobApplications(jobId);
      
      if (response.success && response.applications) {
        setApplications(response.applications);
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      showToast('Failed to load applications', 'error');
    }
  };

  const handleViewApplications = (job: Job) => {
    setSelectedJob(job);
    fetchJobApplications(job.id);
  };

  const handleUpdateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      setUpdating(applicationId);
      const response = await updateJobApplicationStatus(applicationId, status, currentUser?.id);
      
      if (response.success) {
        showToast(`Application ${status} successfully!`, 'success');
        // Refresh applications
        if (selectedJob) {
          fetchJobApplications(selectedJob.id);
        }
        // Refresh jobs to update application count
        fetchMyJobs();
      } else {
        showToast('Failed to update application status', 'error');
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      showToast(error?.data?.message || 'Failed to update application status', 'error');
    } finally {
      setUpdating(null);
    }
  };


  const getStatusBadge = (job: Job) => {
    if (job.application_count > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <UserGroupIcon className="w-3 h-3 mr-1" />
          {job.application_count} Applied
        </span>
      );
    } else if (job.broadcasted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Waiting for Applications
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Not Broadcasted
        </span>
      );
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'applied':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Applied
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Applied
          </span>
        );
      case 'complete':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckBadgeIcon className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto font-prompt p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-secondary-text mt-4">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-prompt p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text mb-2">My Jobs</h1>
        <p className="text-secondary-text">Manage your posted jobs and view applications</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-primary-text mb-2">No jobs posted yet</h3>
          <p className="text-secondary-text mb-4">Start by posting your first job request</p>
          <Link 
            to="/request-help"
            className="inline-block px-6 py-3 bg-accent text-white font-bold rounded-md hover:bg-accent-hover transition-colors"
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-surface border border-border-color rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-primary-text mb-2">{job.title}</h3>
                      <p className="text-secondary-text text-sm line-clamp-2">{job.description}</p>
                    </div>
                    {getStatusBadge(job)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-secondary-text">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{job.time_balance_hours} hours</span>
                    </div>
                    <div className="flex items-center text-secondary-text">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      <span>{job.application_count} applications</span>
                    </div>
                  </div>

                  {job.start_time && job.end_time && (
                    <div className="mb-4">
                      <div className="flex items-center text-accent text-sm">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{formatTimeRange(job.start_time, job.end_time)}</span>
                      </div>
                    </div>
                  )}

                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {job.required_skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-accent-light text-accent text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-secondary-text text-xs rounded-full">
                            +{job.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-text">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleViewApplications(job)}
                      className="px-3 py-1 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Applications
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications Panel */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <div className="bg-surface border border-border-color rounded-xl p-6 shadow-sm sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-text">Applications</h3>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-secondary-text hover:text-primary-text"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-primary-text mb-1">{selectedJob.title}</h4>
                  <p className="text-sm text-secondary-text">{applications.length} applications</p>
                </div>

                {applications.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {applications.map((application) => (
                      <div key={application.id} className="p-3 bg-background rounded-lg border border-border-color">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-primary-text text-sm">
                              {application.first_name} {application.last_name}
                            </h5>
                            <p className="text-xs text-secondary-text">{application.email}</p>
                          </div>
                          {getApplicationStatusBadge(application.status)}
                        </div>

                        {application.skills && application.skills.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {application.skills.slice(0, 2).map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-1 py-0.5 bg-accent-light text-accent text-xs rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                              {application.skills.length > 2 && (
                                <span className="px-1 py-0.5 bg-muted text-secondary-text text-xs rounded">
                                  +{application.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-secondary-text">
                            Applied {new Date(application.applied_at).toLocaleDateString()}
                          </span>
                          
                          {(application.status === 'pending' || application.status === 'applied' || application.status === 'accepted') && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleUpdateApplicationStatus(application.id, 'complete')}
                                disabled={updating === application.id}
                                className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {updating === application.id ? '...' : 'Mark Complete'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserGroupIcon className="w-12 h-12 text-secondary-text mx-auto mb-3" />
                    <p className="text-secondary-text text-sm">No applications yet</p>
                    <p className="text-xs text-secondary-text mt-1">
                      Applications will appear here when people apply
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface border border-border-color rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-primary-text mb-2">Job Applications</h3>
                <p className="text-secondary-text text-sm">
                  Select a job to view its applications and manage them.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;
