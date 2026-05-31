import { useMemo, useState } from "react";
import { QueryTransaction } from "../types/transaction";
import { getStartOfMonth, getEndOfMonth } from "../utils/dateUtils";

export const useFilteredTransaction = (transactions: QueryTransaction[]) => {
  const [targetStartDate, setTargetStartDate] = useState<Date | null>(() =>
    getStartOfMonth(),
  );
  const [targetEndDate, setTargetEndDate] = useState<Date | null>(() =>
    getEndOfMonth(),
  );
  const [useIncomeData, setUseIncomeData] = useState(true);
  const [useExpenseData, setUseExpenseData] = useState(true);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([
    "ช้อปปิ้งและของใช้",
    "อาหาร",
    "เดินทาง",
    "บันเทิง",
    "ค่าใช้จ่ายประจำ",
    "สุขภาพและยา",
    "ซ่อมบำรุง",
    "ธุรกิจ",
    "ของขวัญ",
    "เงินกู้ยืม",
    "เงินเดือน",
    "รายได้พิเศษ",
    "อื่น ๆ",
  ]);
  console.log("rerender");
  console.log(transactions)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      if (item.type === "income" && !useIncomeData) return false;
      if (item.type === "expense" && !useExpenseData) return false;

      if (
        selectedLabels.length > 0 &&
        (!item.label || !selectedLabels.includes(item.label))
      ) {
        return false;
      }

      const itemTime = item.time ? new Date(item.time).getTime() : 0;

      const start = targetStartDate
        ? new Date(targetStartDate).setHours(0, 0, 0, 0)
        : 0;

      const end = targetEndDate
        ? new Date(targetEndDate).setHours(23, 59, 59, 999)
        : Infinity;

      return itemTime >= start && itemTime <= end;
    });

  }, [
    transactions,
    useIncomeData,
    useExpenseData,
    selectedLabels,
    targetStartDate,
    targetEndDate,
  ]);
  const sortedFilteredTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  }, [filteredTransactions]);
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((item) => {
      if (item.type === "income") {
        income += item.amount;
      } else if (item.type === "expense") {
        // ใช้ Math.abs เพื่อให้มั่นใจว่าค่ารายจ่ายสะสมเป็นบวกก่อน (หรือจะใช้วิธีบวกตรง ๆ ก็ได้ครับ)
        expense += Math.abs(item.amount);
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense, // ยอดคงเหลือสุทธิ
    };
  }, [transactions]);
  console.log(sortedFilteredTransactions)
  return {
    useIncomeData,
    useExpenseData,
    selectedLabels,
    targetStartDate,
    targetEndDate,
    filteredTransactions,
    sortedFilteredTransactions,
    setSelectedLabels,
    setTargetEndDate,
    totalIncome,
    totalExpense,
    netBalance,
    setTargetStartDate,
    setUseExpenseData,
    setUseIncomeData,
  };
};
