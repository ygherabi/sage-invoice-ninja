
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, deleteInvoice } from '@/lib/supabase';
import { type Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, File, FileText, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices(data || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les factures.",
        });
        console.error('Error fetching invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDeleteInvoice = async (id: string) => {
    try {
      const { error } = await deleteInvoice(id);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer la facture.",
        });
        return;
      }
      
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      
      toast({
        title: "Suppression réussie",
        description: "La facture a été supprimée.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
            <CheckCircle size={14} />
            Traité
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800">
            <AlertCircle size={14} />
            Erreur
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
            <Clock size={14} />
            En attente
          </span>
        );
      case 'validated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            <CheckCircle size={14} />
            Validé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
          <p className="text-sm text-gray-500 mb-4">
            Vous n'avez pas encore téléversé de factures à analyser.
          </p>
          <Button asChild>
            <Link to="/upload">Téléverser une facture</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableCaption>Liste de vos factures</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <File className="h-4 w-4 mr-2" />
                  {invoice.title}
                </div>
              </TableCell>
              <TableCell>{invoice.supplier || '-'}</TableCell>
              <TableCell>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : '-'}</TableCell>
              <TableCell>
                {invoice.total_amount ? 
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.total_amount) 
                  : '-'}
              </TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/invoices/${invoice.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Voir</span>
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. La facture sera définitivement supprimée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)} className="bg-red-600 hover:bg-red-700">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceList;
