import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import FormTextArea from '../components/FormTextArea';

const SkillsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    skills: [] as string[],
    newSkill: '',
    bio: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleNext = () => {
    if (formData.skills.length === 0) {
      alert('กรุณาเพิ่มทักษะอย่างน้อย 1 ทักษะ');
      return;
    }

    // Get previous data and merge with current data
    const previousData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
    const completeData = {
      ...previousData,
      skills: formData.skills,
      bio: formData.bio
    };
    
    sessionStorage.setItem('registrationData', JSON.stringify(completeData));
    navigate('/register/verification');
  };

  const handleBack = () => {
    navigate('/register/personal-data');
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
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="ml-2 text-sm text-primary-text font-medium">ข้อมูลส่วนตัว</span>
            </div>
            <div className="w-8 h-0.5 bg-border-color"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm">3</span>
              </div>
              <span className="ml-2 text-sm text-primary-text font-medium">ทักษะความสามารถ</span>
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
          <h2 className="text-xl font-bold text-primary-text mb-6 font-prompt">ทักษะและความสามารถ</h2>
          
          <div className="space-y-6">
            {/* Skills Section */}
            <div>
              <label className="block text-primary-text font-medium mb-3">ทักษะของคุณ *</label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={formData.newSkill}
                  onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="เช่น การสอน, การทำอาหาร, การซ่อมแซม"
                  className="flex-1 px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  เพิ่ม
                </button>
              </div>
              
              {/* Skills List */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-accent-light text-accent rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-accent hover:text-accent-hover"
                    >
                      ×
                    </button>
                  </span>
                ))}
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

export default SkillsPage;
