import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface VerificationRequest {
  email: string;
}

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY non configuré");
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: {
          email: Deno.env.get("SMTP_FROM") || "noreply@isfo.ma",
          name: "OFPPT ISFO"
        },
        content: [{
          type: "text/html",
          value: html
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid API error:", response.status, errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log("Email sent via SendGrid to:", to);
    return { success: true, provider: "sendgrid" };
  } catch (error) {
    console.error("SendGrid failed:", error);
    throw new Error("Échec d'envoi email via SendGrid");
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: VerificationRequest = await req.json();

    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (studentError || !student) {
      console.log("Student not found for email:", email);
      return new Response(
        JSON.stringify({ error: "Email d'étudiant non trouvé dans la base de données" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting verification code:', insertError);
      throw new Error('Erreur lors de la génération du code');
    }

    // Send email via SendGrid
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Code de vérification</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">Bonjour <strong>${student.first_name} ${student.last_name}</strong>,</p>
          <p style="margin: 0 0 20px 0; color: #64748b;">Votre code de vérification pour la demande d'attestation est :</p>
          
          <div style="background: #ffffff; padding: 20px; text-align: center; border-radius: 6px; border: 2px solid #e2e8f0; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #2563eb; font-family: monospace;">${code}</span>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #dc2626;">⏰ Ce code expire dans 10 minutes.</p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            Institut Spécialisé de Formation de l'Offshoring - Casablanca
          </p>
        </div>
      </div>
    `;

    await sendEmail(email, "Code de vérification - Demande d'attestation", emailHtml);

    console.log("Verification code sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        message: "Code de vérification envoyé à votre email",
        student: {
          first_name: student.first_name,
          last_name: student.last_name,
          student_group: student.student_group
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur lors de l'envoi de l'email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);