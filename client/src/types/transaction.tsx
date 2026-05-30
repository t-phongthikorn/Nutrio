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

export interface GroupedTransactionsWithDate {
  date: string; // วันที่สำหรับใช้แสดงหัวข้อ (เช่น "2026-05-27")
  items: QueryTransaction[]; // รายการธุรกรรมของวันนั้น ๆ
}