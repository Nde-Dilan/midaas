export interface IMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  order_num: number;
  fund_allocation: number;
  status?: string;
  due_date?: string;
  proof_docs?: any;
  proof_notes?: string;
  admin_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export default class Milestone {
  private _id: string;
  private _projectId: string;
  private _title: string;
  private _description: string;
  private _orderNum: number;
  private _fundAllocation: number;
  private _status: string;
  private _dueDate?: Date;
  private _proofDocs: any;
  private _proofNotes: string;
  private _adminFeedback: string;
  private _reviewedBy?: string;
  private _reviewedAt?: Date;
  private _paidAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(data: IMilestone) {
    this._id = data.id;
    this._projectId = data.project_id;
    this._title = data.title;
    this._description = data.description;
    this._orderNum = data.order_num;
    this._fundAllocation = data.fund_allocation;
    this._status = data.status ?? "pending";
    this._dueDate = data.due_date ? new Date(data.due_date) : undefined;
    this._proofDocs = data.proof_docs;
    this._proofNotes = data.proof_notes ?? "";
    this._adminFeedback = data.admin_feedback ?? "";
    this._reviewedBy = data.reviewed_by;
    this._reviewedAt = data.reviewed_at
      ? new Date(data.reviewed_at)
      : undefined;
    this._paidAt = data.paid_at ? new Date(data.paid_at) : undefined;
    this._createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this._updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
  }

  get id(): string {
    return this._id;
  }

  get projectId(): string {
    return this._projectId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get orderNum(): number {
    return this._orderNum;
  }

  get fundAllocation(): number {
    return this._fundAllocation;
  }

  get status(): string {
    return this._status;
  }

  get dueDate(): Date | undefined {
    return this._dueDate;
  }

  get proofDocs(): any {
    return this._proofDocs;
  }

  get proofNotes(): string {
    return this._proofNotes;
  }

  get adminFeedback(): string {
    return this._adminFeedback;
  }

  get reviewedBy(): string | undefined {
    return this._reviewedBy;
  }

  get reviewedAt(): Date | undefined {
    return this._reviewedAt;
  }

  get paidAt(): Date | undefined {
    return this._paidAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      pending: "Pending",
      active: "Active",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      paid: "Paid",
    };
    return labels[this._status] || this._status;
  }

  get statusColor(): string {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      active: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      paid: "bg-emerald-100 text-emerald-800",
    };
    return colors[this._status] || "bg-gray-100 text-gray-800";
  }
}
