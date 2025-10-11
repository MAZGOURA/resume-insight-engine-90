import { supabase } from "@/integrations/supabase/client";

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  // Submit contact form data
  async submitContactForm(data: ContactFormData) {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([
          {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            subject: data.subject,
            message: data.message,
          }
        ]);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error };
    }
  },

  // Get all contacts (for admin panel)
  async getAllContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return { success: false, error };
    }
  },

  // Mark contact as read
  async markAsRead(contactId: string) {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_read: true })
        .eq('id', contactId);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error marking contact as read:', error);
      return { success: false, error };
    }
  }
};