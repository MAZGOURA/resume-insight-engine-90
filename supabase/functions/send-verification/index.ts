import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

async function sendWithBrevo(toEmail: string, toName: string, subject: string, html: string) {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  if (!apiKey) throw new Error('BREVO_API_KEY not set');

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'ISFO Casablanca', email: 'noreyply@isfo.ma' },
      to: [{ email: toEmail, name: toName }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo failed: ${res.status} ${text}`);
  }
}

async function sendWithSendGrid(toEmail: string, toName: string, subject: string, html: string) {
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  if (!apiKey) throw new Error('SENDGRID_API_KEY not set');

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: 'noreply@isfo.ma', name: 'ISFO Casablanca' },
      personalizations: [
        { to: [{ email: toEmail, name: toName }], subject }
      ],
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendGrid failed: ${res.status} ${text}`);
  }
}

async function sendEmail(toEmail: string, toName: string, subject: string, html: string) {
  const brevoKey = Deno.env.get('BREVO_API_KEY');
  const sgKey = Deno.env.get('SENDGRID_API_KEY');

  if (!brevoKey && !sgKey) throw new Error('No email provider configured');

  if (brevoKey) {
    try {
      await sendWithBrevo(toEmail, toName, subject, html);
      console.log('Verification email sent via Brevo');
      return;
    } catch (e) {
      console.error('Brevo error:', e);
    }
  }

  if (sgKey) {
    try {
      await sendWithSendGrid(toEmail, toName, subject, html);
      console.log('Verification email sent via SendGrid');
      return;
    } catch (e) {
      console.error('SendGrid error:', e);
    }
  }

  throw new Error('All providers failed');
}

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

    const html = `
      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;\">
        <div style=\"background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;\">
          <h1 style=\"margin: 0; font-size: 28px; font-weight: bold;\">🔐 Code de Vérification</h1>
          <p style=\"margin: 10px 0 0 0; opacity: 0.9;\">Demande d'Attestation de Scolarité</p>
        </div>
        <div style=\"padding: 30px; background: #f8fafc;\">
          <p style=\"font-size: 16px; color: #334155; margin-bottom: 20px;\">
            Bonjour <strong style=\"color: #1e293b;\">${student.first_name} ${student.last_name}</strong>,
          </p>
          <p style=\"font-size: 16px; color: #475569; margin-bottom: 25px;\">
            Votre code de vérification pour votre demande d'attestation est :
          </p>
          
          <div style=\"background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);\">
            <div style=\"font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;\">
              ${code}
            </div>
          </div>

          <div style=\"background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;\">
            <p style=\"color: #92400e; margin: 0; font-size: 14px;\">
              ⏰ <strong>Important :</strong> Ce code expire dans <strong>10 minutes</strong>
            </p>
          </div>

          <p style=\"font-size: 14px; color: #64748b; margin-top: 25px;\">
            Si vous n'avez pas fait cette demande, ignorez cet email.
          </p>
        </div>
        <div style=\"background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 12px 12px;\">
          <p style=\"margin: 0;\">Institut Spécialisé de Formation de l'Offshoring - Casablanca</p>
          <p style=\"margin: 5px 0 0 0;\">Office de la Formation Professionnelle et de la Promotion du Travail</p>
        </div>
      </div>
    `;

    await sendEmail(email, `${student.first_name} ${student.last_name}`, "🔐 Code de vérification - Demande d'attestation", html);

    return new Response(
      JSON.stringify({ 
        message: "Code de vérification envoyé à votre email",
        student: {
          first_name: student.first_name,
          last_name: student.last_name,
          student_group: student.student_group
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-verification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);