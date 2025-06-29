import { create } from 'zustand';
import { User, LoanRequest, Notification, Language } from '../types';

interface AppState {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // UI state
  currentLanguage: Language;
  isDarkMode: boolean;
  isVoiceNavigationActive: boolean;
  
  // Data state
  loanRequests: LoanRequest[];
  notifications: Notification[];
  isLoading: boolean;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setCurrentLanguage: (language: Language) => void;
  toggleDarkMode: () => void;
  toggleVoiceNavigation: () => void;
  setLoanRequests: (requests: LoanRequest[]) => void;
  addLoanRequest: (request: LoanRequest) => void;
  updateLoanRequest: (id: string, updates: Partial<LoanRequest>) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  currentLanguage: 'en',
  isDarkMode: false,
  isVoiceNavigationActive: false,
  loanRequests: [],
  notifications: [],
  isLoading: false,
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setCurrentLanguage: (language) => set({ currentLanguage: language }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  toggleVoiceNavigation: () => set((state) => ({ 
    isVoiceNavigationActive: !state.isVoiceNavigationActive 
  })),
  setLoanRequests: (requests) => set({ loanRequests: requests }),
  addLoanRequest: (request) => set((state) => ({ 
    loanRequests: [request, ...state.loanRequests] 
  })),
  updateLoanRequest: (id, updates) => set((state) => ({
    loanRequests: state.loanRequests.map(req => 
      req.id === id ? { ...req, ...updates } : req
    )
  })),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    )
  })),
  setLoading: (isLoading) => set({ isLoading })
}));