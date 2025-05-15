
export type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  company?: string | null;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  user_id: string;
  title: string;
  supplier?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  total_amount?: number | null;
  tax_amount?: number | null;
  status: 'pending' | 'processed' | 'error' | 'validated';
  file_path?: string | null;
  file_type?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
};

export type InvoiceField = {
  id: string;
  invoice_id: string;
  field_name: string;
  field_value?: string | null;
  confidence?: number | null;
  position_data?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type ExtractionTemplate = {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  schema: Record<string, any>;
  created_at: string;
  updated_at: string;
};
