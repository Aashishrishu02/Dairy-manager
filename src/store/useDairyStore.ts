import { create } from 'zustand';
import { Member, getAllMembers, getRateForFat } from '../db/database';

interface DairyStore {
  members: Member[];
  selectedDate: string;
  selectedSession: 'AM' | 'PM';
  language: 'en' | 'hi';
  refreshMembers: () => void;
  setDate: (date: string) => void;
  setSession: (s: 'AM' | 'PM') => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  computeAmount: (litres: number, fat: number) => { rate: number; amount: number };
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export const useDairyStore = create<DairyStore>((set) => ({
  members: [],
  selectedDate: todayStr(),
  selectedSession: new Date().getHours() < 12 ? 'AM' : 'PM',
  language: 'en',

  refreshMembers: () => {
    const members = getAllMembers();
    set({ members });
  },

  setDate: (date) => set({ selectedDate: date }),
  setSession: (session) => set({ selectedSession: session }),
  setLanguage: (language) => set({ language }),

  computeAmount: (litres, fat) => {
    const rate = getRateForFat(fat);
    return { rate, amount: Math.round(litres * rate * 100) / 100 };
  },
}));
