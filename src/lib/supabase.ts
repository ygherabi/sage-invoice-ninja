

import { supabase } from '@/integrations/supabase/client';
import { type Profile, type Invoice, type InvoiceField, type ExtractionTemplate } from '@/types';

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) console.error('Error fetching profile:', error);
  return data as Profile | null;
};

export const updateProfile = async (profile: Partial<Profile>) => {
  const user = await getCurrentUser();
  if (!user) return { error: new Error('User not authenticated') };
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)
    .select()
    .single();
  
  return { data, error };
};

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

// Correction : Nous devons spécifier un type qui garantit que les champs obligatoires sont présents
type CreateInvoiceParams = {
  user_id: string;
  title: string;
} & Partial<Omit<Invoice, 'user_id' | 'title'>>;

export const createInvoice = async (invoice: CreateInvoiceParams) => {
  // Make sure we're inserting a single object, not an array
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
  
  return { data, error };
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

// Invoice Fields functions
export const getInvoiceFields = async (invoiceId: string) => {
  const { data, error } = await supabase
    .from('invoice_fields')
    .select('*')
    .eq('invoice_id', invoiceId);
  
  if (error) console.error(`Error fetching fields for invoice ${invoiceId}:`, error);
  return data as InvoiceField[] | null;
};

// Correction : Nous devons spécifier un type qui garantit que field_name est obligatoire
type CreateInvoiceFieldParams = {
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

// Extraction Templates functions
export const getExtractionTemplates = async () => {
  const { data, error } = await supabase
    .from('extraction_templates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) console.error('Error fetching templates:', error);
  return data as ExtractionTemplate[] | null;
};

export const getExtractionTemplate = async (id: string) => {
  const { data, error } = await supabase
    .from('extraction_templates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) console.error(`Error fetching template ${id}:`, error);
  return data as ExtractionTemplate | null;
};

// Correction : Nous devons spécifier un type qui garantit que name et schema sont obligatoires
type CreateExtractionTemplateParams = {
  name: string;
  schema: Record<string, any>;
} & Partial<Omit<ExtractionTemplate, 'name' | 'schema'>>;

export const createExtractionTemplate = async (template: CreateExtractionTemplateParams) => {
  // Make sure we're inserting a single object, not an array
  const { data, error } = await supabase
    .from('extraction_templates')
    .insert(template)
    .select()
    .single();
  
  return { data, error };
};

// File Storage functions
export const uploadInvoiceFile = async (file: File, filePath: string) => {
  const { data, error } = await supabase.storage
    .from('invoices')
    .upload(filePath, file);
  
  return { data, error };
};

export const getInvoiceFileUrl = async (filePath: string) => {
  const { data } = await supabase.storage
    .from('invoices')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
