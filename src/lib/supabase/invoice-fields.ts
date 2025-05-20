
import { supabase } from '@/integrations/supabase/client';
import { type InvoiceField } from '@/types';

// Invoice Fields functions
export const getInvoiceFields = async (invoiceId: string) => {
  const { data, error } = await supabase
    .from('invoice_fields')
    .select('*')
    .eq('invoice_id', invoiceId);
  
  if (error) console.error(`Error fetching fields for invoice ${invoiceId}:`, error);
  return data as InvoiceField[] | null;
};

// Type with required field_name
export type CreateInvoiceFieldParams = {
  field_name: string;
} & Partial<Omit<InvoiceField, 'field_name'>>;

export const createInvoiceField = async (field: CreateInvoiceFieldParams) => {
  // Make sure we're inserting a single object, not an array
  const { data, error } = await supabase
    .from('invoice_fields')
    .insert(field)
    .select()
    .single();
  
  return { data, error };
};

export const updateInvoiceField = async (id: string, field: Partial<InvoiceField>) => {
  const { data, error } = await supabase
    .from('invoice_fields')
    .update(field)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};
