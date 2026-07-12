import { createAdminDbClient } from "@/lib/supabase/admin";
import type { CustomerRepository } from "@/lib/repositories/types";
import {
  customerToRow,
  rowToCustomer,
  type CustomerRow,
} from "@/lib/repositories/supabase/mappers";
import type { CustomerAccount } from "@/types/admin";

export function createSupabaseCustomerRepository(): CustomerRepository {
  const db = () => createAdminDbClient();

  return {
    async list() {
      const { data, error } = await db()
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as CustomerRow[]).map(rowToCustomer);
    },

    async findById(id) {
      const { data, error } = await db()
        .from("customers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToCustomer(data as CustomerRow) : null;
    },

    async upsert(customer) {
      const row = customerToRow(customer);
      const { error } = await db().from("customers").upsert(row);
      if (error) throw error;
      return customer;
    },

    async delete(id) {
      const { error } = await db().from("customers").delete().eq("id", id);
      if (error) throw error;
    },

    async linkAuthUser(customerId, authUserId) {
      const { error } = await db()
        .from("customers")
        .update({ auth_user_id: authUserId })
        .eq("id", customerId);
      if (error) throw error;
    },
  };
}
