import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, GraduationCap } from 'lucide-react';

interface StudentAuthProps {
  onAuthenticated: (student: any) => void;
}

export const StudentAuth: React.FC<StudentAuthProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email domain
    if (!email.endsWith('@ofppt-edu.ma')) {
      toast({
        title: "Email invalide",
        description: "Il faut utiliser un email qui contient @ofppt-edu.ma. Si vous n'avez pas cet email, veuillez venir à la direction pour le récupérer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: { email }
      });

      if (error) throw error;

      setStudentInfo(data.student);
      setStep('code');
      toast({
        title: "Code envoyé",
        description: "Un code de vérification a été envoyé à votre email",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi du code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the verify-code edge function
      const { data: verifyResponse, error: verifyError } = await supabase.functions.invoke('verify-code', {
        body: {
          email: email,
          code: code.trim()
        }
      });

      if (verifyError || !verifyResponse.success) {
        throw new Error(verifyResponse?.error || 'Code invalide ou expiré');
      }

      const studentData = verifyResponse.student;

      // Sign in the user with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: code.trim() // Use the verification code as password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        // If sign in fails, try to sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: code.trim(),
          options: {
            emailRedirectTo: undefined
          }
        });
        
        if (signUpError) {
          console.error('Sign up error:', signUpError);
        }
      }

      // Get student's request count for the current year
      const requestCount = await supabase.rpc('get_student_request_count', {
        student_email: email
      });

      const studentWithRequestCount = {
        ...studentData,
        requestCount: requestCount.data || 0
      };

      toast({
        title: "Authentification réussie",
        description: `Bienvenue ${studentData.first_name} ${studentData.last_name}`,
      });

      onAuthenticated(studentWithRequestCount);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Code invalide ou expiré",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-academic-light to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Authentification Étudiant
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Entrez votre email OFPPT pour recevoir un code de vérification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email OFPPT</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre-matricule@ofppt-edu.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? "Envoi en cours..." : "Envoyer le code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-light to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Code de vérification
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {studentInfo && (
              <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="font-medium text-primary">{studentInfo.first_name} {studentInfo.last_name}</p>
                <p className="text-sm text-muted-foreground">Groupe: {studentInfo.student_group}</p>
              </div>
            )}
            Entrez le code de 6 chiffres envoyé à votre email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                disabled={isLoading}
                className="text-center text-lg tracking-widest border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-border/50 hover:border-primary hover:bg-primary/5"
                onClick={() => setStep('email')}
                disabled={isLoading}
              >
                Retour
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? "Vérification..." : "Vérifier"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};