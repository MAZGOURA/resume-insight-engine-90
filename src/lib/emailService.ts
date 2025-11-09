// Email notification service
// This would typically integrate with services like SendGrid, AWS SES, or similar

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (template: EmailTemplate): Promise<boolean> => {
  // In a real implementation, this would send emails via an email service
  // For now, we'll just log the email content
  console.log('Email would be sent:', {
    to: template.to,
    subject: template.subject,
    html: template.html,
  });
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const createOrderConfirmationEmail = (
  customerEmail: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>
): EmailTemplate => {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return {
    to: customerEmail,
    subject: `Order Confirmation #${orderId.slice(-8)} - ANAS FRAGRANCES`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50;">Thank you for your order!</h1>
            <p>Dear ${customerName},</p>
            <p>We're excited to confirm your order #${orderId.slice(-8)}. Your luxury fragrances are being prepared for shipment.</p>
            
            <h2 style="color: #2c3e50; margin-top: 30px;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Quantity</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; margin: 20px 0;">
              <h3 style="color: #2c3e50;">Total: $${totalAmount.toFixed(2)}</h3>
            </div>
            
            <p>We'll send you another email when your order ships. If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>The ANAS FRAGRANCES Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Thank you for your order #${orderId.slice(-8)}. Total: $${totalAmount.toFixed(2)}. We'll send you another email when your order ships.`,
  };
};

export const createOrderUpdateEmail = (
  customerEmail: string,
  customerName: string,
  orderId: string,
  status: string,
  trackingNumber?: string
): EmailTemplate => {
  const statusMessages = {
    processing: 'Your order is being prepared for shipment.',
    shipped: 'Your order has been shipped and is on its way!',
    delivered: 'Your order has been delivered successfully.',
    cancelled: 'Your order has been cancelled.',
  };

  const message = statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.';

  return {
    to: customerEmail,
    subject: `Order Update #${orderId.slice(-8)} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50;">Order Update</h1>
            <p>Dear ${customerName},</p>
            <p>${message}</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Order #${orderId.slice(-8)}</h3>
              <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
              ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
            </div>
            
            <p>You can track your order status anytime by visiting your account page.</p>
            
            <p>Best regards,<br>The ANAS FRAGRANCES Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Order #${orderId.slice(-8)} status: ${status}. ${message}`,
  };
};

export const createWishlistNotificationEmail = (
  customerEmail: string,
  customerName: string,
  productName: string,
  productPrice: number,
  productImage: string
): EmailTemplate => {
  return {
    to: customerEmail,
    subject: `${productName} is back in stock! - ANAS FRAGRANCES`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Wishlist Item Available</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50;">Great news!</h1>
            <p>Dear ${customerName},</p>
            <p>An item from your wishlist is now back in stock!</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <img src="${productImage}" alt="${productName}" style="max-width: 200px; height: auto; margin-bottom: 15px;">
              <h3 style="color: #2c3e50; margin: 10px 0;">${productName}</h3>
              <p style="font-size: 18px; font-weight: bold; color: #e74c3c;">$${productPrice.toFixed(2)}</p>
              <a href="${window.location.origin}/product/${productName.toLowerCase().replace(/\s+/g, '-')}" 
                 style="display: inline-block; background-color: #2c3e50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                View Product
              </a>
            </div>
            
            <p>Don't miss out - this item may sell out quickly!</p>
            
            <p>Best regards,<br>The ANAS FRAGRANCES Team</p>
          </div>
        </body>
      </html>
    `,
    text: `${productName} is back in stock for $${productPrice.toFixed(2)}! Don't miss out.`,
  };
};

export const createPriceDropEmail = (
  customerEmail: string,
  customerName: string,
  productName: string,
  oldPrice: number,
  newPrice: number,
  productImage: string
): EmailTemplate => {
  const savings = oldPrice - newPrice;
  const savingsPercent = Math.round((savings / oldPrice) * 100);

  return {
    to: customerEmail,
    subject: `Price Drop Alert: ${productName} - ${savingsPercent}% off!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Price Drop Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #e74c3c;">Price Drop Alert!</h1>
            <p>Dear ${customerName},</p>
            <p>A product you're interested in has dropped in price!</p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <img src="${productImage}" alt="${productName}" style="max-width: 200px; height: auto; margin-bottom: 15px;">
              <h3 style="color: #2c3e50; margin: 10px 0;">${productName}</h3>
              <div style="margin: 15px 0;">
                <span style="text-decoration: line-through; color: #666; font-size: 16px;">$${oldPrice.toFixed(2)}</span>
                <span style="font-size: 24px; font-weight: bold; color: #e74c3c; margin-left: 10px;">$${newPrice.toFixed(2)}</span>
              </div>
              <div style="background-color: #e74c3c; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0;">
                Save $${savings.toFixed(2)} (${savingsPercent}% off!)
              </div>
              <br>
              <a href="${window.location.origin}/product/${productName.toLowerCase().replace(/\s+/g, '-')}" 
                 style="display: inline-block; background-color: #2c3e50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                Shop Now
              </a>
            </div>
            
            <p>This special price won't last long - shop now to secure your savings!</p>
            
            <p>Best regards,<br>The ANAS FRAGRANCES Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Price drop alert: ${productName} is now $${newPrice.toFixed(2)} (was $${oldPrice.toFixed(2)}) - Save $${savings.toFixed(2)}!`,
  };
};
