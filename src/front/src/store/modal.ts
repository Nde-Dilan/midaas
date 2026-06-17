import { create } from "zustand";

export const ModalNames = {
  DEFAULT: "",
  DASHBOARD_TRANSACTION_DETAILS: "dashboard-transaction-details",
  ADD_LOCATAIRE: "add-locataire",
  CONFIRM_DELETE: "CONFIRM_DELETE",
  CONFIRM_DELETE_TENANT: "CONFIRM_DELETE_TENANT",
  CONFIRM_DELETE_PROPERTY: "CONFIRM_DELETE_PROPERTY",

  VIEW_EDIT_LOCATAIRE: "view-edit-locataire",
  //TODO: Implement this now
  CONFIRM_ACTION: "confirm-action",
  EDIT_ANNOUNCEMENT: "edit-announcement",
  ADD_GOODS_APPARTMENT: "add-goods-appartment",
  ADD_GOODS_VILLA: "add-goods-villa",
  ADD_GOODS_LOCAL: "add-goods-local",
  ADD_GOODS_BUILDING: "add-goods-building",
  ADD_GOODS_STARTER: "add-goods-starter",
  ADD_PAYMENT: "add-payment",
  PROFILE_DETAIL: "profile-detail",
  DOWNLOAD_REPORT: "download-report",

  PUBLISH_COMMUNIQUE: "publish-communique",

  ANNOUNCEMENT_STARTER: "announcement-starter",
  ANNOUNCEMENT_APPARTMENT: "announcement-appartment",
  ANNOUNCEMENT_VILLA: "announcement-villa",
  ANNOUNCEMENT_LOCAL: "announcement-local",
  ANNOUNCEMENT_BUILDING: "announcement-building",
  ANNOUNCEMENT_LAND: "announcement-land",
  CANDIDATURE_DETAILS: "candidature-details",

  LOCATION_DETAILS: "location-details",
  MAKE_PAYMENT: "make-payment",
  CONTRACT_DETAILS: "contract-details",

  PRICING: "pricing",

  PAYMENT_STARTER: "PAYMENT_STARTER",
  PAYMENT_VISA: "PAYMENT_VISA",
  PAYMENT_MOBILE_MONEY: "PAYMENT_MOBILE_MONEY",
  PAYMENT_ORANGE_MONEY: "PAYMENT_ORANGE_MONEY",
  PAYMENT_MASTER_CARD: "PAYMENT_MASTER_CARD",

  CREATE_CHAT: "CREATE_CHAT",

  ASSIGN_TECHNICIAN: "assign-technician",

  ADD_CONTRACT: "add-contract",
  EDIT_CONTRACT: "edit-contract",
  DELETE_CONTRACT: "delete-contract",
  ADD_PARRAIN: "add-parrain",
  VIEW_PARRAIN: "view-parrain",
  ADD_FILLEUL: "add-filleul",
  VIEW_FILLEUL: "view-filleul",
  VIEW_BONUS: "view-bonus",
  AWARD_BONUS: "award-bonus",

  // Campaigns
  ADD_CAMPAIGN: "add-campaign",
  EDIT_CAMPAIGN: "edit-campaign",
  CAMPAIGN_DETAILS: "campaign-details",
  ADD_MILESTONE: "add-milestone",

  // Company
  ADD_COMPANY: "add-company",

  // Investment
  INVEST_MODAL: "invest-modal",
} as const;

export type ModalNamesType = (typeof ModalNames)[keyof typeof ModalNames];

type State = {
  open: boolean;
  name: ModalNamesType;
  data: Record<string, unknown> | null;
};

type Actions = {
  toggle: (_?: {
    name: ModalNamesType;
    data?: Record<string, unknown>;
  }) => void;
  openModal: (_?: {
    name: ModalNamesType;
    data?: Record<string, unknown>;
  }) => void;
};

export const useModalStore = create<State & Actions>((set, get) => {
  return {
    open: false,
    name: ModalNames.DEFAULT,
    data: null,

    // ACTIONS
    toggle(payload) {
      const { name, data } = payload ?? {};

      const state = get();
      set({ open: !state.open, name, data: data ?? null });
    },

    openModal(payload) {
      const { name, data } = payload ?? {};

      set({ open: true, name, data: data ?? null });
    },
  };
});

/**
 * {
  "Message": "All rental agreement information",
  "Data": [
    {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "address of rentals": "string",
      "name of tenants": "string",
      "monthly amount": 0,
      "start_date": "2019-08-24",
      "status": "string",
      "payment_status": "string",
      "rental_contract_file_url": "string",
      "created_at": "2019-08-24T14:15:22Z"
    }
  ]
}

-------------------------------

{
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "property_id": "05003a8a-8f3c-454b-8884-a906ec46f5f5",
  "start_date": "2019-08-24",
  "end_date": "2019-08-24",
  "payment_status": "pending",
  "rentals_status": "pending",
  "rental_contract_file": "string"
}
 */
