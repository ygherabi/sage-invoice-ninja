
import { supabase } from '@/integrations/supabase/client';
import { type ExtractionTemplate } from '@/types';

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

// Type with required name and schema
export type CreateExtractionTemplateParams = {
  name: string;
  schema: Record<string, any>;
  is_public?: boolean;
  user_id?: string;
};

export const createExtractionTemplate = async (template: CreateExtractionTemplateParams) => {
  // Make sure we're inserting a single object, not an array
  const { data, error } = await supabase
    .from('extraction_templates')
    .insert(template)
    .select()
    .single();
  
  return { data, error };
};
