
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { ServiceRequest } from '../types';
import { 
    QuestionMarkCircleIcon, 
    HeartIcon, 
    BanknotesIcon, 
    ArrowsRightLeftIcon,
    ClockIcon,
    CheckCircleIcon,
    UserCircleIcon
} from '@heroicons/react/24/solid';
import DashboardPageSkeleton from '../components/DashboardPageSkeleton';

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
        userText = `with ${request.selectedProvider.name}`;
        statusIcon = <UserCircleIcon className="w-5 h-5 mr-2 text-blue-500" />;
    } else if (request.status === 'completed' && request.selectedProvider) {
        userText = `completed by ${request.selectedProvider.name}`;
        statusIcon = <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />;
    } else {
        userText = `by ${request.user.name}`;
    }

    return (
        <Link to={`/request/${request.id}`} className="block p-4 bg-surface border border-border-color rounded-xl transition-colors duration-200 hover:border-accent/50">
            <p className="font-semibold text-primary-text">{request.title}</p>
            <div className="flex items-center text-sm text-secondary-text mt-1">
                {statusIcon}
                <p>{statusText} {userText}</p>
            </div>
        </Link>
    );
};

const DashboardPage: React.FC = () => {
  const { currentUser } = useUser();
  const { requests } = useData();


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
        <h1 className="text-3xl font-bold text-primary-text font-prompt">สวัสดีคุณ {currentUser.firstName} 👋</h1>
        <p className="text-secondary-text">ยินดีต้อนรับสู่ระบบแลกเปลี่ยนเวลา</p>
      </div>
      
      {/* Credit Info */}
      <div className="bg-surface border border-border-color rounded-2xl p-6 text-center shadow-sm">
          <p className="text-secondary-text font-medium">เครดิตคงเหลือ</p>
          <p className="text-5xl font-bold text-accent my-2">{currentUser.timeCredit}</p>
          <p className="text-sm font-semibold text-secondary-text bg-accent-light px-3 py-1 rounded-full inline-block">1 เครดิต = 1 ชั่วโมง</p>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-4">
          {/* Request Help - Full width with highlight */}
          <div>
              <ActionCard to="/request-help" icon={QuestionMarkCircleIcon} title="ขอความช่วยเหลือ" isPrimary />
          </div>
          
          {/* Credits Actions - Two buttons in same row */}
          <div className="grid grid-cols-2 gap-4">
              <ActionCard to="/timebank" icon={BanknotesIcon} title="ดูเครดิตของฉัน" />
              <ActionCard to="/timebank" icon={ArrowsRightLeftIcon} title="โอนเครดิต" />
          </div>
      </div>
      
      {/* Latest Status */}
      <div>
        <h2 className="text-2xl font-bold text-primary-text mb-4 font-prompt">สถานะล่าสุด</h2>
        <div className="bg-surface border border-border-color rounded-2xl p-4 space-y-4 shadow-sm">
            {/* Pending Tasks */}
            {pendingMyRequests.length > 0 && (
                <div>
                    <div className="flex items-center text-secondary-text mb-3">
                        <h3 className="font-bold">My Requests</h3>
                        <span className="ml-auto bg-muted text-primary-text text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{pendingMyRequests.length}</span>
                    </div>
                    <div className="space-y-2">
                        {pendingMyRequests.map(req => <StatusItem key={req.id} request={req} />)}
                    </div>
                </div>
            )}

            {/* Completed Tasks */}
             {pendingHelpingJobs.length > 0 && (
                 <div>
                    <div className="flex items-center text-secondary-text mb-3">
                        <h3 className="font-bold">Jobs I'm Helping With</h3>
                        <span className="ml-auto bg-muted text-primary-text text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{pendingHelpingJobs.length}</span>
                    </div>
                    <div className="space-y-2">
                        {pendingHelpingJobs.map(req => <StatusItem key={req.id} request={req} />)}
                    </div>
                </div>
            )}
            
            {(pendingMyRequests.length === 0 && pendingHelpingJobs.length === 0) && (
                <div className="text-center py-6 text-secondary-text">
                    <p>No active tasks right now.</p>
                    <p className="text-sm">Why not <Link to="/search" className="text-accent underline">find someone to help</Link>?</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
