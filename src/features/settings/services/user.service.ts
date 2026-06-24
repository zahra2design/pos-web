import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/database.types";

export interface UserWithOutlet extends UserProfile {
  outlet_name?: string;
}

export const userService = {
  async getUsers(): Promise<UserWithOutlet[]> {
    const { data, error } = await supabase.rpc("get_all_users");
    if (error) throw error;
    return (data as UserWithOutlet[]) ?? [];
  },

  async getUser(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as UserProfile;
  },

  async createUser(params: {
    email: string;
    password: string;
    name: string;
    role: string;
    outlet_id?: string | null;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          name: params.name,
          role: params.role,
          outlet_id: params.outlet_id ?? null,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async updateUser(
    id: string,
    updates: {
      name?: string;
      role?: string;
      outlet_id?: string | null;
      is_active?: boolean;
    }
  ) {
    const { error } = await supabase.rpc("update_app_user", {
      p_user_id: id,
      p_name: updates.name ?? null,
      p_role: updates.role ?? null,
      p_outlet_id: updates.outlet_id ?? null,
      p_is_active: updates.is_active ?? null,
    });
    if (error) throw error;
  },

  async getOutlets() {
    const { data, error } = await supabase
      .from("outlets")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data ?? [];
  },
};
