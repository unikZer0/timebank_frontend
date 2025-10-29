
import React from 'react';

export interface UserStub {
  id: number;
  name: string;
  avatarUrl?: string;
}

export interface UserStats {
  hoursGiven: number;
  hoursReceived: number;
  peopleHelped: number;
  servicesCreated: number;
}

export interface User extends UserStub {
  firstName: string;
  lastName: string;
  email: string;
  idCardNumber: string;
  skills: string[];
  timeCredit: number;
  stats: UserStats;
  achievements: number[]; // array of achievement IDs
  family: number[]; // array of user IDs
}

export interface Service {
  id: number;
  title: string;
  duration: number;
  unit: 'ชั่วโมง' | 'นาที' | 'วัน' | string;
  imageUrl: string;
  user: UserStub;
}

export interface Comment {
    id: number;
    text: string;
    user: UserStub;
}

export interface Reactions {
    [key: string]: number;
}

export interface ServiceRequest {
    id: number;
    title: string;
    description: string;
    user: UserStub;
    comments: Comment[];
    reactions: Reactions;
    duration: number;
    unit: string;
    start_time: string; // Required - HH:MM format
    end_time: string; // Required - HH:MM format
    status: 'open' | 'in_progress' | 'completed';
    applicants: UserStub[];
    selectedProvider: UserStub | null;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
}

export interface FamilyMember {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    id_card_number: string;
    avatar_url?: string;
}

export interface TransferHistory {
    id: number;
    from_user_id: number;
    to_user_id: number;
    amount: number;
    created_at: string;
    from_first_name: string;
    from_last_name: string;
    to_first_name: string;
    to_last_name: string;
}

export interface Transaction {
    id: number;
    from_user_id: number | null;
    to_user_id: number | null;
    amount: number;
    type: 'transfer' | 'job_completion';
    created_at: string; // ISO string format
    from_first_name?: string;
    from_last_name?: string;
    to_first_name?: string;
    to_last_name?: string;
}
