
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, ShareIcon, ArrowRightOnRectangleIcon, XMarkIcon, PlusIcon, CheckIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon, CalendarIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { User } from '../types';
import { useUser } from '../context/UserContext';
import { getUserProfile, updateUserProfile } from '../services/apiService';
import ProfilePageSkeleton from '../components/ProfilePageSkeleton';
import { useToast } from '../context/ToastContext';

const StatItem: React.FC<{ value: number, label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center text-center">
        <div className="text-3xl font-bold text-primary-text mb-2">{value}</div>
        <p className="text-secondary-text text-sm font-medium">{label}</p>
    </div>
);


const RenderAvatar: React.FC<{ user: any }> = ({ user }) => {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt="avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-surface shadow-lg" />;
  } else {
    // Get first character of first name, fallback to email if no first name
    const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
    return (
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-accent-hover text-white flex items-center justify-center text-5xl font-bold ring-4 ring-surface shadow-lg">
        {initial}
      </div>
    );
  }
};

const ProfilePage: React.FC = () => {
  const { currentUser, logout } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSkills, setEditingSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingPhone, setEditingPhone] = useState('');

  const fetchProfile = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const response = await getUserProfile();
      
      if (response.success && response.data) {
        setProfileData(response.data);
      } else {
        showToast('Failed to load profile data', 'error');
        // Fallback to current user data
        setProfileData(currentUser);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile data', 'error');
      // Fallback to current user data
      setProfileData(currentUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser, showToast]);

  // Refresh profile when returning from LINE login
  useEffect(() => {
    const handleFocus = () => {
      // Check if we're returning from LINE login
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true' || urlParams.get('error')) {
        fetchProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (!currentUser || isLoading) {
    return <ProfilePageSkeleton />;
  }
  
  const user = profileData || currentUser;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditingSkills([...user.skills]);
    setEditingPhone(user.phone || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSkills([]);
    setNewSkill('');
    setEditingPhone('');
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Validate phone number (must be exactly 10 digits)
      if (editingPhone && !/^\d{10}$/.test(editingPhone)) {
        showToast('Phone number must be exactly 10 digits', 'error');
        setIsSaving(false);
        return;
      }
      
      const response = await updateUserProfile({ 
        skills: editingSkills,
        phone: editingPhone
      });
      
      if (response.success) {
        setProfileData(prev => prev ? { 
          ...prev, 
          skills: editingSkills,
          phone: editingPhone
        } : null);
        setIsEditing(false);
        setNewSkill('');
        setEditingPhone('');
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editingSkills.includes(newSkill.trim())) {
      if (editingSkills.length >= 3) {
        showToast('You can only have up to 3 skills', 'error');
        return;
      }
      setEditingSkills([...editingSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditingSkills(editingSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-prompt text-primary-text">
        <div className="bg-surface border border-border-color rounded-2xl shadow-md overflow-hidden">
            <div className="h-40 bg-muted relative">
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                        onClick={handleEditClick}
                        className="text-secondary-text hover:text-primary-text bg-surface/50 p-2 rounded-full backdrop-blur-sm transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                    <RenderAvatar user={user} />
                </div>
            </div>

            <div className="pt-20 pb-8 px-6 text-center">
                <h1 className="text-3xl font-bold text-primary-text">{user.first_name || 'User'} {user.last_name || ''}</h1>
            </div>

            <div className="p-6">

                {/* Time Balance */}
                <div className="mb-8 bg-accent-light rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-primary-text mb-2">ยอดเครดิตเวลาปัจจุบัน</h3>
                    <div className="flex items-center">
                        <ClockIcon className="w-6 h-6 text-accent mr-2" />
                        <span className="text-2xl font-bold text-accent">{user.timeCredit || 0} ชั่วโมง</span>
                    </div>
                    <p className="text-sm text-secondary-text mt-1">พร้อมช่วยเหลือผู้อื่น</p>
                </div>

                {/* LINE Account Status */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-primary-text">บัญชี LINE</h3>
                        <button
                            onClick={fetchProfile}
                            className="text-sm text-accent hover:text-accent-hover flex items-center"
                        >
                            <ClockIcon className="w-4 h-4 mr-1" />
                            รีเฟรช
                        </button>
                    </div>
                    <div className="space-y-3">
                        {user.line_user_id ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-green-800 font-medium">เชื่อมต่อแล้ว</span>
                                </div>
                                <span className="text-xs text-green-600">ID: {user.line_user_id.substring(0, 8)}...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
                                    <span className="text-yellow-800 font-medium">ยังไม่ได้เชื่อมต่อ</span>
                                </div>
                                <button
                                    onClick={() => {
                                        localStorage.setItem('userEmail', user.email);
                                        window.location.href = '/link-line';
                                    }}
                                    className="px-3 py-1 bg-accent text-white text-sm rounded-md hover:bg-accent-hover transition-colors"
                                >
                                    เชื่อมต่อ
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary-text mb-4">ข้อมูลติดต่อ</h3>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <EnvelopeIcon className="w-5 h-5 text-secondary-text mr-3" />
                            <span className="text-primary-text">{user.email}</span>
                        </div>
                        {isEditing ? (
                            <div className="flex items-center">
                                <PhoneIcon className="w-5 h-5 text-secondary-text mr-3" />
                                 <input
                                     type="tel"
                                     value={editingPhone}
                                     onChange={(e) => {
                                       const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                       setEditingPhone(value);
                                     }}
                                     className="flex-1 px-3 py-2 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                     placeholder="0812345678"
                                     maxLength={10}
                                 />
                            </div>
                        ) : (
                            user.phone && (
                                <div className="flex items-center">
                                    <PhoneIcon className="w-5 h-5 text-secondary-text mr-3" />
                                    <span className="text-primary-text">{user.phone}</span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Personal Information */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary-text mb-4">ข้อมูลส่วนตัว</h3>
                    <div className="space-y-3">
                        {user.dob && (
                            <div className="flex items-center">
                                <CalendarIcon className="w-5 h-5 text-secondary-text mr-3" />
                                <span className="text-primary-text">
                                    วันเกิด: {new Date(user.dob).toLocaleDateString('th-TH', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Member Since */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary-text mb-3">เป็นสมาชิกตั้งแต่</h3>
                    <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-secondary-text mr-3" />
                        <span className="text-primary-text">
                            {new Date(user.created_at || Date.now()).toLocaleDateString('th-TH', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </span>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-primary-text">ทักษะ</h2>
                        {isEditing && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="flex items-center px-3 py-1 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
                                >
                                    <CheckIcon className="w-4 h-4 mr-1" />
                                    {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    ยกเลิก
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <div className="space-y-4">
                            {/* Add new skill input */}
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="เพิ่มทักษะใหม่..."
                                        className="flex-1 px-3 py-2 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                                    />
                                    <button
                                        onClick={handleAddSkill}
                                        disabled={!newSkill.trim() || editingSkills.includes(newSkill.trim()) || editingSkills.length >= 3}
                                        className="px-4 py-2 bg-accent text-white font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-secondary-text">
                                    ทักษะ: {editingSkills.length}/3
                                    {editingSkills.length >= 3 && (
                                        <span className="text-red-500 ml-2">• ถึงขีดจำกัดแล้ว</span>
                                    )}
                                </p>
                            </div>
                            
                            {/* Skills list with delete buttons */}
                            <div className="flex flex-wrap gap-3">
                                {editingSkills.map(skill => (
                                    <div key={skill} className="flex items-center bg-muted text-primary-text text-base font-medium px-4 py-2 rounded-full">
                                        <span>{skill}</span>
                                        <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {editingSkills.length === 0 && (
                                    <p className="text-secondary-text">ยังไม่ได้เพิ่มทักษะ</p>
                                )}
                            </div>
                        </div>
                    ) : (
                    <div className="flex flex-wrap gap-3">
                        {user.skills.length > 0 ? user.skills.map(skill => (
                        <span key={skill} className="bg-muted text-primary-text text-base font-medium px-4 py-2 rounded-full">
                            {skill}
                        </span>
                        )) : <p className="text-secondary-text">ยังไม่มีทักษะที่ระบุ</p>}
                    </div>
                    )}
                </div>
                 <div className="mt-8 border-t border-border-color pt-6 flex justify-center">
                    <button onClick={handleLogout} className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors">
                        <ArrowRightOnRectangleIcon className="w-6 h-6"/>
                        <span>ออกจากระบบ</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfilePage;
