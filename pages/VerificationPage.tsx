import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VerificationPage: React.FC = () => {
  const [registrationData, setRegistrationData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem('registrationData');
    if (data) {
      setRegistrationData(JSON.parse(data));
    } else {
      // If no data, redirect to start
      navigate('/register/terms');
    }
  }, [navigate]);

  const handleSubmit = () => {
    // Here you would typically send the data to your backend API
    console.log('Submitting registration data:', registrationData);
    
    // Clear session data
    sessionStorage.removeItem('registrationData');
    
    // Show success message and redirect
    alert('ข้อมูลของคุณได้ถูกส่งไปยังผู้ดูแลระบบแล้ว กรุณารอการตรวจสอบ');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/register/skills');
  };

  if (!registrationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-surface rounded-2xl shadow-lg border border-border-color">
        {/* Header */}
        <div className="text-center py-8 border-b border-border-color">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-primary-text font-prompt">คลังเวลา</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="ml-2 text-sm text-primary-text font-medium">ข้อกำหนด</span>
            </div>
            <div className="w-8 h-0.5 bg-border-color"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="ml-2 text-sm text-primary-text font-medium">ข้อมูลส่วนตัว</span>
            </div>
            <div className="w-8 h-0.5 bg-border-color"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="ml-2 text-sm text-primary-text font-medium">ทักษะความสามารถ</span>
            </div>
            <div className="w-8 h-0.5 bg-border-color"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm">4</span>
              </div>
              <span className="ml-2 text-sm text-primary-text font-medium">ตรวจสอบข้อมูล</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-primary-text mb-6 font-prompt">ตรวจสอบข้อมูล</h2>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-accent-light p-4 rounded-lg">
              <h3 className="font-semibold text-primary-text mb-3">ข้อมูลส่วนตัว</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-text">ชื่อ-นามสกุล:</span>
                  <p className="text-primary-text">{registrationData.firstName} {registrationData.lastName}</p>
                </div>
                <div>
                  <span className="text-secondary-text">อีเมล:</span>
                  <p className="text-primary-text">{registrationData.email}</p>
                </div>
                <div>
                  <span className="text-secondary-text">เบอร์โทรศัพท์:</span>
                  <p className="text-primary-text">{registrationData.phone || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <span className="text-secondary-text">ที่อยู่:</span>
                  <p className="text-primary-text">{registrationData.address || 'ไม่ระบุ'}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-accent-light p-4 rounded-lg">
              <h3 className="font-semibold text-primary-text mb-3">ทักษะและความสามารถ</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-secondary-text text-sm">ทักษะ:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {registrationData.skills?.map((skill: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-accent text-white rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {registrationData.bio && (
                  <div>
                    <span className="text-secondary-text text-sm">แนะนำตัว:</span>
                    <p className="text-primary-text mt-1">{registrationData.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">รอการตรวจสอบ</h4>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    ข้อมูลของคุณจะถูกส่งไปยังผู้ดูแลระบบเพื่อตรวจสอบความถูกต้อง 
                    คุณจะได้รับอีเมลแจ้งเตือนเมื่อบัญชีของคุณได้รับการอนุมัติแล้ว
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-muted text-primary-text rounded-lg hover:bg-muted-hover transition-colors"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              ส่งข้อมูล
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-sm text-secondary-text">
              มีบัญชีอยู่แล้ว? <button onClick={() => navigate('/login')} className="text-accent hover:underline">เข้าสู่ระบบที่นี่</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
