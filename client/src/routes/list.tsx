import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "../api/axios";
import { Doughnut } from "react-chartjs-2";
import BackgroundIcon from "../components/background_icon";
import {
  getStartOfMonth,
  getEndOfMonth,
  formatThaiDate,
} from "../utils/dateUtils";
import { useFilteredTransaction } from "../hook/useFilteredTransaction";
import { usePaginationTransaction } from "../hook/usePaginationTransaction";
import {
  GroupedTransactionsWithDate,
  QueryTransaction,
} from "../types/transaction";
import { FilterByCategoryModal } from "../components/list/FilterByCategory";
import { TransactionOverview } from "../components/list/TransactionOverview";
import { TransactionLists } from "../components/list/TransactionListView";
import { TransactionPagination } from "../components/list/TransactionPagination";
import { TransactionChart } from "../components/list/TransactionChartView";
import axios from "axios";

const groupTransactionsByDate = (
  transactions: QueryTransaction[],
): GroupedTransactionsWithDate[] => {
  // 1. จัดกลุ่มตามวันเหมือนเดิม
  const groups = transactions.reduce(
    (acc, transaction) => {
      const dateKey = transaction.time.split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transaction);
      return acc;
    },
    {} as Record<string, QueryTransaction[]>,
  );

  // 2. แปลงเป็น Array + เรียงลำดับ (Sort)
  return (
    Object.keys(groups)
      // เรียงลำดับ "กลุ่มวัน" จากวันล่าสุด ขึ้นก่อน (2026-05-28 จะอยู่ก่อน 2026-05-27)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => {
        // เรียงลำดับ "รายการข้างในวันนั้น" ให้เวลาใหม่สุดขึ้นก่อนด้วย
        const sortedItems = groups[date].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
        );

        return {
          date,
          items: sortedItems,
        };
      })
  );
};

const TransactionList = () => {
  const [startDateTime, setStartDateTime] = useState<Date | null>(() =>
    getStartOfMonth(),
  );
  const [endDateTime, setEndDateTime] = useState<Date | null>(() =>
    getEndOfMonth(),
  );
  useEffect(() => {
    setTargetStartDate(startDateTime);
    setTargetEndDate(endDateTime);
  }, []);
  const bottomRef = useRef<HTMLDivElement>(null);

  const initialTransactions: QueryTransaction[] = [
    {
      id: -5,
      created_at: "2026-05-27T11:42:27.052944+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -499,
      title: "ค่า LaserTag",
      label: "อื่น ๆ",
      type: "expense",
      note: null,
      time: "2026-05-27T11:39:00.297+00:00",
      transaction_id: "65b8a652-beae-45a5-b1ec-16246b4777a2",
    },
    {
      id: -4,
      created_at: "2026-05-27T11:42:27.052944+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -499,
      title: "ค่า LaserTag",
      label: "อื่น ๆ",
      type: "expense",
      note: null,
      time: "2026-05-27T11:39:00.297+00:00",
      transaction_id: "65b8a652-beae-45a5-b1ec-16246b4777a2",
    },
  ];

  const [currentTransaction, setCurrentTransaction] =
    useState<QueryTransaction[]>(initialTransactions);

  const {
    useIncomeData,
    useExpenseData,
    selectedLabels,
    targetStartDate,
    targetEndDate,
    totalIncome,
    totalExpense,
    netBalance,
    setSelectedLabels,
    setTargetEndDate,
    setTargetStartDate,
    setUseExpenseData,
    sortedFilteredTransactions,
    setUseIncomeData,
  } = useFilteredTransaction(currentTransaction);
  const {
    setCurrentPage,
    currentPage,
    paginatedTransactions,
    totalPages,
    pages,
  } = usePaginationTransaction(sortedFilteredTransactions);
  const [loading, setLoading] = useState(true);
  // const hasExpenseData = expenseData.datasets[0].data.some((v) => v > 0);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [currentPage]);

  const fetchDataByRange = async () => {
    console.log("Try to fetch");
    setLoading(true);

    const res = await axiosInstance.get("/transaction/get_transaction", {
      params: {
        start: startDateTime?.toISOString(),
        end: endDateTime?.toISOString(),
      },
    });
    console.log(res.data.data);
    setCurrentTransaction(res.data.data);
    setLoading(false);
    return res;
  };

  const handleEdit = async (updated: QueryTransaction) => {
    setCurrentTransaction((prev) =>
      prev.map((t) =>
        t.transaction_id === updated.transaction_id ? updated : t,
      ),
    );
    let res = await axiosInstance.post("/transaction/edit", updated);
  };

  const handleDelete = async (id: string) => {
    setCurrentTransaction((prev) =>
      prev.filter((t) => t.transaction_id !== id),
    );
    let res = await axiosInstance.post("/transaction/delete", {
      transaction_id: id,
    });
  };


  // useEffect(() => {
  //   fetchDataByRange();
  // }, [startDateTime, endDateTime]); // 👈 สำคัญมาก

  const groupedData = useMemo(() => {
    return groupTransactionsByDate(paginatedTransactions);
  }, [paginatedTransactions]);

  return (
    <>
      <FilterByCategoryModal
        selectedLabels={selectedLabels}
        onConfirm={(labels: string[]) => {
          console.log(labels);
          setSelectedLabels(labels);
        }}
      ></FilterByCategoryModal>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center w-full my-6 mt-16">
          <div className="grow border-t border-gray-300"></div>

          <span className="mx-4 text-gray-600 text-7xl text-center">
            รายการธุรกรรม
          </span>

          <div className="grow border-t border-gray-300"></div>
        </div>
        <div className="mt-2 text-center text-2xl text-gray-600 mt-">
          เลือกช่วงเวลา
        </div>
                    <div className="flex justify-center ">
              <div className="flex flex-col md:flex-row w-1/3 items-center gap-3 mt-2">
                <DatePicker
                  selected={startDateTime}
                  onChange={(e: any) => {
                    setStartDateTime(e);
                  }}
                  dateFormat="dd/MM/yyyy"
                  calendarClassName="w-full px-4 py-3 scale-110 rounded-xl shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  className="input input-bordered w-full rounded-4xl flex-1  "
                />

                <div className="text-center flex-1 text-gray-600 text-lg">
                  ถึง
                </div>

                <DatePicker
                  selected={endDateTime}
                  onChange={(e: any) => {
                    setEndDateTime(e);
                  }}
                  dateFormat="dd/MM/yyyy"
                  calendarClassName="w-full px-4 py-3 scale-110 rounded-xl shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  className="input input-bordered w-full rounded-4xl flex-1"
                />
              </div>
            </div>
            <div className="w-full items-center text-center mt-5">
              <button
                onClick={() => {
                  setTargetStartDate(startDateTime);
                  setTargetEndDate(endDateTime);
                  fetchDataByRange();
                }}
                className="btn btn-info btn-outline rounded-4xl w-1/2"
              >
                ค้นหา
              </button>
            </div>
        {loading ? (
          <>
          <div className="flex flex-col gap-3 justify-center items-center mt-20">
            <span className="loading loading-dots loading-md text-gray-500"></span>
            <div className="text-4xl text-gray-500">กำลังโหลดข้อมูล</div>
          </div>
          </>
        ) : (
          <>

            <div className="flex items-center w-1/2 my-6 mx-auto mt-16">
              <div className="grow border-t border-gray-300"></div>

              <span className="mx-4 text-gray-600 text-3xl text-center">
                ภาพรวม
              </span>

              <div className="grow border-t border-gray-300"></div>
            </div>
            <TransactionOverview
              income={totalIncome}
              expense={totalExpense}
              netBalance={netBalance}
            ></TransactionOverview>
            <div className="flex justify-center w-full mt-16 mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
                <TransactionChart
                  transactions={currentTransaction}
                  title="รายรับ"
                ></TransactionChart>
                <TransactionChart
                  transactions={currentTransaction}
                  title="รายจ่าย"
                ></TransactionChart>
              </div>
            </div>
            <div className="flex items-center w-1/2 my-6 mx-auto mt-16">
              <div className="grow border-t border-gray-300"></div>

              <span className="mx-4 text-gray-600 text-3xl text-center">
                รายละเอียด
              </span>

              <div className="grow border-t border-gray-300"></div>
            </div>

            <div className="w-full md:w-auto items-center bg-white shadow-lg flex flex-col md:flex-row md:items-center p-4 rounded-4xl mb-3 gap-4">
              {/* LEFT (checkbox + button) */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useIncomeData}
                    onChange={(e) => setUseIncomeData(e.target.checked)}
                    className="checkbox checkbox-md  rounded-lg"
                  />
                  <div className="text-xl">รายรับ</div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useExpenseData}
                    onChange={(e) => setUseExpenseData(e.target.checked)}
                    className="checkbox checkbox-md rounded-lg"
                  />
                  <div className="text-xl">รายจ่าย</div>
                </div>

                <label
                  htmlFor="filter_by_category"
                  className="btn rounded-4xl text-lg "
                >
                  คัดกรอง
                </label>
              </div>

              {/* RIGHT (datepicker) */}
              <div className="flex items-center gap-2 w-full md:w-[320px] md:ml-auto justify-center md:justify-end">
                <DatePicker
                  selected={targetStartDate}
                  onChange={(e: any) => {
                    setTargetStartDate(e);
                  }}
                  dateFormat="dd/MM/yyyy"
                  calendarClassName="w-full px-4 py-3 scale-110 rounded-xl shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  className="input input-bordered w-full rounded-4xl flex-1  "
                />

                <div className="text-gray-600 text-sm whitespace-nowrap">
                  ถึง
                </div>

                <DatePicker
                  selected={targetEndDate}
                  onChange={(e: any) => {
                    setTargetEndDate(e);
                  }}
                  dateFormat="dd/MM/yyyy"
                  calendarClassName="w-full px-4 py-3 scale-110 rounded-xl shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  className="input input-bordered w-full rounded-4xl flex-1  "
                />
              </div>
            </div>

            <TransactionLists
              transaction_group_with_date={groupedData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            ></TransactionLists>

            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChangePage={(page) => setCurrentPage(page)}
              pagePattern={pages}
            ></TransactionPagination>
            <div className="" ref={bottomRef}></div>
          </>
        )}
      </div>
    </>
  );
};

export default TransactionList;
