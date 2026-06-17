import Milestone from "./milestone";

/* ─── Risk Zone ──────────────────────────── */
export interface RiskZone {
  description: string;
  severity: string;
  mitigation: string;
}

/* ─── Use of Funds Item ─────────────────── */
export interface UseOfFund {
  category: string;
  amount: number;
  percentage: number;
  details: string;
}

/* ─── Project / Campaign Interface ──────── */
export interface IProject {
  id: string;
  company_id?: string;
  entrepreneur_id?: string;
  title: string;
  description: string;
  funding_goal: number;
  funding_raised?: number;
  currency?: string;
  status?: string;
  category?: string;
  cover_image_url?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  milestones?: Milestone[];

  // ROI & Break-even
  short_term_roi?: number;
  short_term_months?: number;
  medium_term_roi?: number;
  medium_term_months?: number;
  long_term_roi?: number;
  long_term_months?: number;
  break_even_months?: number;

  // Risk & Funds
  risk_zones?: RiskZone[];
  use_of_funds?: UseOfFund[];

  // Documents & Analysis
  business_plan_docs?: string[];
  financial_projections?: string[];
  market_analysis?: string;
  competitive_advantage?: string;
  team_background?: string;
}

export default class Project {
  private _id: string;
  private _companyId?: string;
  private _entrepreneurId?: string;
  private _title: string;
  private _description: string;
  private _fundingGoal: number;
  private _fundingRaised: number;
  private _currency: string;
  private _status: string;
  private _category: string;
  private _coverImageUrl: string;
  private _startDate?: Date;
  private _endDate?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _milestones: Milestone[];

  // ROI & Break-even
  private _shortTermRoi?: number;
  private _shortTermMonths?: number;
  private _mediumTermRoi?: number;
  private _mediumTermMonths?: number;
  private _longTermRoi?: number;
  private _longTermMonths?: number;
  private _breakEvenMonths?: number;

  // Risk & Funds
  private _riskZones: RiskZone[];
  private _useOfFunds: UseOfFund[];

  // Documents & Analysis
  private _businessPlanDocs: string[];
  private _financialProjections: string[];
  private _marketAnalysis: string;
  private _competitiveAdvantage: string;
  private _teamBackground: string;

  constructor(data: IProject) {
    this._id = data.id;
    this._companyId = data.company_id;
    this._entrepreneurId = data.entrepreneur_id;
    this._title = data.title;
    this._description = data.description;
    this._fundingGoal = data.funding_goal;
    this._fundingRaised = data.funding_raised ?? 0;
    this._currency = data.currency ?? "XOF";
    this._status = data.status ?? "draft";
    this._category = data.category ?? "";
    this._coverImageUrl = data.cover_image_url ?? "";
    this._startDate = data.start_date ? new Date(data.start_date) : undefined;
    this._endDate = data.end_date ? new Date(data.end_date) : undefined;
    this._createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this._updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
    this._milestones = data.milestones?.map((m) => new Milestone(m)) ?? [];

    this._shortTermRoi = data.short_term_roi;
    this._shortTermMonths = data.short_term_months;
    this._mediumTermRoi = data.medium_term_roi;
    this._mediumTermMonths = data.medium_term_months;
    this._longTermRoi = data.long_term_roi;
    this._longTermMonths = data.long_term_months;
    this._breakEvenMonths = data.break_even_months;

    this._riskZones = data.risk_zones ?? [];
    this._useOfFunds = data.use_of_funds ?? [];

    this._businessPlanDocs = data.business_plan_docs ?? [];
    this._financialProjections = data.financial_projections ?? [];
    this._marketAnalysis = data.market_analysis ?? "";
    this._competitiveAdvantage = data.competitive_advantage ?? "";
    this._teamBackground = data.team_background ?? "";
  }

  get id(): string {
    return this._id;
  }

  get companyId(): string | undefined {
    return this._companyId;
  }

  get entrepreneurId(): string | undefined {
    return this._entrepreneurId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get fundingGoal(): number {
    return this._fundingGoal;
  }

  get fundingRaised(): number {
    return this._fundingRaised;
  }

  get currency(): string {
    return this._currency;
  }

  get status(): string {
    return this._status;
  }

  get category(): string {
    return this._category;
  }

  get coverImageUrl(): string {
    return this._coverImageUrl;
  }

  get startDate(): Date | undefined {
    return this._startDate;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get milestones(): Milestone[] {
    return this._milestones;
  }

  // ── ROI & Break-even ───────────────────
  get shortTermRoi(): number | undefined {
    return this._shortTermRoi;
  }
  get shortTermMonths(): number | undefined {
    return this._shortTermMonths;
  }
  get mediumTermRoi(): number | undefined {
    return this._mediumTermRoi;
  }
  get mediumTermMonths(): number | undefined {
    return this._mediumTermMonths;
  }
  get longTermRoi(): number | undefined {
    return this._longTermRoi;
  }
  get longTermMonths(): number | undefined {
    return this._longTermMonths;
  }
  get breakEvenMonths(): number | undefined {
    return this._breakEvenMonths;
  }

  // ── Risk & Funds ───────────────────────
  get riskZones(): RiskZone[] {
    return this._riskZones;
  }
  get useOfFunds(): UseOfFund[] {
    return this._useOfFunds;
  }

  // ── Docs & Analysis ────────────────────
  get businessPlanDocs(): string[] {
    return this._businessPlanDocs;
  }
  get financialProjections(): string[] {
    return this._financialProjections;
  }
  get marketAnalysis(): string {
    return this._marketAnalysis;
  }
  get competitiveAdvantage(): string {
    return this._competitiveAdvantage;
  }
  get teamBackground(): string {
    return this._teamBackground;
  }

  get progressPercentage(): number {
    if (this._fundingGoal <= 0) return 0;
    return Math.min(
      100,
      Math.round((this._fundingRaised / this._fundingGoal) * 100),
    );
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      draft: "Draft",
      pending: "Pending",
      active: "Active",
      funded: "Funded",
      completed: "Completed",
      blocked: "Blocked",
      rejected: "Rejected",
    };
    return labels[this._status] || this._status;
  }

  get statusColor(): string {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      funded: "bg-green-100 text-green-800",
      completed: "bg-emerald-100 text-emerald-800",
      blocked: "bg-red-100 text-red-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[this._status] || "bg-gray-100 text-gray-800";
  }

  update(data: Partial<IProject>): void {
    if (data.title !== undefined) this._title = data.title;
    if (data.description !== undefined) this._description = data.description;
    if (data.funding_goal !== undefined) this._fundingGoal = data.funding_goal;
    if (data.funding_raised !== undefined)
      this._fundingRaised = data.funding_raised;
    if (data.currency !== undefined) this._currency = data.currency;
    if (data.status !== undefined) this._status = data.status;
    if (data.category !== undefined) this._category = data.category;
    if (data.cover_image_url !== undefined)
      this._coverImageUrl = data.cover_image_url;
    if (data.start_date !== undefined)
      this._startDate = new Date(data.start_date);
    if (data.end_date !== undefined) this._endDate = new Date(data.end_date);
    if (data.milestones !== undefined) {
      this._milestones = data.milestones.map((m) => new Milestone(m));
    }

    // ROI & Break-even
    if (data.short_term_roi !== undefined)
      this._shortTermRoi = data.short_term_roi;
    if (data.short_term_months !== undefined)
      this._shortTermMonths = data.short_term_months;
    if (data.medium_term_roi !== undefined)
      this._mediumTermRoi = data.medium_term_roi;
    if (data.medium_term_months !== undefined)
      this._mediumTermMonths = data.medium_term_months;
    if (data.long_term_roi !== undefined)
      this._longTermRoi = data.long_term_roi;
    if (data.long_term_months !== undefined)
      this._longTermMonths = data.long_term_months;
    if (data.break_even_months !== undefined)
      this._breakEvenMonths = data.break_even_months;

    // Risk & Funds
    if (data.risk_zones !== undefined) this._riskZones = data.risk_zones;
    if (data.use_of_funds !== undefined) this._useOfFunds = data.use_of_funds;

    // Docs & Analysis
    if (data.business_plan_docs !== undefined)
      this._businessPlanDocs = data.business_plan_docs;
    if (data.financial_projections !== undefined)
      this._financialProjections = data.financial_projections;
    if (data.market_analysis !== undefined)
      this._marketAnalysis = data.market_analysis;
    if (data.competitive_advantage !== undefined)
      this._competitiveAdvantage = data.competitive_advantage;
    if (data.team_background !== undefined)
      this._teamBackground = data.team_background;
  }
}
