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
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon
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
  has_complete_application: boolean;
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
  const [acceptedByJobId, setAcceptedByJobId] = useState<Record<number, boolean>>({});
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const jobsPerPage = 5;

  useEffect(() => {
    fetchMyJobs();
  }, []);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.required_skills.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Get jobs for current page
  const getDisplayedJobs = () => {
    if (showAll) {
      return filteredJobs;
    }
    return filteredJobs.slice(0, currentPage * jobsPerPage);
  };

  const displayedJobs = getDisplayedJobs();
  const hasMoreJobs = filteredJobs.length > displayedJobs.length;

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobsByUser();
      
      if (response.success && response.jobs) {
        setJobs(response.jobs);

        // Precompute whether each job has an accepted application
        const jobsNeedingCheck = response.jobs.filter((j: Job) => j.application_count > 0 && !j.has_complete_application);
        if (jobsNeedingCheck.length > 0) {
          const results = await Promise.allSettled(
            jobsNeedingCheck.map(async (j: Job) => {
              try {
                const appsRes = await getJobApplications(j.id);
                if (appsRes.success && appsRes.applications) {
                  const hasAccepted = appsRes.applications.some((a: JobApplication) => a.status === 'accepted');
                  return { jobId: j.id, hasAccepted };
                }
              } catch (_) { /* noop */ }
              return { jobId: j.id, hasAccepted: false };
            })
          );
          const nextMap: Record<number, boolean> = {};
          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
              nextMap[r.value.jobId] = r.value.hasAccepted;
            }
          });
          setAcceptedByJobId(prev => ({ ...prev, ...nextMap }));
        }
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
    if (job.has_complete_application) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          เสร็จแล้ว
        </span>
      );
    } else if (acceptedByJobId[job.id]) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <CheckBadgeIcon className="w-3 h-3 mr-1" />
          รับแล้ว
        </span>
      );
    } else if (job.application_count > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <UserGroupIcon className="w-3 h-3 mr-1" />
          {job.application_count} จับคู่แล้ว
        </span>
      );
    } else if (job.broadcasted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          รอการสมัคร
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          ยังไม่ได้เผยแพร่
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
            สมัครแล้ว
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            รับแล้ว
          </span>
        );
      case 'complete':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckBadgeIcon className="w-3 h-3 mr-1" />
            เสร็จสิ้น
          </span>
        );
      case 'matched':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            จับคู่แล้ว
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
        <h1 className="text-3xl font-bold text-primary-text mb-2">งานของฉัน</h1>
        <p className="text-secondary-text mb-4">จัดการงานที่โพสต์และดูการสมัค</p>
        
        {/* Search Input */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ค้นหางานตามชื่อ คำอธิบาย หรือทักษะ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
          />
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-primary-text mb-2">ยังไม่ได้โพสต์งาน</h3>
          <p className="text-secondary-text mb-4">เริ่มต้นด้วยการโพสต์งานแรกของคุณ</p>
          <Link 
            to="/request-help"
            className="inline-block px-6 py-3 bg-accent text-white font-bold rounded-md hover:bg-accent-hover transition-colors"
          >
            โพสต์งาน
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
              {displayedJobs.map((job) => (
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
                      <span>{job.time_balance_hours} ชั่วโมง</span>
                    </div>
                    <div className="flex items-center text-secondary-text">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      <span>{job.application_count} ครั้ง</span>
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
  <span key={typeof skill === 'object' ? skill.id : index} className="px-2 py-1 bg-accent-light text-accent text-xs rounded-full">
    {typeof skill === 'string' ? skill : skill.name}
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
                      โพสต์เมื่อ {new Date(job.created_at).toLocaleDateString('th-TH')}
                    </span>
                    <button
                      onClick={() => handleViewApplications(job)}
                      className="px-3 py-1 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      ดูการสมัค
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMoreJobs && !showAll && (
                <div className="text-center py-4">
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="inline-flex items-center px-4 py-2 bg-accent text-white font-medium rounded-md hover:bg-accent-hover transition-colors"
                  >
                    <ChevronDownIcon className="w-4 h-4 mr-2" />
                    โหลดงานเพิ่ม
                  </button>
                  <p className="text-sm text-secondary-text mt-2">
                    แสดง {displayedJobs.length} จาก {filteredJobs.length} งาน
                  </p>
                </div>
              )}
              
              {/* Show All Button */}
              {hasMoreJobs && !showAll && (
                <div className="text-center py-2">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-accent hover:text-accent-hover font-medium text-sm"
                  >
                    แสดงงานทั้งหมด
                  </button>
                </div>
              )}
              
              {/* Search Results Info */}
              {searchTerm && (
                <div className="text-center py-4">
                  <p className="text-sm text-secondary-text">
                    {filteredJobs.length === 0 
                      ? 'ไม่พบงานที่ตรงกับการค้นหา'
                      : `พบ ${filteredJobs.length} งานที่ตรงกับ "${searchTerm}"`}
                  </p>
                </div>
              )}
        </div>
      )}

      {/* Applications Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border-color rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-color">
              <div>
                <h3 className="text-lg font-semibold text-primary-text">ครั้ง</h3>
                <p className="text-sm text-secondary-text">{selectedJob.title} • {applications.length} ครั้ง</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-secondary-text hover:text-primary-text p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="p-4 bg-background rounded-lg border border-border-color">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-primary-text">
                            {application.first_name} {application.last_name}
                          </h5>
                          <p className="text-sm text-secondary-text">{application.email}</p>
                        </div>
                        {getApplicationStatusBadge(application.status)}
                      </div>

                      {application.skills && application.skills.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {application.skills.map((skill, index) => (
  <span
    key={typeof skill === 'object' ? skill.id : index}
    className="px-2 py-1 bg-accent-light text-accent text-xs rounded-full"
  >
    {typeof skill === 'string' ? skill : skill.name}
  </span>
))}
                            {application.skills.length > 3 && (
                              <span className="px-2 py-1 bg-muted text-secondary-text text-xs rounded-full">
                                +{application.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-text">
                          สมัครเมื่อ {new Date(application.applied_at).toLocaleDateString('th-TH')}
                        </span>
                        
                        <div className="flex space-x-2">
                          {application.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.id, 'complete')}
                              disabled={updating === application.id}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                            >
                              <CheckBadgeIcon className="w-4 h-4 mr-2" />
                              {updating === application.id ? 'กำลังอัปเดต...' : 'ทำเสร็จสิ้น'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="w-16 h-16 text-secondary-text mx-auto mb-4" />
                  <p className="text-secondary-text text-lg mb-2">ยังไม่มีการสมัค</p>
                  <p className="text-sm text-secondary-text">
                    การสมัคจะปรากฏที่นี่เมื่อมีคนสมัครงานนี้
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;


