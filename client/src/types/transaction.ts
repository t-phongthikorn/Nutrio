export interface QueryTransaction {
  id: number;
  created_at: string;
  user_id: string;
  amount: number;
  title: string;
  label: string;
  type: "expense" | "income" | string;
  note: string | null;
  time: string;
  transaction_id: string;
}