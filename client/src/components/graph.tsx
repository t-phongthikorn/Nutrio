import { useMemo } from "react";

export interface Transaction {
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

function filterZeroData(labels: string[], data: number[]) {
  const filteredLabels: string[] = [];
  const filteredData: number[] = [];

  labels.forEach((label, i) => {
    if (data[i] > 0) {
      filteredLabels.push(label);
      filteredData.push(data[i]);
    }
  });

  return { labels: filteredLabels, data: filteredData };
}

const isValidType = (type: string): type is "income" | "expense" => {
  return type === "income" || type === "expense";
};
export const INCOME_CATEGORIES = [
  "ธุรกิจ",
  "ของขวัญ",
  "เงินกู้ยืม",
  "เงินเดือน",
  "รายได้พิเศษ",
   "อื่น ๆ",
] as const;

export const EXPENSE_CATEGORIES = [
  "ช้อปปิ้งและของใช้",
  "อาหาร",
  "เดินทาง",
  "บันเทิง",
  "ค่าใช้จ่ายประจำ",
  "สุขภาพและยา",
  "ซ่อมบำรุง",
   "อื่น ๆ",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  ธุรกิจ: "#1F3A60",
  ของขวัญ: "#FFC6FF",
  เงินกู้ยืม: "#B3C5D7",
  เงินเดือน: "#A3E4D7",
  รายได้พิเศษ: "#FFD166",

  ช้อปปิ้งและของใช้: "#FFB7B2",
  อาหาร: "#FCD5A1",
  เดินทาง: "#A9DEF9",
  บันเทิง: "#CFBAF0",
  ค่าใช้จ่ายประจำ: "#E8AEB7",
  สุขภาพและยา: "#98DDCA",
  ซ่อมบำรุง: "#D3D3D3",

  "อื่น ๆ": "#9ca3af",
};

function getColors(labels: string[]) {
  return labels.map((label) => CATEGORY_COLORS[label] ?? "#9ca3af");
}


function buildChartData(
  transactions: Transaction[],
  type: "income" | "expense"
) {
  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // 🔥 init ทุก category = 0 (fix missing data problem)
  const map: Record<string, number> = Object.fromEntries(
    categories.map((c) => [c, 0])
  );

  for (const t of transactions) {
    if (t.type !== type) continue;

    const label = t.label?.trim();

    // 🔥 only count known category
    if (label && label in map) {
      map[label] += Math.abs(Number(t.amount) || 0);
    }
  }

  const labels = categories;
  const data = categories.map((c) => map[c]);
  const backgroundColor = categories.map(
    (c) => CATEGORY_COLORS[c] ?? "#9ca3af"
  );

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };
}

export function useDoughnutCharts(transactions: Transaction[]) {
  return useMemo(() => {
  const incomeMap = buildChartData(transactions, "income");
  const expenseMap = buildChartData(transactions, "expense");

  return {
    incomeData: incomeMap,
    expenseData: expenseMap,
  };
}, [transactions]);
}
