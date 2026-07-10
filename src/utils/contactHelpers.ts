
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactFormSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(254),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
  whatsappOptIn: z.boolean().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const submitContactForm = async (formData: ContactFormData) => {
  // Validate input before sending
  const parsed = contactFormSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Invalid input";
    toast.error(firstError);
    throw new Error(firstError);
  }

  try {
    const { data, error } = await supabase.rpc('insert_contact', {
      p_full_name: parsed.data.fullName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone,
      p_subject: parsed.data.subject,
      p_message: parsed.data.message,
      p_whatsapp_opted_in: parsed.data.whatsappOptIn || false
    });

    if (error) {
      toast.error("Failed to submit your message. Please try again.");
      throw error;
    }

    toast.success("Your message has been sent successfully!");
    return data;
  } catch (error) {
    if (!(error instanceof Error && error.message.includes("Invalid"))) {
      toast.error("Failed to submit your message. Please try again.");
    }
    throw error;
  }
};

// This function initiates a WhatsApp conversation with the provided phone number
export const initiateWhatsAppChat = (phone: string = "9765550265", message: string = "Thank you for contacting EduWarn Nepal!") => {
  const formattedPhone = phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  toast.success("Opening WhatsApp chat");
};

// This function opens a Zoom meeting
export const createZoomMeeting = (contactEmail: string, topic: string = "EduWarn Nepal Session") => {
  window.open('https://zoom.us/join', '_blank');
  toast.success("Redirecting to Zoom");
};
