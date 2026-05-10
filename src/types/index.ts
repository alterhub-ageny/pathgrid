export type Locale = 'en' | 'fr' | 'ar';

export type UserRole = 'admin' | 'staff' | 'client';

export type LeadStage = string;

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'income' | 'expense';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SeoProps {
  title: string;
  description: string;
  image?: string;
  locale?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  activeProjects: number;
  totalLeads: number;
  conversionRate: number;
  pendingInvoices: number;
  clientCount: number;
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  pipelineData: { stage: string; count: number; value: number }[];
}
