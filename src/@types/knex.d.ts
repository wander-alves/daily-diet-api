import type { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    accounts: {
      id: string;
      name: string;
      email: string;
      password: string;
      avatar_url?: string;
      session_id?: string;
      created_at?: string;
    }

    meals: {
      id: string;
      name: string;
      description: string;
      is_on_diet: boolean;
      user_id: string;
      registered_at: string;
      created_at?: string;
      updated_at?: string;
    }
  }
}