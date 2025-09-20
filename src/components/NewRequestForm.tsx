import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StudentAuth } from './StudentAuth';
import { GraduationCap, Send, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  cin: string;
  email: string;
  birth_date: string;
  formation_level: string;
  speciality: string;
  student_group: string;
  inscription_number: string;
  formation_type: string;
  formation_mode: string;
  formation_year: string;
  requestCount: number;
}

interface AttestationRequest {
  id: string;
  status: string;
  created_at: string;
  rejection_reason?: string;
}

export const NewRequestForm: React.FC = () => {
  const [authenticatedStudent, setAuthenticatedStudent] = useState<Student | null>(null);
  const [studentRequests, setStudentRequests] = useState<AttestationRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (authenticatedStudent) {
      fetchStudentRequests();
    }
  }, [authenticatedStudent]);

  const fetchStudentRequests = async () => {
    if (!authenticatedStudent) return;

    try {
      const { data, error } = await supabase
        .from('attestation_requests')
        .select('*')
        .eq('student_id', authenticatedStudent.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudentRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const canSubmitRequest = () => {
    if (!authenticatedStudent) return false;
    return authenticatedStudent.requestCount < 3;
  };

  const handleSubmitRequest = async () => {
    if (!authenticatedStudent) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('attestation_requests')
        .insert({
          student_id: authenticatedStudent.id,
          first_name: authenticatedStudent.first_name,
          last_name: authenticatedStudent.last_name,
          cin: authenticatedStudent.cin,
          email: authenticatedStudent.email,
          student_group: authenticatedStudent.student_group as any,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "✅ Demande envoyée",
        description: "Votre demande d'attestation a été soumise avec succès. Vous recevrez un email de notification lors du traitement.",
      });

      // Refresh requests and update count
      await fetchStudentRequests();
      setAuthenticatedStudent(prev => prev ? {...prev, requestCount: prev.requestCount + 1} : null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la soumission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setAuthenticatedStudent(null);
    setStudentRequests([]);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (!authenticatedStudent) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-academic-light to-white flex items-center justify-center p-4">
      <div className="container mx-auto p-4 space-y-6">
        <NewRequestForm />
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-light to-white p-4">
      <div className="container mx-auto p-4 space-y-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header avec bouton de déconnexion */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Espace Étudiant</h1>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-border/50 hover:border-primary hover:bg-primary/5"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>

        {/* Student Info Card */}
        <Card className="mb-6 shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <GraduationCap className="w-6 h-6" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Bienvenue {authenticatedStudent.first_name} {authenticatedStudent.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-primary">Groupe:</span> {authenticatedStudent.student_group}
              </div>
              <div>
                <span className="font-medium text-primary">CIN:</span> {authenticatedStudent.cin}
              </div>
              <div>
                <span className="font-medium text-primary">Email:</span> {authenticatedStudent.email}
              </div>
              <div>
                <span className="font-medium text-primary">Demandes cette année:</span> 
                <span className={`ml-1 font-bold ${authenticatedStudent.requestCount >= 3 ? 'text-destructive' : 'text-success'}`}>
                  {authenticatedStudent.requestCount}/3
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Request Card */}
        <Card className="mb-6 shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Nouvelle Demande d'Attestation</CardTitle>
            <CardDescription>
              {canSubmitRequest() 
                ? `Vous pouvez encore faire ${3 - authenticatedStudent.requestCount} demande(s) cette année`
                : "Vous avez atteint la limite de 3 demandes par année"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSubmitRequest}
              disabled={!canSubmitRequest() || isSubmitting}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isSubmitting ? (
                "Envoi en cours..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Faire une nouvelle demande
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Requests History Card */}
        <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Historique des Demandes</CardTitle>
            <CardDescription>
              Vos demandes d'attestation et leur statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune demande trouvée
              </p>
            ) : (
              <div className="space-y-4">
                {studentRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="font-medium">
                            Demande du {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {request.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Motif du refus:</span> {request.rejection_reason}
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'approved' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          ✅ Votre attestation est prête pour retrait au secrétariat de la direction
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Présentez-vous avec votre CIN pour récupérer votre attestation originale.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};
