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

interface OrderNotificationRequest {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zip_code: string;
    phone: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderNotificationRequest = await req.json();
    console.log("Processing order notification:", data.orderNumber);

    // Send email to customer
    const customerEmail = await sendEmail({
      from: "ANAS FRAGRANCES <onboarding@resend.dev>",
      to: [data.customerEmail],
      subject: `Order Confirmation #${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Order Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                We're excited to confirm your order <strong>#${data.orderNumber}</strong>. 
                Your luxury fragrances are being prepared for shipment.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                  <thead>
                    <tr style="border-bottom: 2px solid #ddd;">
                      <th style="padding: 10px; text-align: left;">Product</th>
                      <th style="padding: 10px; text-align: center;">Qty</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.items.map(item => `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px;">${item.name}</td>
                        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                        <td style="padding: 10px; text-align: right;">${item.price.toFixed(2)} MAD</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div style="text-align: right; padding: 15px 0; border-top: 2px solid #667eea;">
                  <h3 style="color: #667eea; margin: 0;">Total: ${data.totalAmount.toFixed(2)} MAD</h3>
                </div>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #667eea; margin-top: 0;">Shipping Address</h3>
                <p style="margin: 5px 0;"><strong>${data.shippingAddress.name}</strong></p>
                <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
                <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.zip_code}</p>
                <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                We'll send you another email when your order ships. If you have any questions, 
                please don't hesitate to contact us.
              </p>
              
              <p style="font-size: 16px; margin-top: 30px;">
                Best regards,<br>
                <strong>The ANAS FRAGRANCES Team</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    // Send notification to admin
    const adminEmail = await sendEmail({
      from: "ANAS FRAGRANCES <onboarding@resend.dev>",
      to: ["anasmoudkiri2@gmail.com"],
      subject: `New Order Received - #${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>New Order Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #667eea; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🎉 New Order Received!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h2 style="margin-top: 0; color: #667eea;">Order #${data.orderNumber}</h2>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
                <p><strong>Total Amount:</strong> ${data.totalAmount.toFixed(2)} MAD</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #667eea; margin-top: 0;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 2px solid #ddd;">
                      <th style="padding: 10px; text-align: left;">Product</th>
                      <th style="padding: 10px; text-align: center;">Quantity</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.items.map(item => `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px;">${item.name}</td>
                        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                        <td style="padding: 10px; text-align: right;">${item.price.toFixed(2)} MAD</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h3 style="color: #667eea; margin-top: 0;">Shipping Details</h3>
                <p style="margin: 5px 0;"><strong>${data.shippingAddress.name}</strong></p>
                <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
                <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.zip_code}</p>
                <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://dhoofnyfooqpplprlbkw.supabase.co/dashboard/project/dhoofnyfooqpplprlbkw" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View in Admin Dashboard
                </a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Emails sent successfully:", { customerEmail, adminEmail });

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmailId: customerEmail.id,
        adminEmailId: adminEmail.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending order notification:", error);
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
