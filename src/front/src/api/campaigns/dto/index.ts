/* ─── Risk Zone ──────────────────────────── */
export interface RiskZoneDto {
  description: string;
  severity: string;
  mitigation: string;
}

/* ─── Use of Funds Item ─────────────────── */
export interface UseOfFundDto {
  category: string;
  amount: number;
  percentage: number;
  details: string;
}

/* ─── Milestone (batch-created with project) ─ */
export interface MilestoneBatchDto {
  title: string;
  description: string;
  order_num: number;
  fund_allocation: number;
  due_date?: string;
}

/* ─── Create Campaign / Project ─────────── */
export interface CreateCampaignDto {
  title: string;
  description: string;
  funding_goal: number;
  company_id?: string;
  currency?: string;
  category?: string;
  cover_image_url?: string;
  start_date?: string;
  end_date?: string;

  // ROI & Break-even
  short_term_roi?: number;
  short_term_months?: number;
  medium_term_roi?: number;
  medium_term_months?: number;
  long_term_roi?: number;
  long_term_months?: number;
  break_even_months?: number;

  // Risk
  risk_zones?: RiskZoneDto[];

  // Fund allocation
  use_of_funds?: UseOfFundDto[];

  // Documents
  business_plan_docs?: string[];
  financial_projections?: string[];

  // Analysis & Background
  market_analysis?: string;
  competitive_advantage?: string;
  team_background?: string;

  // Milestones (batch)
  milestones?: MilestoneBatchDto[];
}

/* ─── Update Campaign / Project ─────────── */
export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  status?: string;
}
