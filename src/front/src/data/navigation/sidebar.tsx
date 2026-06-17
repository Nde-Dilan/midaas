import React from "react";

export interface SidebarItem {
  key: number;
  title: string;
  link: string;
  // Role guarding array. If empty or undefined, it's public for all authenticated profiles.
  allowedRoles?: ("ROLE_CLIENT" | "ROLE_FRANCHISEE" | "ROLE_ADMIN")[];
  icon: {
    default: React.JSX.Element;
    active?: React.JSX.Element;
  };
}

export const sidebar: SidebarItem[] = [
  {
    key: 1,
    title: "Dashboard",
    link: "/admin/dashboard",
    // Everyone sees this, but the page content itself changes dynamically
    /**Investors see financial performance; Entrepreneurs see active campaigns & fund disbursement status. */
    icon: {
      default: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_4430_18)">
            <path
              d="M7.6629 2.96748C7.61928 2.92575 7.56124 2.90247 7.50088 2.90247C7.44052 2.90247 7.38249 2.92575 7.33887 2.96748L1.94532 8.11992C1.92241 8.14183 1.90419 8.16816 1.89175 8.19731C1.87932 8.22647 1.87292 8.25785 1.87296 8.28955L1.87208 13.1253C1.87208 13.3739 1.97085 13.6124 2.14667 13.7882C2.32248 13.964 2.56094 14.0628 2.80958 14.0628H5.62501C5.74933 14.0628 5.86855 14.0134 5.95646 13.9255C6.04437 13.8376 6.09376 13.7184 6.09376 13.594V9.60966C6.09376 9.5475 6.11845 9.48789 6.1624 9.44393C6.20636 9.39998 6.26597 9.37529 6.32813 9.37529H8.67188C8.73404 9.37529 8.79365 9.39998 8.83761 9.44393C8.88156 9.48789 8.90626 9.5475 8.90626 9.60966V13.594C8.90626 13.7184 8.95564 13.8376 9.04355 13.9255C9.13146 14.0134 9.25068 14.0628 9.375 14.0628H12.1893C12.4379 14.0628 12.6764 13.964 12.8522 13.7882C13.028 13.6124 13.1268 13.3739 13.1268 13.1253V8.28955C13.1268 8.25785 13.1204 8.22647 13.108 8.19731C13.0955 8.16816 13.0773 8.14183 13.0544 8.11992L7.6629 2.96748Z"
              fill="#5E0E08"
            />
            <path
              d="M14.3825 7.15369L12.1911 5.0572V1.87585C12.1911 1.75153 12.1417 1.63231 12.0538 1.5444C11.9659 1.45649 11.8467 1.4071 11.7223 1.4071H10.3161C10.1918 1.4071 10.0725 1.45649 9.98462 1.5444C9.89672 1.63231 9.84733 1.75153 9.84733 1.87585V2.81335L8.15046 1.19089C7.99167 1.03035 7.75554 0.938354 7.50036 0.938354C7.24606 0.938354 7.01052 1.03035 6.85173 1.19119L0.620284 7.1531C0.438057 7.32888 0.415206 7.61804 0.581026 7.80847C0.622666 7.85654 0.673651 7.89563 0.730879 7.92337C0.788107 7.9511 0.85038 7.96691 0.913909 7.96981C0.977438 7.97272 1.04089 7.96266 1.10041 7.94026C1.15993 7.91787 1.21427 7.88359 1.26013 7.83953L7.33923 2.03054C7.38284 1.98882 7.44088 1.96553 7.50124 1.96553C7.5616 1.96553 7.61963 1.98882 7.66325 2.03054L13.7429 7.83953C13.8325 7.92541 13.9524 7.97228 14.0765 7.96986C14.2006 7.96745 14.3186 7.91594 14.4048 7.82663C14.5846 7.64031 14.5697 7.33269 14.3825 7.15369Z"
              fill="#5E0E08"
            />
          </g>
          <defs>
            <clipPath id="clip0_4430_18">
              <rect width="15" height="15" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      active: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_4430_18)">
            <path
              d="M7.6629 2.96748C7.61928 2.92575 7.56124 2.90247 7.50088 2.90247C7.44052 2.90247 7.38249 2.92575 7.33887 2.96748L1.94532 8.11992C1.92241 8.14183 1.90419 8.16816 1.89175 8.19731C1.87932 8.22647 1.87292 8.25785 1.87296 8.28955L1.87208 13.1253C1.87208 13.3739 1.97085 13.6124 2.14667 13.7882C2.32248 13.964 2.56094 14.0628 2.80958 14.0628H5.62501C5.74933 14.0628 5.86855 14.0134 5.95646 13.9255C6.04437 13.8376 6.09376 13.7184 6.09376 13.594V9.60966C6.09376 9.5475 6.11845 9.48789 6.1624 9.44393C6.20636 9.39998 6.26597 9.37529 6.32813 9.37529H8.67188C8.73404 9.37529 8.79365 9.39998 8.83761 9.44393C8.88156 9.48789 8.90626 9.5475 8.90626 9.60966V13.594C8.90626 13.7184 8.95564 13.8376 9.04355 13.9255C9.13146 14.0134 9.25068 14.0628 9.375 14.0628H12.1893C12.4379 14.0628 12.6764 13.964 12.8522 13.7882C13.028 13.6124 13.1268 13.3739 13.1268 13.1253V8.28955C13.1268 8.25785 13.1204 8.22647 13.108 8.19731C13.0955 8.16816 13.0773 8.14183 13.0544 8.11992L7.6629 2.96748Z"
              fill="#fff"
            />
            <path
              d="M14.3825 7.15369L12.1911 5.0572V1.87585C12.1911 1.75153 12.1417 1.63231 12.0538 1.5444C11.9659 1.45649 11.8467 1.4071 11.7223 1.4071H10.3161C10.1918 1.4071 10.0725 1.45649 9.98462 1.5444C9.89672 1.63231 9.84733 1.75153 9.84733 1.87585V2.81335L8.15046 1.19089C7.99167 1.03035 7.75554 0.938354 7.50036 0.938354C7.24606 0.938354 7.01052 1.03035 6.85173 1.19119L0.620284 7.1531C0.438057 7.32888 0.415206 7.61804 0.581026 7.80847C0.622666 7.85654 0.673651 7.89563 0.730879 7.92337C0.788107 7.9511 0.85038 7.96691 0.913909 7.96981C0.977438 7.97272 1.04089 7.96266 1.10041 7.94026C1.15993 7.91787 1.21427 7.88359 1.26013 7.83953L7.33923 2.03054C7.38284 1.98882 7.44088 1.96553 7.50124 1.96553C7.5616 1.96553 7.61963 1.98882 7.66325 2.03054L13.7429 7.83953C13.8325 7.92541 13.9524 7.97228 14.0765 7.96986C14.2006 7.96745 14.3186 7.91594 14.4048 7.82663C14.5846 7.64031 14.5697 7.33269 14.3825 7.15369Z"
              fill="#fff"
            />
          </g>
          <defs>
            <clipPath id="clip0_4430_18">
              <rect width="15" height="15" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
  },
  {
    key: 2,
    title: "Explore Projects",
    link: "/admin/projects",
    // Visible to investors and entrepreneurs — not admin
    allowedRoles: ["ROLE_CLIENT", "ROLE_FRANCHISEE"],
    icon: {
      default: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5E0E08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
      active: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
    },
  },
  {
    key: 3,
    title: "My Portfolio",
    link: "/admin/portfolio",
    // Strictly limited to investors tracking their capital injections
    /**Clean tabular list of only projects the user has committed capital to */
    allowedRoles: ["ROLE_CLIENT"],
    icon: {
      default: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5E0E08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
      active: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
    },
  },
  {
    key: 4,
    title: "My Campaigns",
    link: "/admin/my-campaigns",
    // Strictly limited to entrepreneurs viewing their operational campaigns
    /**Clean operational list of projects they created, where they can submit milestone completion proofs. */
    allowedRoles: ["ROLE_FRANCHISEE"],
    icon: {
      default: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5E0E08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
      active: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
    },
  },

  /* ─── Admin Section ──────────────────────────────────── */
  {
    key: 5,
    title: "Companies",
    link: "/admin/companies/pending",
    allowedRoles: ["ROLE_ADMIN"],
    icon: {
      default: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5E0E08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      active: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
  },
  {
    key: 6,
    title: "Campaigns",
    link: "/admin/campaigns/pending",
    allowedRoles: ["ROLE_ADMIN"],
    icon: {
      default: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5E0E08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
      active: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
    },
  },
  {
    key: 7,
    title: "Entrepreneurs",
    link: "/admin/entrepreneurs",
    allowedRoles: ["ROLE_ADMIN"],
    icon: {
      default: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5E0E08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      active: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
  },
  {
    key: 8,
    title: "Users",
    link: "/admin/users",
    allowedRoles: ["ROLE_ADMIN"],
    icon: {
      default: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5E0E08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      active: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
  },
];
