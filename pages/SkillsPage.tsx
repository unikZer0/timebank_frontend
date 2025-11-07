import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchableMultiSelect from '../components/SearchableMultiSelect';
import { getAllUserSkills } from '../services/apiService';

const SkillsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    skills: [] as string[],
  });
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const MAX_SKILLS = 3;

  const normalizeSkill = (skill: any): string | null => {
    if (typeof skill === 'string') {
      return skill.trim();
    }

    if (skill && typeof skill === 'object') {
      if (typeof skill.name === 'string') {
        return skill.name.trim();
      }

      if (typeof skill.skill_name === 'string') {
        return skill.skill_name.trim();
      }
    }

    if (skill != null && typeof skill.toString === 'function') {
      return String(skill).trim();
    }

    return null;
  };

  const mergeSkills = (previous: string[], incoming: any[]): string[] => {
    const normalizedIncoming = incoming
      .map(normalizeSkill)
      .filter((name): name is string => Boolean(name));

    const merged = new Set<string>([...previous, ...normalizedIncoming]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  };

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
    if (storedData.skills && Array.isArray(storedData.skills)) {
      const normalizedStoredSkills = storedData.skills
        .map(normalizeSkill)
        .filter((name: string | null): name is string => Boolean(name));
      const uniqueStoredSkills = Array.from(new Set(normalizedStoredSkills));
      setFormData(prev => ({ ...prev, skills: uniqueStoredSkills.slice(0, MAX_SKILLS) }));
      setAvailableSkills(prev => mergeSkills(prev, uniqueStoredSkills));
    }

    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        const response = await getAllUserSkills();
        if (response.success && Array.isArray(response.skills)) {
          setAvailableSkills(prev => mergeSkills(prev, response.skills));
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillsChange = (selectedSkills: string[]) => {
    if (selectedSkills.length > MAX_SKILLS) {
      alert('คุณสามารถเลือกทักษะได้สูงสุด 3 ทักษะ');
      return;
    }
    setFormData(prev => ({ ...prev, skills: selectedSkills }));
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
              <div className="flex items-center justify-between mb-3">
                <label className="block text-primary-text font-medium">ทักษะของคุณ *</label>
                <span className="text-sm text-secondary-text">
                  {formData.skills.length}/{MAX_SKILLS} ทักษะ
                  {formData.skills.length >= MAX_SKILLS && (
                    <span className="text-red-500 ml-1">(ถึงขีดจำกัดแล้ว)</span>
                  )}
                </span>
              </div>
              <SearchableMultiSelect
                options={availableSkills}
                selectedValues={formData.skills}
                onSelectionChange={handleSkillsChange}
                placeholder="ค้นหาและเลือกทักษะของคุณ..."
                loading={skillsLoading}
                maxSelections={MAX_SKILLS}
                onMaxSelectionReached={() => {
                  alert('คุณสามารถเลือกทักษะได้สูงสุด 3 ทักษะ');
                }}
              />
              <p className="text-xs text-secondary-text mt-2">เลือกทักษะสูงสุด {MAX_SKILLS} รายการ</p>

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
