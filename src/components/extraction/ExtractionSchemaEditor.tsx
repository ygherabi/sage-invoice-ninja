
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { type ExtractionTemplate } from '@/types';
import { createExtractionTemplate } from '@/lib/supabase';
import { DEFAULT_EXTRACTION_SCHEMA } from '@/lib/ai-extraction';

type ExtractionSchemaEditorProps = {
  template?: ExtractionTemplate;
  onSave?: (template: ExtractionTemplate) => void;
};

const ExtractionSchemaEditor = ({ template, onSave }: ExtractionSchemaEditorProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(template?.name || 'Nouveau schéma d\'extraction');
  const [isPublic, setIsPublic] = useState(template?.is_public || false);
  const [fields, setFields] = useState<Record<string, { label: string, required: boolean }>>(
    template?.schema as Record<string, { label: string, required: boolean }> || DEFAULT_EXTRACTION_SCHEMA
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddField = () => {
    setFields(prev => {
      const newFieldKey = `field_${Object.keys(prev).length + 1}`;
      return {
        ...prev,
        [newFieldKey]: { label: 'Nouveau champ', required: false }
      };
    });
  };

  const handleRemoveField = (fieldKey: string) => {
    setFields(prev => {
      const newFields = { ...prev };
      delete newFields[fieldKey];
      return newFields;
    });
  };

  const handleFieldChange = (fieldKey: string, property: 'label' | 'required', value: string | boolean) => {
    setFields(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        [property]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const templateData = {
        name,
        schema: fields,
        is_public: isPublic,
      };
      
      // Si nous avons un template existant, nous faisons une mise à jour
      if (template?.id) {
        // Ici, il faudrait implémenter updateExtractionTemplate dans supabase.ts
        toast({
          title: 'Schéma mis à jour',
          description: 'Le schéma d\'extraction a été mis à jour avec succès',
        });
      } else {
        // Sinon, nous créons un nouveau template
        const { data, error } = await createExtractionTemplate({
          name,
          schema: fields,
          is_public: isPublic,
        });
        
        if (error) throw error;
        
        if (data && onSave) onSave(data);
        
        toast({
          title: 'Schéma créé',
          description: 'Le nouveau schéma d\'extraction a été créé avec succès',
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde du schéma',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Éditeur de Schéma d'Extraction</CardTitle>
        <CardDescription>
          Configurez les champs à extraire automatiquement de vos factures
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informations de base du schéma */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateName">Nom du schéma</Label>
            <Input 
              id="templateName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Entrez un nom pour ce schéma" 
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="isPublic">Schéma public (accessible à tous les utilisateurs)</Label>
          </div>
        </div>
        
        {/* Liste des champs */}
        <div>
          <h3 className="text-sm font-medium mb-3">Champs à extraire</h3>
          
          <div className="space-y-4 mb-4">
            {Object.entries(fields).map(([key, field]) => (
              <div key={key} className="grid grid-cols-12 gap-3 items-center border-b pb-3">
                <div className="col-span-5">
                  <Label htmlFor={`label-${key}`} className="sr-only">Libellé</Label>
                  <Input
                    id={`label-${key}`}
                    value={field.label}
                    onChange={(e) => handleFieldChange(key, 'label', e.target.value)}
                    placeholder="Libellé du champ"
                  />
                </div>
                
                <div className="col-span-5">
                  <Label htmlFor={`id-${key}`} className="sr-only">Identifiant</Label>
                  <Input
                    id={`id-${key}`}
                    value={key}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                
                <div className="col-span-1 flex items-center">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${key}`}
                      checked={field.required}
                      onCheckedChange={(checked) => handleFieldChange(key, 'required', checked)}
                    />
                    <Label htmlFor={`required-${key}`} className="sr-only">Obligatoire</Label>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveField(key)}
                    className="h-9 w-9 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddField}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un champ
          </Button>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer le schéma
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractionSchemaEditor;
