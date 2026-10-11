import { create } from "zustand";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "lawyer" | "reviewer" | "admin";
  firm_id: number;
  firm_name?: string;
}

export const DEMO_INDIAN_USERS: Record<string, UserProfile> = {
  rohit: {
    id: 1,
    name: "Adv. Rohit Kulkarni",
    email: "rohit@chandrarao.law",
    role: "lawyer",
    firm_id: 1,
    firm_name: "Chandra & Rao Associates (Mumbai)",
  },
  meera: {
    id: 2,
    name: "Adv. Meera Rao (Senior Partner)",
    email: "meera.rao@chandrarao.law",
    role: "admin",
    firm_id: 1,
    firm_name: "Chandra & Rao Associates (Mumbai)",
  },
  arjun: {
    id: 4,
    name: "Adv. Arjun Sharma",
    email: "arjun@nyayavault.in",
    role: "lawyer",
    firm_id: 2,
    firm_name: "NyayaVault India Platform (New Delhi)",
  },
  priya: {
    id: 5,
    name: "Adv. Priya Narayanan (Managing Partner)",
    email: "priya@nyayavault.in",
    role: "admin",
    firm_id: 2,
    firm_name: "NyayaVault India Platform (New Delhi)",
  },
};

interface AppState {
  currentUser: UserProfile;
  activeJobId: number | null;
  pendingCount: number;
  setCurrentUser: (user: UserProfile) => void;
  switchDemoRole: (role: "lawyer" | "admin") => void;
  switchDemoFirm: (firmId: 1 | 2) => void;
  setActiveJobId: (id: number | null) => void;
  setPendingCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: DEMO_INDIAN_USERS.rohit,
  activeJobId: null,
  pendingCount: 0,

  setCurrentUser: (user) => set({ currentUser: user }),

  switchDemoRole: (role) => {
    const current = get().currentUser;
    if (current.firm_id === 1) {
      set({
        currentUser: role === "admin" ? DEMO_INDIAN_USERS.meera : DEMO_INDIAN_USERS.rohit,
      });
    } else {
      set({
        currentUser: role === "admin" ? DEMO_INDIAN_USERS.priya : DEMO_INDIAN_USERS.arjun,
      });
    }
  },

  switchDemoFirm: (firmId) => {
    const current = get().currentUser;
    const isPartner = current.role === "admin";
    if (firmId === 1) {
      set({
        activeJobId: null,
        pendingCount: 0,
        currentUser: isPartner ? DEMO_INDIAN_USERS.meera : DEMO_INDIAN_USERS.rohit,
      });
    } else {
      set({
        activeJobId: null,
        pendingCount: 0,
        currentUser: isPartner ? DEMO_INDIAN_USERS.priya : DEMO_INDIAN_USERS.arjun,
      });
    }
  },

  setActiveJobId: (id) => set({ activeJobId: id }),
  setPendingCount: (count) => set({ pendingCount: count }),
}));
