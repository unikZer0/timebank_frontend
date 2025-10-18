import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndServicePage: React.FC = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (acceptedTerms) {
      navigate('/register/personal-data');
    }
  };

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
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-secondary-text text-sm">2</span>
              </div>
              <span className="ml-2 text-sm text-secondary-text">ข้อมูลส่วนตัว</span>
            </div>
            <div className="w-8 h-0.5 bg-border-color"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-secondary-text text-sm">3</span>
              </div>
              <span className="ml-2 text-sm text-secondary-text">ทักษะความสามารถ</span>
            </div>
            <div className="w-8 h-0.5 bg-border-color"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-secondary-text text-sm">4</span>
              </div>
              <span className="ml-2 text-sm text-secondary-text">ตรวจสอบข้อมูล</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-primary-text mb-6 font-prompt">ข้อกำหนดและเงื่อนไขการใช้งาน</h2>
          
          <div className="space-y-4 text-secondary-text leading-relaxed">
            <div>
              <h3 className="font-semibold text-primary-text mb-2">1. การยอมรับข้อกำหนด</h3>
              <p>การใช้งานระบบคลังเวลาหมายความว่าคุณได้อ่าน เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขการใช้งานทั้งหมด</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary-text mb-2">2. การแลกเปลี่ยนเวลา</h3>
              <p>ระบบคลังเวลาอนุญาตให้สมาชิกแลกเปลี่ยนทักษะและเวลากัน โดยใช้เครดิตเวลาเป็นสื่อกลางในการแลกเปลี่ยน</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary-text mb-2">3. ความรับผิดชอบ</h3>
              <p>สมาชิกต้องรับผิดชอบต่อการให้บริการและรับบริการอย่างสุจริต และปฏิบัติตามกฎระเบียบของชุมชน</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary-text mb-2">4. การรักษาความปลอดภัย</h3>
              <p>ข้อมูลส่วนตัวของสมาชิกจะถูกเก็บรักษาอย่างปลอดภัย และจะไม่ถูกเปิดเผยให้กับบุคคลที่สามโดยไม่ได้รับอนุญาต</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary-text mb-2">5. การยกเลิกบัญชี</h3>
              <p>สมาชิกสามารถยกเลิกบัญชีได้ตลอดเวลา โดยการติดต่อผู้ดูแลระบบ</p>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="mt-8 p-4 bg-accent-light rounded-lg border border-accent/20">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-accent border-border-color rounded focus:ring-accent focus:ring-2"
              />
              <span className="text-primary-text text-sm leading-relaxed">
                ฉันได้อ่านและยอมรับข้อกำหนดและเงื่อนไขการใช้งานของระบบคลังเวลาแล้ว และยินดีปฏิบัติตามกฎระเบียบที่กำหนดไว้
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-secondary-text hover:text-primary-text transition-colors"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleNext}
              disabled={!acceptedTerms}
              className="px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ต่อไป
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

export default TermsAndServicePage;
