// import { useMemo } from "react";

// export interface Transaction {
//   id: number;
//   created_at: string;
//   user_id: string;
//   amount: number;
//   title: string;
//   label: string;
//   type: "expense" | "income" | string;
//   note: string | null;
//   time: string;
//   transaction_id: string;
// }

// function filterZeroData(labels: string[], data: number[]) {
//   const filteredLabels: string[] = [];
//   const filteredData: number[] = [];

//   labels.forEach((label, i) => {
//     if (data[i] > 0) {
//       filteredLabels.push(label);
//       filteredData.push(data[i]);
//     }
//   });

//   return { labels: filteredLabels, data: filteredData };
// }

// const isValidType = (type: string): type is "income" | "expense" => {
//   return type === "income" || type === "expense";
// };

// function getColors(labels: string[]) {
//   return labels.map((label) => CATEGORY_COLORS[label] ?? "#9ca3af");
// }




// export function useDoughnutCharts(transactions: Transaction[]) {
//   return useMemo(() => {
//   const incomeMap = buildChartData(transactions, "income");

//   const expenseMap = buildChartData(transactions, "expense");

//   return {
//     incomeData: incomeMap,
//     expenseData: expenseMap,
//   };
// }, [transactions]);
// }
