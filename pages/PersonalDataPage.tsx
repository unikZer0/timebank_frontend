import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import FormTextArea from '../components/FormTextArea';
// NationalIdValidation removed

const PersonalDataPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idCardNumber: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });
  
  // Removed NationalIdValidation state
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Filter phone number input to only allow digits and limit to 10 characters
    if (name === 'phone') {
      const filteredValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'idCardNumber') {
      const filteredValue = value.replace(/\D/g, '').slice(0, 13);
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Removed NationalIdValidation handlers

  const handleNext = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.idCardNumber || !formData.dob) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    // Basic National ID validation (13 digits numeric)
    if (formData.idCardNumber.length !== 13 || !/^\d{13}$/.test(formData.idCardNumber)) {
      alert('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
      return;
    }

    // Validate Phone Number (10 digits)
    if (formData.phone && (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone))) {
      alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
      return;
    }

    // Store form data with validation results in sessionStorage for multi-step process
    const registrationData = { ...formData };
    sessionStorage.setItem('registrationData', JSON.stringify(registrationData));
    navigate('/register/skills');
  };

  const handleBack = () => {
    navigate('/register/terms');
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
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm">2</span>
              </div>
              <span className="ml-2 text-sm text-primary-text font-medium">ข้อมูลส่วนตัว</span>
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
          <h2 className="text-xl font-bold text-primary-text mb-6 font-prompt">ข้อมูลส่วนตัวและบัญชี</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="ชื่อจริง *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="กรอกชื่อจริง"
              />
              <FormField
                label="นามสกุล *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="กรอกนามสกุล"
              />
            </div>
            
            <FormField
              label="อีเมล *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
            
            <FormField
              label="เบอร์โทรศัพท์"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0812345678"
              maxLength={10}
            />
            
            <FormField
              label="เลขบัตรประชาชน (13 หลัก) *"
              name="idCardNumber"
              type="text"
              value={formData.idCardNumber}
              onChange={handleChange}
              required
              maxLength={13}
              placeholder="1234567890123"
            />
            
            <FormField
              label="วันเกิด *"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="รหัสผ่าน *"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="รหัสผ่าน"
              />
              <FormField
                label="ยืนยันรหัสผ่าน *"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="ยืนยันรหัสผ่าน"
              />
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
              onClick={handleNext}
              className="px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-all duration-200"
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

export default PersonalDataPage;
