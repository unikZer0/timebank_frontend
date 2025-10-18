
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { UserStub } from '../types';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const StatusBadge: React.FC<{ status: 'open' | 'in_progress' | 'completed' }> = ({ status }) => {
    const baseClasses = "text-xs font-bold px-3 py-1 rounded-full inline-block";
    if (status === 'open') {
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>Open for Help</span>;
    }
    if (status === 'in_progress') {
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>In Progress</span>;
    }
    if (status === 'completed') {
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Completed</span>;
    }
    return null;
};


const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { requests, addReactionToRequest, applyToRequest, selectProvider, completeRequest } = useData();
  const { currentUser, processJobPayment } = useUser();
  const { showToast } = useToast();
  const request = requests.find(r => r.id === parseInt(requestId || ''));

  if (!request) {
    return <div className="text-center text-secondary-text">Request not found.</div>;
  }
  
  if (!currentUser) {
      // Should be handled by AuthenticatedLayout, but as a fallback
      return <div className="text-center text-secondary-text">Please log in to view details.</div>;
  }
  
  const isOwner = currentUser.id === request.user.id;
  const isApplicant = request.applicants.some(a => a.id === currentUser.id);
  const isProvider = currentUser.id === request.selectedProvider?.id;
  const canApply = !isOwner && !isApplicant && !isProvider && request.status === 'open';

  const handleReactionClick = (emoji: string) => {
    addReactionToRequest(request.id, emoji);
  };

  const handleApply = () => {
      const applicant: UserStub = {
          id: currentUser.id,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          avatarUrl: currentUser.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.email}`
      };
      applyToRequest(request.id, applicant);
  };

  const handleSelectProvider = (provider: UserStub) => {
      selectProvider(request.id, provider);
  };

  const handleComplete = () => {
      if (!request.selectedProvider) return;
      completeRequest(request.id);
      processJobPayment(request.user.id, request.selectedProvider.id, request.duration, request.title);
      showToast('Task completed and credits transferred!', 'success');
      navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto font-prompt">
      <Link to="/search" className="inline-flex items-center text-secondary-text hover:text-accent mb-6 transition-colors">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Search
      </Link>
      
      <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-md border border-border-color">
        <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 mb-4">
                <img src={request.user.avatarUrl} alt={request.user.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                <div>
                    <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">{request.category}</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-text mt-2">{request.title}</h1>
                    <p className="text-secondary-text">Posted by {request.user.name}</p>
                </div>
            </div>
            <StatusBadge status={request.status} />
        </div>
        
        <div className="flex items-center space-x-4 text-secondary-text my-4 border-y border-border-color py-3">
            <div className="flex items-center"><ClockIcon className="w-5 h-5 mr-1.5" /> {request.duration} {request.unit}</div>
            <div className="flex items-center"><UserGroupIcon className="w-5 h-5 mr-1.5" /> {request.applicants.length} applicant(s)</div>
        </div>

        <p className="text-primary-text text-base leading-relaxed my-6">{request.description}</p>
        
        {/* ENHANCED STATUS SECTION */}
        <div className="my-6 p-4 bg-muted rounded-xl border border-border-color">
            <h3 className="text-lg font-bold text-primary-text mb-3 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-accent" />
                Request Status
            </h3>
            
            {request.status === 'open' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Status:</span>
                        <StatusBadge status={request.status} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Applicants:</span>
                        <span className="font-semibold text-primary-text">{request.applicants.length} people interested</span>
                    </div>
                    {isOwner && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                                <strong>Your request is live!</strong> People can now apply to help you. 
                                {request.applicants.length > 0 
                                    ? ` You have ${request.applicants.length} applicant(s) waiting for your selection.`
                                    : ' No applications yet, but your request is visible to the community.'
                                }
                            </p>
                        </div>
                    )}
                    {isApplicant && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 text-sm">
                                <strong>You've applied!</strong> The requester will review applications and select someone to help.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {request.status === 'in_progress' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Status:</span>
                        <StatusBadge status={request.status} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Helper:</span>
                        <span className="font-semibold text-primary-text">{request.selectedProvider?.name}</span>
                    </div>
                    {isOwner && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm mb-3">
                                <strong>Task in progress!</strong> {request.selectedProvider?.name} is helping you with this request.
                            </p>
                            <button 
                                onClick={handleComplete} 
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                            >
                                Mark as Complete ✅
                            </button>
                        </div>
                    )}
                    {isProvider && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                                <strong>You're helping!</strong> Complete the task and wait for the requester to mark it as complete.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {request.status === 'completed' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Status:</span>
                        <StatusBadge status={request.status} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Completed by:</span>
                        <span className="font-semibold text-primary-text">{request.selectedProvider?.name}</span>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">
                            <strong>Task completed!</strong> {request.duration} Time Credits were transferred to {request.selectedProvider?.name}.
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* APPLY BUTTON FOR NON-OWNERS */}
        {canApply && (
            <div className="my-6">
                <button onClick={handleApply} className="w-full py-3 bg-accent text-white font-bold text-lg rounded-md hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20">
                    I can help! (+{request.duration} TC)
                </button>
            </div>
        )}

        {/* APPLICANT LIST (for owner) */}
        {isOwner && request.status === 'open' && request.applicants.length > 0 && (
            <div className="my-6 border-t border-border-color pt-6">
                 <h2 className="text-xl font-semibold text-primary-text mb-4">Applicants</h2>
                 <div className="space-y-3">
                    {request.applicants.map(applicant => (
                        <div key={applicant.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <div className="flex items-center space-x-3">
                                <img src={applicant.avatarUrl} alt={applicant.name} className="w-10 h-10 rounded-full" />
                                <span className="font-semibold text-primary-text">{applicant.name}</span>
                            </div>
                            <button onClick={() => handleSelectProvider(applicant)} className="px-4 py-1.5 bg-green-600 text-white font-bold text-sm rounded-md hover:bg-green-700">Select</button>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* Ad Section */}
        <div className="mt-6">
            <div className="bg-gradient-to-r from-accent to-yellow-500 rounded-xl p-6 text-center text-white">
                <h3 className="text-xl font-bold mb-2"> Discover More Opportunities</h3>
                <p className="text-sm mb-4 opacity-90">Find more ways to help your community and earn credits</p>
                <Link to="/search" className="inline-block bg-white text-accent font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    Explore All Requests
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;
