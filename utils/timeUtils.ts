// Utility functions for time formatting

/**
 * Format a time string for display (HH:MM format)
 * @param timeString - Time string in HH:MM format
 * @returns Formatted time string
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // Handle both HH:MM and HH:MM:SS formats
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  
  // Convert to 12-hour format
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format a time range for display
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Formatted time range string
 */
export const formatTimeRange = (startTime?: string, endTime?: string): string => {
  if (!startTime && !endTime) return '';
  
  if (startTime && endTime) {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    return `${start} - ${end}`;
  }
  
  if (startTime) {
    return `เริ่ม: ${formatTime(startTime)}`;
  }
  
  if (endTime) {
    return `สิ้นสุด: ${formatTime(endTime)}`;
  }
  
  return '';
};

/**
 * Calculate duration between two times
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Duration in hours
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  
  // Handle case where end time is next day (e.g., 22:00 to 02:00)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }
  
  const diffMinutes = endMinutes - startMinutes;
  return diffMinutes / 60; // Convert to hours
};

/**
 * Check if a time range is in the past (for today)
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns True if the time range is in the past
 */
export const isTimeRangeInPast = (startTime?: string, endTime?: string): boolean => {
  if (!endTime) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentMinutes = currentHour * 60 + currentMinute;
  
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes < currentMinutes;
};

/**
 * Check if a time range is currently active (for today)
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns True if the time range is currently active
 */
export const isTimeRangeActive = (startTime?: string, endTime?: string): boolean => {
  if (!startTime || !endTime) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  let currentMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  
  // Handle case where end time is next day
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
    if (currentMinutes < startMinutes) {
      currentMinutes += 24 * 60;
    }
  }
  
  return startMinutes <= currentMinutes && currentMinutes <= endMinutes;
};
