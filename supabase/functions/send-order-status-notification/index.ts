import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(payload: any) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: string;
  action: 'cancel' | 'return';
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: StatusNotificationRequest = await req.json();
    console.log("Processing status notification:", data);

    const actionText = data.action === 'cancel' ? 'Cancellation' : 'Return';
    const actionColor = data.action === 'cancel' ? '#e74c3c' : '#f39c12';

    // Send notification to admin
    const adminEmail = await sendEmail({
      from: "ANAS FRAGRANCES <onboarding@resend.dev>",
      to: ["anasmoudkiri2@gmail.com"],
      subject: `Order ${actionText} Request - #${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Order ${actionText} Request</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${actionColor}; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">⚠️ Order ${actionText} Request</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${actionColor};">
                <h2 style="margin-top: 0; color: ${actionColor};">Order #${data.orderNumber}</h2>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
                <p><strong>Action:</strong> ${actionText}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>Action Required:</strong> Please review this ${data.action} request in the admin dashboard 
                  and process it accordingly.
                </p>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://dhoofnyfooqpplprlbkw.supabase.co/dashboard/project/dhoofnyfooqpplprlbkw" 
                   style="display: inline-block; background: ${actionColor}; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View in Admin Dashboard
                </a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Admin notification sent:", adminEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: adminEmail.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending status notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
