import { supabase } from "@/lib/supabase/client";

export const outletService = {
  async getOutlets() {
    const { data, error } = await supabase
      .from("outlets")
      .select("*")
      .order("name");
    if (error) throw error;
    return data ?? [];
  },

  async getOutlet(id: string) {
    const { data, error } = await supabase
      .from("outlets")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateOutlet(
    id: string,
    updates: {
      name?: string;
      address?: string;
      phone?: string;
      tax_rate?: number;
      service_charge_rate?: number;
      receipt_header?: string;
      receipt_footer?: string;
    }
  ) {
    const { error } = await supabase
      .from("outlets")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  },
};
