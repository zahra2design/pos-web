import { supabase } from "@/lib/supabase/client";
import type { Customer } from "@/types/database.types";

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  birthday: string;
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as Customer[]) ?? [];
  },

  async getCustomer(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as Customer;
  },

  async createCustomer(input: CustomerFormData): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  },

  async updateCustomer(
    id: string,
    input: Partial<CustomerFormData>
  ): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order("name", { ascending: true })
      .limit(20);
    if (error) throw error;
    return (data as Customer[]) ?? [];
  },
};
