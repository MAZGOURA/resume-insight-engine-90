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

interface NotificationRequest {
  requestId: string;
  status: string;
  rejectionReason?: string;
}

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
      sender: { name: 'ISFO Casablanca', email: 'noreply@isfo.ma' },
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
  // Try Brevo first, then fallback to SendGrid
  const brevoKey = Deno.env.get('BREVO_API_KEY');
  const sgKey = Deno.env.get('SENDGRID_API_KEY');

  if (!brevoKey && !sgKey) throw new Error('No email provider configured');

  if (brevoKey) {
    try {
      await sendWithBrevo(toEmail, toName, subject, html);
      console.log('Email sent via Brevo');
      return;
    } catch (e) {
      console.error('Brevo error:', e);
    }
  }

  if (sgKey) {
    try {
      await sendWithSendGrid(toEmail, toName, subject, html);
      console.log('Email sent via SendGrid');
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
    const { requestId, status, rejectionReason }: NotificationRequest = await req.json();

    // Get request details with student info
    const { data: request, error: requestError } = await supabase
      .from('attestation_requests')
      .select(`
        *,
        students:student_id (
          first_name,
          last_name,
          email,
          student_group
        )
      `)
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error('Demande non trouvée');
    }

    const student = request.students;
    if (!student) {
      throw new Error('Informations étudiant non trouvées');
    }

    let subject = "";
    let html = "";

    if (status === 'approved') {
      subject = "✅ Attestation approuvée - Prête pour retrait";
      html = `
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
          <div style=\"background: #059669; color: white; padding: 20px; text-align: center;\">
            <h1>✅ Attestation Approuvée</h1>
          </div>
          <div style=\"padding: 20px;\">
            <p>Bonjour <strong>${student.first_name} ${student.last_name}</strong>,</p>
            <p>Bonne nouvelle ! Votre demande d'attestation de poursuite de formation a été <strong>approuvée</strong>.</p>
            
            <div style=\"background: #f0fdf4; border: 1px solid #059669; border-radius: 8px; padding: 15px; margin: 20px 0;\">
              <h3 style=\"color: #059669; margin-top: 0;\">📄 Votre attestation est prête</h3>
              <p><strong>Groupe :</strong> ${student.student_group}</p>
              <p><strong>Date d'approbation :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <div style=\"background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;\">
              <h3 style=\"color: #f59e0b; margin-top: 0;\">📍 Retrait du document</h3>
              <p>Votre attestation est maintenant disponible au <strong>secrétariat de la direction</strong> de l'Institut Spécialisé de Formation de l'Offshoring - Casablanca.</p>
              <p>Veuillez vous présenter avec une pièce d'identité pour récupérer votre document.</p>
            </div>

            <p>Merci de votre confiance.</p>
          </div>
          <div style=\"background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666;\">
            Institut Spécialisé de Formation de l'Offshoring - Casablanca<br>
            Office de la Formation Professionnelle et de la Promotion du Travail
          </div>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = "❌ Demande d'attestation refusée";
      html = `
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
          <div style=\"background: #dc2626; color: white; padding: 20px; text-align: center;\">
            <h1>❌ Demande Refusée</h1>
          </div>
          <div style=\"padding: 20px;\">
            <p>Bonjour <strong>${student.first_name} ${student.last_name}</strong>,</p>
            <p>Nous regrettons de vous informer que votre demande d'attestation de poursuite de formation a été <strong>refusée</strong>.</p>
            
            <div style=\"background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0;\">
              <h3 style=\"color: #dc2626; margin-top: 0;\">📋 Détails du refus</h3>
              <p><strong>Groupe :</strong> ${student.student_group}</p>
              <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              ${rejectionReason ? `<p><strong>Motif :</strong> ${rejectionReason}</p>` : ''}
            </div>

            <div style=\"background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;\">
              <h3 style=\"color: #3b82f6; margin-top: 0;\">💡 Que faire maintenant ?</h3>
              <p>Si vous pensez qu'il y a une erreur ou si vous souhaitez des clarifications, veuillez contacter le secrétariat de la direction.</p>
              <p>Vous pouvez soumettre une nouvelle demande après avoir résolu les problèmes mentionnés.</p>
            </div>
          </div>
          <div style=\"background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666;\">
            Institut Spécialisé de Formation de l'Offshoring - Casablanca<br>
            Office de la Formation Professionnelle et de la Promotion du Travail
          </div>
        </div>
      `;
    }

    await sendEmail(student.email, `${student.first_name} ${student.last_name}`, subject, html);

    return new Response(
      JSON.stringify({ message: "Notification envoyée avec succès" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);