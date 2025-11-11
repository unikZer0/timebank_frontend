
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import FormTextArea from '../components/FormTextArea';
import SearchableMultiSelect from '../components/SearchableMultiSelect';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { calculateDuration } from '../utils/timeUtils';
import { createJob, getAllUserSkills } from '../services/apiService';

const RequestHelpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    unit: 'Hours',
    start_time: '',
    end_time: '',
    required_skills: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { showToast } = useToast();

  // Helper function to normalize skills (handle both string and object formats)
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

  // Helper function to normalize skills array
  const normalizeSkillsArray = (skills: any[]): string[] => {
    if (!Array.isArray(skills)) return [];
    return skills
      .map(normalizeSkill)
      .filter((skill): skill is string => Boolean(skill))
      .sort();
  };

  // Fetch available skills from user profiles
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        const response = await getAllUserSkills();
        
        if (response.success && response.skills && Array.isArray(response.skills)) {
          // Normalize skills (handle both string and object formats)
          const normalizedSkills = normalizeSkillsArray(response.skills);
          setAvailableSkills(normalizedSkills);
        } else {
          // No skills available in database
          setAvailableSkills([]);
          showToast('ยังไม่มีทักษะในระบบ', 'info');
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        // No fallback - just show empty list
        setAvailableSkills([]);
        showToast('โหลดทักษะจากฐานข้อมูลล้มเหลว', 'error');
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate duration when start_time or end_time changes
    if (name === 'start_time' || name === 'end_time') {
      calculateDurationFromTimes(name, value);
    }
  };

  const handleSkillsChange = (selectedSkills: string[]) => {
    setFormData(prev => ({ ...prev, required_skills: selectedSkills }));
  };

  const calculateDurationFromTimes = (changedField: string, value: string) => {
    let startTime = formData.start_time;
    let endTime = formData.end_time;
    
    // Update the field that was changed
    if (changedField === 'start_time') {
      startTime = value;
    } else if (changedField === 'end_time') {
      endTime = value;
    }
    
    // Calculate duration if both times are provided
    if (startTime && endTime) {
      const duration = calculateDuration(startTime, endTime);
      setFormData(prev => ({ ...prev, duration: duration.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;
    
    // Validate that both times are provided
    if (!formData.start_time || !formData.end_time) {
      showToast('กรุณาเลือกทั้งเวลาเริ่มต้นและเวลาสิ้นสุด', 'error');
      return;
    }
    
    // Validate start_time and end_time
    const duration = calculateDuration(formData.start_time, formData.end_time);
    
    if (duration <= 0) {
      showToast('เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        time_balance_hours: parseFloat(formData.duration),
        start_time: formData.start_time,
        end_time: formData.end_time,
        required_skills: formData.required_skills,
      };
      
      const response = await createJob(jobData);
      
      showToast('โพสต์คำขอความช่วยเหลือสำเร็จแล้ว!', 'success');
      navigate('/my-jobs'); // Navigate to My Jobs page to see the status
      
    } catch (error: any) {
      console.error('Error creating job:', error);
      showToast(error?.data?.message || 'สร้างคำขอความช่วยเหลือล้มเหลว', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormInvalid = !formData.title || !formData.description || !formData.duration || !formData.start_time || !formData.end_time;

  return (
    <div className="max-w-2xl mx-auto font-prompt">
       <h1 className="text-3xl font-bold text-primary-text mb-6">โพสต์คำขอความช่วยเหลือ</h1>
      <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-xl shadow-md border border-border-color space-y-6">
        <FormField 
            label="คุณต้องการความช่วยเหลือเรื่องอะไร?"
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            placeholder="เช่น สอนวิธีใช้สมาร์ทโฟน"
        />
                    {/* Time Range Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-secondary-text font-medium mb-2">เวลาเริ่มต้น <span className="text-red-500">*</span></label>
                <input 
                  name="start_time" 
                  type="time" 
                  value={formData.start_time} 
                  onChange={handleChange} 
                  className="w-full bg-surface border border-border-color rounded-lg text-primary-text placeholder-secondary-text/70 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300 px-4 py-3" 
                  placeholder="08:00"
                  required
                />
              </div>
              <div>
                <label className="block text-secondary-text font-medium mb-2">เวลาสิ้นสุด <span className="text-red-500">*</span></label>
                <input 
                  name="end_time" 
                  type="time" 
                  value={formData.end_time} 
                  onChange={handleChange} 
                  className="w-full bg-surface border border-border-color rounded-lg text-primary-text placeholder-secondary-text/70 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300 px-4 py-3" 
                  placeholder="10:00"
                  required
                />
              </div>
            </div>
         <div>
              <label className="block text-secondary-text font-medium mb-2">ระยะเวลาโดยประมาณ</label>
              <div className="flex">
                <input 
                    name="duration" 
                    type="number" 
                    value={formData.duration} 
                    onChange={handleChange} 
                    className="w-1/2 bg-surface border border-border-color rounded-l-lg text-primary-text placeholder-secondary-text/70 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300 px-4 py-3" 
                    required 
                    placeholder="เช่น 2"
                    readOnly
                />
                <span className="px-4 py-3 border-y border-r border-border-color bg-background text-secondary-text rounded-r-lg">ชั่วโมง</span>
              </div>
              <p className="text-xs text-accent mt-1">✨ ระยะเวลาคำนวณอัตโนมัติจากช่วงเวลา</p>
            </div>
  
            
            {/* Skills Selection */}
            <SearchableMultiSelect
              options={availableSkills}
              selectedValues={formData.required_skills}
              onSelectionChange={handleSkillsChange}
              placeholder="ค้นหาและเลือกทักษะที่ต้องการ..."
              label="ทักษะที่ต้องการ (ไม่บังคับ)"
              loading={skillsLoading}
            />
            {!skillsLoading && availableSkills.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>ยังไม่มีทักษะในระบบ</strong> ทักษะจะปรากฏที่นี่เมื่อผู้ใช้เพิ่มทักษะในโปรไฟล์ของพวกเขา
                </p>
              </div>
            )}
        <FormTextArea
            label="เพิ่มรายละเอียดเพิ่มเติม"
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={5}
            required
            placeholder="อธิบายสิ่งที่คุณต้องการความช่วยเหลือ..."
        />
        <div className="pt-2">
            <button 
                type="submit" 
                disabled={isFormInvalid || isSubmitting}
                className="w-full py-3 bg-accent text-white font-bold text-lg rounded-md hover:bg-accent-hover transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transform active:scale-95 shadow-lg shadow-accent/20"
            >
                {isSubmitting ? 'กำลังโพสต์...' : 'โพสต์คำขอ'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default RequestHelpPage;
