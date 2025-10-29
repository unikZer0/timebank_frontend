import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/solid';

const LinkLinePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLinking, setIsLinking] = useState(false);
  
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const handleLineLogin = () => {
    setIsLinking(true);
    // Get user email from localStorage or context
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // Redirect to LINE Login
    const LINE_LOGIN_CHANNEL_ID = process.env.REACT_APP_LINE_LOGIN_CHANNEL_ID;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
    
    // Debug logging
    console.log('Environment variables check:', {
      channelId: LINE_LOGIN_CHANNEL_ID,
      backendUrl: BACKEND_URL,
      userEmail: userEmail
    });
    
    // Check if LINE Login Channel ID is configured
    if (!LINE_LOGIN_CHANNEL_ID || LINE_LOGIN_CHANNEL_ID === 'your_line_login_channel_id_here') {
      console.error('LINE Login Channel ID not configured:', LINE_LOGIN_CHANNEL_ID);
      setIsLinking(false);
      alert('LINE Login ไม่ได้ตั้งค่า กรุณาติดต่อผู้ดูแลระบบ\n\nกรุณาตรวจสอบไฟล์ .env ในโฟลเดอร์ webTimeBank');
      return;
    }
    
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
      `response_type=code&` +
      `client_id=${LINE_LOGIN_CHANNEL_ID}&` +
      `redirect_uri=${encodeURIComponent(`${BACKEND_URL}/auth/line/callback`)}&` +
      `state=${encodeURIComponent(userEmail)}&` +
      `scope=profile%20openid`;
    
    console.log('Redirecting to LINE Login:', lineLoginUrl);
    window.location.href = lineLoginUrl;
  };

  const getStatusMessage = () => {
    if (success === 'true') {
      return {
        icon: <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />,
        title: "เชื่อมต่อ LINE สำเร็จ!",
        message: "บัญชี LINE ของคุณเชื่อมต่อกับ TimeBank แล้ว คุณจะได้รับการแจ้งเตือนงานที่นี่",
        buttonText: "ไปที่ Dashboard",
        buttonAction: () => navigate('/dashboard')
      };
    }
    
    if (error === 'user_not_found') {
      return {
        icon: <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />,
        title: "ไม่พบผู้ใช้",
        message: "ไม่พบผู้ใช้ที่มีอีเมลนี้ กรุณาสมัครสมาชิกก่อน",
        buttonText: "สมัครสมาชิก",
        buttonAction: () => navigate('/register')
      };
    }
    
    if (error === 'already_linked') {
      return {
        icon: <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />,
        title: "บัญชีเชื่อมต่อแล้ว",
        message: "อีเมลนี้เชื่อมต่อกับบัญชี LINE อื่นแล้ว",
        buttonText: "ไปที่ Dashboard",
        buttonAction: () => navigate('/dashboard')
      };
    }
    
    if (error === 'server_error') {
      return {
        icon: <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />,
        title: "เกิดข้อผิดพลาด",
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
        buttonText: "ลองใหม่",
        buttonAction: () => setIsLinking(false)
      };
    }
    
    // Default - show link option
    return {
      icon: <ClockIcon className="w-16 h-16 text-accent mx-auto mb-4" />,
      title: "เชื่อมต่อบัญชี LINE",
      message: "เชื่อมต่อบัญชี LINE เพื่อรับการแจ้งเตือนงานและใช้งาน Rich Menu",
      buttonText: "เชื่อมต่อ LINE",
      buttonAction: handleLineLogin
    };
  };

  const status = getStatusMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-lg p-8 text-center">
        {status.icon}
        
        <h1 className="text-2xl font-bold text-primary-text mb-4 font-prompt">
          {status.title}
        </h1>
        
        <p className="text-secondary-text mb-8 leading-relaxed">
          {status.message}
        </p>
        
        {isLinking && (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-sm text-secondary-text mt-2">กำลังเชื่อมต่อ...</p>
          </div>
        )}
        
        <button
          onClick={status.buttonAction}
          disabled={isLinking}
          className="w-full bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {status.buttonText}
        </button>
        
        {!success && !error && (
          <p className="text-xs text-secondary-text mt-4">
            หรือคุณสามารถเชื่อมต่อได้ภายหลังในโปรไฟล์
          </p>
        )}
      </div>
    </div>
  );
};

export default LinkLinePage;
