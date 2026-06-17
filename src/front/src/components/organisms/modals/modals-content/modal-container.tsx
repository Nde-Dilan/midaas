"use client";

import { ModalNames, useModalStore } from "@/store/modal";
import { Dialog, DialogContent } from "@/components/organisms/modals/modal";
import AddLocataireModal from "./locataires/add-locataire";
import AddGoodsAppartmentModal from "./mes-biens/add-goods-appartment";
import ProfileDetailModal from "./profile/profile-detail";
import DownloadReportModal from "./report/download-report";
import AddGoodsStarterModal from "./mes-biens/add-goods-starter";
import AddGoodsVillaModal from "./mes-biens/add-goods-villa";
import AddGoodsBuildingModal from "./mes-biens/add-goods-building";
import AddGoodsLocalModal from "./mes-biens/add-goods-local";
import PublishCommuniqueModal from "./communique/publish-communique";
import LocationDetailsModal from "./location/location-details";
import MakePaymentModal from "./location/make-payment";
import ContractDocumentDetailsModal from "./contract/contract-document";
import ViewEditTenantModal from "./locataires/view-edit-locataire";
import ConfirmDelete from "./mes-biens/confirm-delete";
import EditContract from "./contract/edit-contract";
import AddContractModal from "./contract/add-contract";
import AddParrainModal from "./parrainage/add-parrain";
import ViewParrainModal from "./parrainage/view-parrain";
import AddFilleulModal from "./parrainage/add-filleul";
import ViewFilleulModal from "./parrainage/view-filleul";
import ViewBonusModal from "./bonus/view-bonus";
import AwardBonusModal from "./bonus/award-bonus";
import AddCampaignModal from "./campaigns/add-campaign";
import CampaignDetailsModal from "./campaigns/campaign-details";
import AddMilestoneModal from "./campaigns/add-milestone";
import AddCompanyModal from "./dashboard/add-company";
import ConfirmActionModal from "./admin/confirm-action";
import InvestModal from "./investment/invest-modal";

export default function ModalContainer() {
  const { open, toggle, name } = useModalStore();

  const displayContent = () => {
    switch (name) {
      case ModalNames.ADD_LOCATAIRE: {
        return <AddLocataireModal />;
      }

      case ModalNames.ADD_GOODS_STARTER: {
        return <AddGoodsStarterModal />;
      }

      case ModalNames.ADD_GOODS_APPARTMENT: {
        return <AddGoodsAppartmentModal />;
      }

      case ModalNames.ADD_GOODS_VILLA: {
        return <AddGoodsVillaModal />;
      }

      case ModalNames.ADD_GOODS_BUILDING: {
        return <AddGoodsBuildingModal />;
      }

      case ModalNames.ADD_GOODS_LOCAL: {
        return <AddGoodsLocalModal />;
      }

      case ModalNames.PROFILE_DETAIL: {
        return <ProfileDetailModal />;
      }

      case ModalNames.DOWNLOAD_REPORT: {
        return <DownloadReportModal />;
      }

      case ModalNames.PUBLISH_COMMUNIQUE: {
        return <PublishCommuniqueModal />;
      }

      case ModalNames.VIEW_EDIT_LOCATAIRE: {
        return <ViewEditTenantModal />;
      }

      case ModalNames.LOCATION_DETAILS: {
        return <LocationDetailsModal />;
      }

      case ModalNames.MAKE_PAYMENT: {
        return <MakePaymentModal />;
      }

      case ModalNames.CONTRACT_DETAILS: {
        return <ContractDocumentDetailsModal />;
      }

      case ModalNames.ADD_CONTRACT: {
        return <AddContractModal />;
      }

      case ModalNames.CONFIRM_DELETE_TENANT: {
        return <ConfirmDelete />;
      }
      case ModalNames.CONFIRM_DELETE: {
        return <ConfirmDelete />;
      }

      case ModalNames.CONFIRM_DELETE_PROPERTY: {
        return <ConfirmDelete />;
      }

      case ModalNames.EDIT_CONTRACT: {
        return <EditContract />;
      }

      case ModalNames.ADD_PARRAIN: {
        return <AddParrainModal />;
      }

      case ModalNames.VIEW_PARRAIN: {
        return <ViewParrainModal />;
      }

      case ModalNames.ADD_FILLEUL: {
        return <AddFilleulModal />;
      }

      case ModalNames.VIEW_FILLEUL: {
        return <ViewFilleulModal />;
      }

      case ModalNames.VIEW_BONUS: {
        return <ViewBonusModal />;
      }

      case ModalNames.AWARD_BONUS: {
        return <AwardBonusModal />;
      }

      case ModalNames.ADD_CAMPAIGN:
      case ModalNames.EDIT_CAMPAIGN: {
        return <AddCampaignModal />;
      }

      case ModalNames.CAMPAIGN_DETAILS: {
        return <CampaignDetailsModal />;
      }

      case ModalNames.ADD_MILESTONE: {
        return <AddMilestoneModal />;
      }

      case ModalNames.ADD_COMPANY: {
        return <AddCompanyModal />;
      }

      case ModalNames.CONFIRM_ACTION: {
        return <ConfirmActionModal />;
      }

      case ModalNames.INVEST_MODAL: {
        return <InvestModal />;
      }

      default:
        return null;
    }
  };

  return (
    <section className="">
      <Dialog
        open={open}
        onOpenChange={() => {}}
        //  onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogContent className="max-h-[90%] overflow-auto p-0 scrollable sm:min-w-lg">
          {displayContent()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
