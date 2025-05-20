
import { supabase } from '@/integrations/supabase/client';
import { type Invoice } from '@/types';

// Invoice functions
export const getInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) console.error('Error fetching invoices:', error);
  return data as Invoice[] | null;
};

export const getInvoice = async (id: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) console.error(`Error fetching invoice ${id}:`, error);
  return data as Invoice | null;
};

// Type pour créer une nouvelle facture avec un status typé explicitement
export type CreateInvoiceParams = {
  user_id: string;
  title: string;
  status?: 'pending' | 'processed' | 'error' | 'validated';
} & Partial<Omit<Invoice, 'user_id' | 'title' | 'status'>>;

// Type pour mettre à jour une facture existante avec un status typé explicitement
export type UpdateInvoiceParams = {
  id: string;
  status?: 'pending' | 'processed' | 'error' | 'validated';
} & Partial<Omit<Invoice, 'id' | 'status'>>;

export const createInvoice = async (invoice: CreateInvoiceParams | UpdateInvoiceParams) => {
  // Check if this is an update (has id) or a create operation
  if ('id' in invoice) {
    // This is an update operation
    const { id, ...updateData } = invoice;
    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } else {
    // This is a create operation
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
    
    return { data, error };
  }
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
  const { data, error } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

export const deleteInvoice = async (id: string) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  return { error };
};
