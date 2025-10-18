
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserStats } from '../types';
import { allAchievements } from '../pages/AchievementsPage';
import { useNotification } from './NotificationContext';
import { apiLogin } from '../services/apiService';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  login: (identifier: string, password: string, remember?: boolean, currentLat?: number, currentLon?: number) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'timeCredit' | 'stats' | 'achievements' | 'name' | 'family'> & { idCardNumber: string }) => void;
  updateUserStats: (statsUpdate: Partial<UserStats>) => void;
  processJobPayment: (requesterId: number, providerId: number, amount: number, jobTitle: string) => void;
  findUserByIdCard: (idCard: string) => User | undefined;
  transferCredits: (recipientId: number, amount: number) => { success: boolean, message: string };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('timebank-users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('timebank-currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const { showTrophy } = useNotification();

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('timebank-currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('timebank-currentUser');
    }
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem('timebank-users', JSON.stringify(users));
  }, [users]);


  const login = async (identifier: string, password: string, remember: boolean = false, currentLat?: number, currentLon?: number) => {
    try {
      const payload: any = { identifier, password };
      if (typeof remember === 'boolean') payload.remember = remember;
      if (typeof currentLat !== 'undefined') payload.currentLat = currentLat;
      if (typeof currentLon !== 'undefined') payload.currentLon = currentLon;

      const data = await apiLogin(payload);

      // Expecting { user, accessToken, refreshToken }
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      if (data?.user) {
        // Map API user shape to local `User` where possible. We'll set minimal fields.
        const apiUser = data.user;
        const mappedUser: User = {
          id: apiUser.userId || Date.now(),
          name: apiUser.name || apiUser.email || 'User',
          firstName: apiUser.firstName || '',
          lastName: apiUser.lastName || '',
          email: apiUser.email || identifier,
          idCardNumber: apiUser.idCardNumber || '',
          bio: apiUser.bio || '',
          skills: apiUser.skills || [],
          timeCredit: typeof apiUser.timeCredit === 'number' ? apiUser.timeCredit : 0,
          stats: apiUser.stats || { hoursGiven: 0, hoursReceived: 0, peopleHelped: 0, servicesCreated: 0 },
          achievements: apiUser.achievements || [],
          family: apiUser.family || [],
          avatarUrl: apiUser.avatarUrl,
        };

        setCurrentUser(mappedUser);
        // Optionally add or update users list
        setUsers(prev => {
          const exists = prev.find(u => u.id === mappedUser.id);
          if (exists) return prev.map(u => u.id === mappedUser.id ? mappedUser : u);
          return [...prev, mappedUser];
        });

        return { success: true };
      }

      return { success: false, message: 'Invalid response from server' };
    } catch (err: any) {
      // Re-throw or return structured error
      const status = err?.status || 500;
      if (status === 400) return { success: false, message: 'Missing field' };
      if (status === 401) return { success: false, message: 'Invalid password' };
      if (status === 403) return { success: false, message: 'Account pending verification' };
      return { success: false, message: err?.message || 'Server error' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (userData: Omit<User, 'id' | 'timeCredit' | 'stats' | 'achievements' | 'name' | 'family'> & { idCardNumber: string }) => {
    const newUser: User = {
      ...userData,
      id: Date.now(),
      name: `${userData.firstName} ${userData.lastName}`,
      timeCredit: 5,
      stats: { hoursGiven: 0, hoursReceived: 0, peopleHelped: 0, servicesCreated: 0 },
      achievements: [],
      family: [],
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const updateUserStats = (statsUpdate: Partial<UserStats>) => {
    if (!currentUser) return;

    const newStats = { ...currentUser.stats };
    let newAchievements = [...currentUser.achievements];
    let achievementUnlocked = false;

    if (statsUpdate.servicesCreated) {
        newStats.servicesCreated += statsUpdate.servicesCreated;
        if (newStats.servicesCreated >= 1 && !newAchievements.includes(1)) {
            newAchievements.push(1);
            achievementUnlocked = true;
        }
    }
    
    setCurrentUser(prev => prev ? { ...prev, stats: newStats, achievements: newAchievements } : null);
    
    if (achievementUnlocked) {
        const unlocked = allAchievements.find(a => a.id === newAchievements[newAchievements.length - 1]);
        if(unlocked) showTrophy(unlocked);
    }
  };
  
  const processJobPayment = (requesterId: number, providerId: number, amount: number, jobTitle: string) => {
    setUsers(prevUsers => 
        prevUsers.map(user => {
            if (user.id === requesterId) {
                return { 
                    ...user, 
                    timeCredit: user.timeCredit - amount,
                    stats: { ...user.stats, hoursReceived: (user.stats.hoursReceived || 0) + amount }
                };
            }
            if (user.id === providerId) {
                return {
                    ...user,
                    timeCredit: user.timeCredit + amount,
                    stats: { 
                        ...user.stats, 
                        hoursGiven: (user.stats.hoursGiven || 0) + amount,
                        peopleHelped: (user.stats.peopleHelped || 0) + 1
                    }
                };
            }
            return user;
        })
    );
    if (currentUser) {
        if (currentUser.id === requesterId) {
            setCurrentUser(prev => prev ? { ...prev, timeCredit: prev.timeCredit - amount, stats: { ...prev.stats, hoursReceived: (prev.stats.hoursReceived || 0) + amount } } : null);
        } else if (currentUser.id === providerId) {
            setCurrentUser(prev => prev ? { ...prev, timeCredit: prev.timeCredit + amount, stats: { ...prev.stats, hoursGiven: (prev.stats.hoursGiven || 0) + amount, peopleHelped: (prev.stats.peopleHelped || 0) + 1 } } : null);
        }
    }
  };

  const findUserByIdCard = (idCard: string): User | undefined => {
    return users.find(u => u.idCardNumber === idCard);
  };

  const transferCredits = (recipientId: number, amount: number) => {
      if (!currentUser) {
          return { success: false, message: "You are not logged in." };
      }
      if (currentUser.timeCredit < amount) {
          return { success: false, message: "Insufficient credits." };
      }

      setUsers(prevUsers => 
          prevUsers.map(user => {
              if (user.id === currentUser.id) {
                  return { ...user, timeCredit: user.timeCredit - amount };
              }
              if (user.id === recipientId) {
                  return { ...user, timeCredit: user.timeCredit + amount };
              }
              return user;
          })
      );
      
      setCurrentUser(prev => prev ? { ...prev, timeCredit: prev.timeCredit - amount } : null);
      
      return { success: true, message: "Transfer successful!" };
  };

  return (
    <UserContext.Provider value={{ currentUser, users, login, logout, register, updateUserStats, processJobPayment, findUserByIdCard, transferCredits }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
