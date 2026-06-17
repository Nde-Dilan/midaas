export interface ICompany {
  id: string;
  entrepreneur_id: string;
  status: string;
  legal_name: string;
  trade_name?: string;
  corporate_form: string;
  industry_sector?: string;
  gps_coordinates?: string;
  physical_address?: string;
  created_at?: string;
  updated_at?: string;
}

export default class Company {
  private _id: string;
  private _entrepreneurId: string;
  private _status: string;
  private _legalName: string;
  private _tradeName: string;
  private _corporateForm: string;
  private _industrySector: string;
  private _gpsCoordinates: string;
  private _physicalAddress: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(data: ICompany) {
    this._id = data.id;
    this._entrepreneurId = data.entrepreneur_id;
    this._status = data.status ?? "pending";
    this._legalName = data.legal_name;
    this._tradeName = data.trade_name ?? "";
    this._corporateForm = data.corporate_form;
    this._industrySector = data.industry_sector ?? "";
    this._gpsCoordinates = data.gps_coordinates ?? "";
    this._physicalAddress = data.physical_address ?? "";
    this._createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this._updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
  }

  get id(): string {
    return this._id;
  }

  get entrepreneurId(): string {
    return this._entrepreneurId;
  }

  get status(): string {
    return this._status;
  }

  get legalName(): string {
    return this._legalName;
  }

  get tradeName(): string {
    return this._tradeName;
  }

  get corporateForm(): string {
    return this._corporateForm;
  }

  get industrySector(): string {
    return this._industrySector;
  }

  get gpsCoordinates(): string {
    return this._gpsCoordinates;
  }

  get physicalAddress(): string {
    return this._physicalAddress;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      draft: "Draft",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      reverify_requested: "Re-verification",
    };
    return labels[this._status] || this._status;
  }

  get statusColor(): string {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      reverify_requested: "bg-purple-100 text-purple-800",
    };
    return colors[this._status] || "bg-gray-100 text-gray-800";
  }

  get displayName(): string {
    return this._tradeName || this._legalName;
  }
}
