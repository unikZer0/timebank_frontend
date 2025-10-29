
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { ServiceRequest } from '../types';
import { getMyJobApplications } from '../services/apiService';

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
  creator_phone: string | null;
}

interface JobWithDetails extends Job {
  application: JobApplication;
}
import { 
    QuestionMarkCircleIcon, 
    HeartIcon, 
    BanknotesIcon, 
    ArrowsRightLeftIcon,
    ClockIcon,
    CheckCircleIcon,
    UserCircleIcon,
    BriefcaseIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import DashboardPageSkeleton from '../components/DashboardPageSkeleton';
import { formatTimeRange } from '../utils/timeUtils';

const ActionCard: React.FC<{ to: string; icon: React.ElementType; title: string; isPrimary?: boolean }> = ({ to, icon: Icon, title, isPrimary }) => (
    <Link
        to={to}
        className={`flex flex-col items-center justify-center text-center p-6 rounded-2xl border transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 group ${
            isPrimary
            ? 'bg-gradient-to-br from-accent to-yellow-600 text-white shadow-md shadow-accent/20 border-transparent'
            : 'bg-surface text-primary-text border-border-color hover:border-accent/50'
        }`}
    >
        <div className={`p-3 rounded-full mb-3 transition-colors duration-300 ${isPrimary ? 'bg-white/20' : 'bg-accent-light group-hover:bg-accent'}`}>
            <Icon className={`w-8 h-8 transition-colors duration-300 ${isPrimary ? 'text-white' : 'text-accent group-hover:text-white'}`} />
        </div>
        <span className="font-bold font-prompt">{title}</span>
    </Link>
);

const StatusItem: React.FC<{ request: ServiceRequest }> = ({ request }) => {
    let userText = '';
    let statusIcon = <ClockIcon className="w-5 h-5 mr-2 text-yellow-500" />;
    let statusText = `${request.duration} ${request.unit}`;

    if (request.status === 'in_progress' && request.selectedProvider) {
        userText = `กับ ${request.selectedProvider.name}`;
        statusIcon = <UserCircleIcon className="w-5 h-5 mr-2 text-blue-500" />;
    } else if (request.status === 'completed' && request.selectedProvider) {
        userText = `เสร็จสิ้นโดย ${request.selectedProvider.name}`;
        statusIcon = <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />;
    } else {
        userText = `โดย ${request.user.name}`;
    }

    const timeRange = formatTimeRange(request.start_time, request.end_time);

    return (
        <Link to={`/request/${request.id}`} className="block p-4 bg-surface border border-border-color rounded-xl transition-colors duration-200 hover:border-accent/50">
            <p className="font-semibold text-primary-text">{request.title}</p>
            <div className="flex items-center text-sm text-secondary-text mt-1">
                {statusIcon}
                <p>{statusText} {userText}</p>
            </div>
            {timeRange && (
                <div className="mt-2 text-xs text-accent font-medium">
                    📅 {timeRange}
                </div>
            )}
        </Link>
    );
};

const DashboardPage: React.FC = () => {
  const { currentUser, walletBalance, isLoadingBalance } = useUser();
  const { requests } = useData();
  const [acceptedJobs, setAcceptedJobs] = useState<JobWithDetails[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchAcceptedJobs = async () => {
      if (!currentUser) return;
      
      try {
        setLoadingJobs(true);
        const response = await getMyJobApplications();
        
        if (response.success && response.applications) {
          // Filter for accepted jobs only
          const accepted = response.applications.filter((job: any) => 
            job.status === 'accepted'
          );
          setAcceptedJobs(accepted);
        }
      } catch (error) {
        console.error('Error fetching accepted jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchAcceptedJobs();
  }, [currentUser]);

  if (!currentUser) {
    return <DashboardPageSkeleton />;
  }
  
  const myRequests = requests.filter(r => r.user.id === currentUser.id);
  const myHelpingJobs = requests.filter(r => 
      r.selectedProvider?.id === currentUser.id ||
      (r.status === 'open' && r.applicants.some(a => a.id === currentUser.id))
  );

  const pendingMyRequests = myRequests.filter(r => r.status !== 'completed');
  const pendingHelpingJobs = myHelpingJobs.filter(r => r.status !== 'completed');


  return (
    <div className="font-prompt space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-text font-prompt">ยินดีต้อนรับสู่ระบบธนาคารเวลา</h1>
        
        {/* Active Job Warning */}
        {!loadingJobs && acceptedJobs.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  คุณมีงานที่กำลังทำอยู่ {acceptedJobs.length} งาน
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  คุณสามารถรับงานใหม่ได้เมื่อทำงานปัจจุบันเสร็จสิ้น
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Credit Info */}
      <div className="bg-surface border border-border-color rounded-2xl p-6 text-center shadow-sm">
          <p className="text-secondary-text font-medium">เครดิตคงเหลือ</p>
          {isLoadingBalance ? (
            <div className="flex items-center justify-center my-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : (
            <p className="text-5xl font-bold text-accent my-2">{walletBalance !== null ? walletBalance : currentUser.timeCredit}</p>
          )}
          <p className="text-sm font-semibold text-secondary-text bg-accent-light px-3 py-1 rounded-full inline-block">1 เครดิต = 1 ชั่วโมง</p>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-4">
          {/* Request Help - Full width with highlight */}
          <div>
              <ActionCard to="/request-help" icon={QuestionMarkCircleIcon} title="ขอความช่วยเหลือ" isPrimary />
          </div>
          
          {/* Credits Actions - Three buttons in same row */}
          <div className="grid grid-cols-3 gap-4">
              <ActionCard to="/timebank" icon={BanknotesIcon} title="ดูเครดิตของฉัน" />
              <ActionCard to="/timebank/transfer" icon={ArrowsRightLeftIcon} title="โอนเครดิต" />
              <ActionCard to="/my-jobs" icon={BriefcaseIcon} title="งานของฉัน" />
          </div>
      </div>
      
      {/* Latest Status */}
      <div>
        <h2 className="text-2xl font-bold text-primary-text mb-4 font-prompt">งานที่คุณกำลังทำ</h2>
        <div className="bg-surface border border-border-color rounded-2xl p-4 space-y-4 shadow-sm">
            {/* Current Jobs */}
            {loadingJobs ? (
                <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                    <p className="text-secondary-text">กำลังโหลดงานของคุณ...</p>
                </div>
            ) : acceptedJobs.length > 0 ? (
                <div>
                    <div className="flex items-center text-secondary-text mb-3">
                        <h3 className="font-bold">คุณกำลังทำ งานนี้อยู่</h3>
                        <span className="ml-auto bg-green-100 text-green-800 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{acceptedJobs.length}</span>
                    </div>
                    <div className="space-y-3">
                        {acceptedJobs.map(job => (
                            <div key={job.id} className="bg-background border border-border-color rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-primary-text">{job.title}</h4>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        รับแล้ว
                                    </span>
                                </div>
                                <p className="text-sm text-secondary-text mb-2">{job.description}</p>
                                <div className="flex items-center text-xs text-secondary-text">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    <span>{job.time_balance_hours} ชั่วโมง</span>
                                    <span className="mx-2">•</span>
                                    <span>โดย {job.creator_first_name} {job.creator_last_name}</span>
                                </div>
                                <div className="mt-2">
                                    <Link 
                                        to="/provider-jobs" 
                                        className="text-accent hover:text-accent-hover text-sm font-medium"
                                    >
                                        ดูรายละเอียด →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 text-secondary-text">
                    <p className="text-lg font-medium mb-2">คุณยังไม่มีงาน</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
