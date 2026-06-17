import { create } from "zustand";
import type {
  AdminProfile,
  AdminCompanyItem,
  AdminEntrepreneurItem,
  AdminUserItem,
  AdminProjectItem,
  AdminMilestoneItem,
} from "@/api/admin";

type State = {
  // Auth
  admin: AdminProfile | null;
  loaded: boolean;

  // Companies
  pendingCompanies: AdminCompanyItem[];
  pendingCompaniesLoading: boolean;

  // Entrepreneurs
  entrepreneurs: AdminEntrepreneurItem[];
  entrepreneursLoading: boolean;

  // Users
  users: AdminUserItem[];
  usersLoading: boolean;

  // Projects / Campaigns
  pendingProjects: AdminProjectItem[];
  pendingProjectsLoading: boolean;

  // Milestones
  pendingMilestones: AdminMilestoneItem[];
  pendingMilestonesLoading: boolean;
};

type Actions = {
  // Auth
  loadAdmin: (admin: AdminProfile) => void;
  clearAdmin: () => void;

  // Companies
  setPendingCompanies: (companies: AdminCompanyItem[]) => void;
  setPendingCompaniesLoading: (loading: boolean) => void;
  updateCompanyStatus: (id: string, status: string) => void;

  // Entrepreneurs
  setEntrepreneurs: (entrepreneurs: AdminEntrepreneurItem[]) => void;
  setEntrepreneursLoading: (loading: boolean) => void;
  updateEntrepreneurStatus: (id: string, status: string) => void;

  // Users
  setUsers: (users: AdminUserItem[]) => void;
  setUsersLoading: (loading: boolean) => void;

  // Projects
  setPendingProjects: (projects: AdminProjectItem[]) => void;
  setPendingProjectsLoading: (loading: boolean) => void;
  updateProjectStatus: (id: string, status: string) => void;

  // Milestones
  setPendingMilestones: (milestones: AdminMilestoneItem[]) => void;
  setPendingMilestonesLoading: (loading: boolean) => void;
  updateMilestoneStatus: (id: string, status: string) => void;
};

export const useAdminStore = create<State & Actions>((set) => ({
  // Initial state
  admin: null,
  loaded: false,
  pendingCompanies: [],
  pendingCompaniesLoading: false,
  entrepreneurs: [],
  entrepreneursLoading: false,
  users: [],
  usersLoading: false,
  pendingProjects: [],
  pendingProjectsLoading: false,
  pendingMilestones: [],
  pendingMilestonesLoading: false,

  // Auth
  loadAdmin(admin) {
    set({ admin, loaded: true });
  },
  clearAdmin() {
    set({ admin: null, loaded: false });
  },

  // Companies
  setPendingCompanies(companies) {
    set({ pendingCompanies: companies, pendingCompaniesLoading: false });
  },
  setPendingCompaniesLoading(loading) {
    set({ pendingCompaniesLoading: loading });
  },
  updateCompanyStatus(id, status) {
    set((state) => ({
      pendingCompanies: state.pendingCompanies.map((c) =>
        c.id === id ? { ...c, status } : c,
      ),
    }));
  },

  // Entrepreneurs
  setEntrepreneurs(entrepreneurs) {
    set({ entrepreneurs, entrepreneursLoading: false });
  },
  setEntrepreneursLoading(loading) {
    set({ entrepreneursLoading: loading });
  },
  updateEntrepreneurStatus(id, status) {
    set((state) => ({
      entrepreneurs: state.entrepreneurs.map((e) =>
        e.id === id ? { ...e, status } : e,
      ),
    }));
  },

  // Users
  setUsers(users) {
    set({ users, usersLoading: false });
  },
  setUsersLoading(loading) {
    set({ usersLoading: loading });
  },

  // Projects
  setPendingProjects(projects) {
    set({ pendingProjects: projects, pendingProjectsLoading: false });
  },
  setPendingProjectsLoading(loading) {
    set({ pendingProjectsLoading: loading });
  },
  updateProjectStatus(id, status) {
    set((state) => ({
      pendingProjects: state.pendingProjects.map((p) =>
        p.id === id ? { ...p, status } : p,
      ),
    }));
  },

  // Milestones
  setPendingMilestones(milestones) {
    set({ pendingMilestones: milestones, pendingMilestonesLoading: false });
  },
  setPendingMilestonesLoading(loading) {
    set({ pendingMilestonesLoading: loading });
  },
  updateMilestoneStatus(id, status) {
    set((state) => ({
      pendingMilestones: state.pendingMilestones.map((m) =>
        m.id === id ? { ...m, status } : m,
      ),
    }));
  },
}));
