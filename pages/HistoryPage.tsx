import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { 
  getMyJobApplications
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
  CalendarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

interface JobApplication {
  id: number;
  job_id: number;
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
  creator_first_name: string;
  creator_last_name: string;
  creator_email: string;
}

interface JobWithDetails extends Job {
  application: JobApplication;
}

const HistoryPage: React.FC = () => {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  
  const [historyJobs, setHistoryJobs] = useState<JobWithDetails[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const jobsPerPage = 5;

  useEffect(() => {
    fetchHistoryJobs();
  }, []);

  // Filter jobs based on search term
  const filteredJobs = historyJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.required_skills.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    job.creator_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.creator_last_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const fetchHistoryJobs = async () => {
    try {
      setLoading(true);
      const response = await getMyJobApplications();
      
      if (response.success && response.applications) {
        // Filter for completed/failed applications and transform the data
        const historyJobs = response.applications
          .filter((app: any) => app.status === 'complete' || app.status === 'failed' || app.status === 'cancelled')
          .map((app: any) => ({
            // Job details
            id: app.job_id,
            title: app.title,
            description: app.description,
            required_skills: app.required_skills || [],
            location_lat: app.location_lat,
            location_lon: app.location_lon,
            time_balance_hours: app.time_balance_hours,
            start_time: app.start_time,
            end_time: app.end_time,
            broadcasted: app.broadcasted,
            created_at: app.created_at,
            creator_first_name: app.creator_first_name,
            creator_last_name: app.creator_last_name,
            creator_email: app.creator_email,
            // Application details
            application: {
              id: app.id,
              job_id: app.job_id,
              user_id: app.user_id,
              status: app.status,
              applied_at: app.applied_at,
              first_name: app.first_name || '',
              last_name: app.last_name || '',
              email: app.email || '',
              skills: app.skills || [],
              lat: app.lat,
              lon: app.lon,
              current_lat: app.current_lat,
              current_lon: app.current_lon
            }
          }));
        
        setHistoryJobs(historyJobs);
      }
    } catch (error: any) {
      console.error('Error fetching history jobs:', error);
      showToast('Failed to load your job history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobDetails = async (job: JobWithDetails) => {
    setSelectedJob(job);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            เสร็จสิ้น
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            ล้มเหลว
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XMarkIcon className="w-3 h-3 mr-1" />
            ยกเลิก
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
          <p className="text-secondary-text mt-4">กำลังโหลดประวัติงาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-prompt p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text mb-2">ประวัติงาน</h1>
        <p className="text-secondary-text mb-4">ดูงานที่เสร็จสิ้น ล้มเหลว หรือถูกยกเลิก</p>
        
        {/* Search Input */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ค้นหางานตามชื่อ คำอธิบาย ทักษะ หรือผู้สร้าง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
          />
        </div>
      </div>

      {historyJobs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-primary-text mb-2">ยังไม่มีประวัติงาน</h3>
          <p className="text-secondary-text mb-4">งานที่เสร็จสิ้น ล้มเหลว หรือถูกยกเลิกจะปรากฏที่นี่</p>
          <div className="flex items-center justify-center space-x-2 text-accent">
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm">เริ่มทำงานเพื่อสร้างประวัติ!</span>
          </div>
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
                    {getStatusBadge(job.application.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-secondary-text">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                      <span>{job.time_balance_hours} ชั่วโมง</span>
                    </div>
                    <div className="flex items-center text-secondary-text">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      <span>โดย {job.creator_first_name} {job.creator_last_name}</span>
                    </div>
                  </div>

                  {job.start_time && job.end_time && (
                    <div className="mb-4">
                      <div className="flex items-center text-accent text-sm">
                        <CalendarIcon className="w-4 h-4 mr-2" />
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
                            +{job.required_skills.length - 3} เพิ่มเติม
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-text">
                      สมัครเมื่อ {new Date(job.application.applied_at).toLocaleDateString('th-TH')}
                    </span>
                    <button
                      onClick={() => handleViewJobDetails(job)}
                      className="px-3 py-1 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      ดูรายละเอียด
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
                      : `พบ ${filteredJobs.length} งานที่ตรงกับ "${searchTerm}"`
                    }
                  </p>
                </div>
              )}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border-color rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-color">
              <div>
                <h3 className="text-lg font-semibold text-primary-text">รายละเอียดงาน</h3>
                <p className="text-sm text-secondary-text">{selectedJob.title}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-secondary-text hover:text-primary-text p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-primary-text text-xl mb-3">{selectedJob.title}</h4>
                  <p className="text-secondary-text text-sm mb-4">{selectedJob.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <CurrencyDollarIcon className="w-5 h-5 mr-3 text-accent" />
                    <span className="text-primary-text font-medium">{selectedJob.time_balance_hours} ชั่วโมง</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <UserGroupIcon className="w-5 h-5 mr-3 text-accent" />
                    <span className="text-primary-text">โดย {selectedJob.creator_first_name} {selectedJob.creator_last_name}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="text-secondary-text mr-3">อีเมล:</span>
                    <span className="text-primary-text">{selectedJob.creator_email}</span>
                  </div>

                  {selectedJob.start_time && selectedJob.end_time && (
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-5 h-5 mr-3 text-accent" />
                      <span className="text-primary-text">{formatTimeRange(selectedJob.start_time, selectedJob.end_time)}</span>
                    </div>
                  )}

                  {selectedJob.location_lat && selectedJob.location_lon && (
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPinIcon className="w-5 h-5 mr-3 text-accent" />
                        <span className="text-primary-text font-medium">สถานที่ทำงาน</span>
                      </div>
                      <div className="text-sm text-secondary-text">
                        <a 
                          href={`https://www.google.com/maps?q=${selectedJob.location_lat},${selectedJob.location_lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-accent-hover underline"
                        >
                          เปิดใน Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                  <div>
                    <h5 className="font-medium text-primary-text mb-3">ทักษะที่ต้องการ:</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.required_skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-accent-light text-accent text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border-color">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-secondary-text">สถานะ:</span>
                    {getStatusBadge(selectedJob.application.status)}
                  </div>
                  <div className="text-sm text-secondary-text">
                    สมัครเมื่อ {new Date(selectedJob.application.applied_at).toLocaleDateString('th-TH')}
                  </div>
                </div>

                {selectedJob.application.status === 'complete' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        งานนี้เสร็จสิ้นแล้ว
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      คุณได้รับเครดิตเวลาแล้ว
                    </p>
                  </div>
                )}

                {selectedJob.application.status === 'failed' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        งานนี้ล้มเหลว
                      </span>
                    </div>
                    <p className="text-xs text-red-700">
                      งานนี้ไม่สามารถดำเนินการต่อได้
                    </p>
                  </div>
                )}

                {selectedJob.application.status === 'cancelled' && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <XMarkIcon className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-800">
                        งานนี้ถูกยกเลิก
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">
                      งานนี้ถูกยกเลิกโดยผู้สร้างงาน
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
