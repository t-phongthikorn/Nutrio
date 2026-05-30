import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "../api/axios";
import { Doughnut } from "react-chartjs-2";
import { useDoughnutCharts } from "../components/graph";
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
import {
  MobileTransactionList,
  PCTransactionList,
} from "../components/list/TransactionListView";
import { TransactionPagination } from "../components/list/TransactionPagination";

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

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: {
          size: 14, // 👈 legend font
        },
      },
    },
    tooltip: {
      bodyFont: {
        size: 16,
      },
      titleFont: {
        size: 18,
      },
    },
  },
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
      id: 63,
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
      id: 62,
      created_at: "2026-05-27T11:42:27.052944+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -28,
      title: "ค่า BTS",
      label: "เดินทาง",
      type: "expense",
      note: null,
      time: "2026-05-27T11:39:00.297+00:00",
      transaction_id: "b7126a04-5dbe-40a6-81fe-68487f747b96",
    },
    {
      id: 61,
      created_at: "2026-05-27T11:42:27.052944+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -20,
      title: "ฝรั่ง",
      label: "อาหาร",
      type: "expense",
      note: null,
      time: "2026-05-27T11:39:00.297+00:00",
      transaction_id: "413535cd-bdd7-4452-96c0-717c6ca13a91",
    },
    {
      id: 65,
      created_at: "2026-05-28T08:35:02.395772+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -20,
      title: "ฝรั่ง",
      label: "อาหาร",
      type: "expense",
      note: null,
      time: "2026-05-28T08:32:58.979+00:00",
      transaction_id: "5a4d2b01-8c5c-4669-8f23-8c7934587e04",
    },
    {
      id: 66,
      created_at: "2026-05-28T12:22:33.289417+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -100,
      title: "นาฬิกา",
      label: "ของขวัญ",
      type: "expense",
      note: "",
      time: "2026-05-28T12:19:25.852+00:00",
      transaction_id: "7db73f7b-7ff1-438d-bfd4-2c3d01bf8655",
    },
    {
      id: 67,
      created_at: "2026-05-28T12:22:33.289417+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -50,
      title: "บ้านลม",
      label: "บันเทิง",
      type: "expense",
      note: "",
      time: "2026-05-28T12:19:26.523+00:00",
      transaction_id: "5fcd6d00-d106-4c20-97b3-7c373a505f17",
    },
    {
      id: 68,
      created_at: "2026-05-28T12:22:33.289417+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -60,
      title: "จ่ายกยศ.",
      label: "ค่าใช้จ่ายประจำ",
      type: "expense",
      note: "",
      time: "2026-05-28T12:19:27.275+00:00",
      transaction_id: "918a8ccc-6464-42a0-aa24-9300ca4571d6",
    },
    {
      id: 69,
      created_at: "2026-05-28T12:22:33.289417+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -50,
      title: "Benzac",
      label: "สุขภาพและยา",
      type: "expense",
      note: "",
      time: "2026-05-28T12:19:28.123+00:00",
      transaction_id: "df9d64fd-a4f4-45c3-9b0b-d2bf3ae05a3b",
    },
    {
      id: 70,
      created_at: "2026-05-28T12:22:33.289417+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: -200,
      title: "พัดลม",
      label: "ซ่อมบำรุง",
      type: "expense",
      note: "",
      time: "2026-05-28T12:19:46.715+00:00",
      transaction_id: "4eb0b41a-b5fc-4746-8704-ffc230a0d029",
    },
    {
      id: 71,
      created_at: "2026-05-28T12:29:18.61517+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: 100,
      title: "ขายระบบ",
      label: "อื่น ๆ", // ปรับตัวอักษรให้แมตช์กับสี Pantone "อื่น ๆ"
      type: "income",
      note: "",
      time: "2026-05-28T12:26:13.895+00:00",
      transaction_id: "0c9f6cad-8f97-460b-8571-207b14ae7f24",
    },
    {
      id: 72,
      created_at: "2026-05-28T12:29:18.61517+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: 1000,
      title: "อี๋งเปา",
      label: "ของขวัญ",
      type: "income",
      note: "",
      time: "2026-05-28T12:26:14.47+00:00",
      transaction_id: "e9ec2f92-5c5a-4b8e-b27c-b6d79064334e",
    },
    {
      id: 73,
      created_at: "2026-05-28T12:29:18.61517+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: 3000,
      title: "กู้กยศ.",
      label: "เงินกู้ยืม",
      type: "income",
      note: "",
      time: "2026-05-28T12:26:14.966+00:00",
      transaction_id: "dd80ff7d-c1ac-45b6-897b-f7076c4898be",
    },
    {
      id: 74,
      created_at: "2026-05-28T12:29:18.61517+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: 9000,
      title: "แม่",
      label: "เงินเดือน",
      type: "income",
      note: "ฟหกไฟหกไฟกห",
      time: "2026-05-28T12:26:15.862+00:00",
      transaction_id: "fa68933e-7e90-49f2-a9a2-05677e42ad12",
    },
    {
      id: 75,
      created_at: "2026-05-28T12:29:18.61517+00:00",
      user_id: "f8248bc6-2f5a-433a-b77e-beb4ca46646e",
      amount: 1000,
      title: "Part Time",
      label: "รายได้พิเศษ",
      type: "income",
      note: "",
      time: "2026-05-28T12:26:24.731+00:00",
      transaction_id: "4adcc27b-e6f5-4276-9858-f36567ba3c07",
    },
  ];

  const [currentTransaction, setCurrentTransaction] =
    useState<QueryTransaction[]>(initialTransactions);

  const { incomeData, expenseData } = useDoughnutCharts(initialTransactions);
  const [editTransactionId, setEditTransactionId] = useState("");

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
  } = useFilteredTransaction(initialTransactions);
  const {
    setCurrentPage,
    currentPage,
    paginatedTransactions,
    totalPages,
    pages,
  } = usePaginationTransaction(sortedFilteredTransactions);

  const hasIncomeData = incomeData.datasets[0].data.some((v) => v > 0);
  const hasExpenseData = expenseData.datasets[0].data.some((v) => v > 0);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [currentPage]);

  const fetchDataByRange = async () => {
    console.log("Try to fetch");

    const res = await axiosInstance.get("/transaction/get_transaction", {
      params: {
        start: startDateTime?.toISOString(),
        end: endDateTime?.toISOString(),
      },
    });
    setCurrentTransaction(res.data);
    console.log(res.data);
    return res;
  };

  // Set Start Date ในส่วนรายการ ให้ตรงกับ Start Date ที่ Fetch มาในตอนต้น

  // useEffect(() => {
  //   fetchDataByRange()
  // }, [startDateTime, endDateTime]); // 👈 สำคัญมาก

  const groupedData = useMemo(() => {
    return groupTransactionsByDate(paginatedTransactions);
  }, [paginatedTransactions]);

  return (
    <>
      <FilterByCategoryModal
        selectedLabels={selectedLabels}
        onConfirm={(labels: string[]) => {
          setSelectedLabels(labels);
        }}
      ></FilterByCategoryModal>
      <input type="checkbox" id="edit_category" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-4xl">
          <h3 className="text-3xl font-bold text-center text-gray-800">
            คุณต้องการที่จะลบ
          </h3>
          <p className="mb-1 text-2xl"></p>

          <div className="mt-7 flex gap-3">
            <label
              htmlFor="edit_category"
              className="btn btn-soft btn-error rounded-4xl flex-1 text-2xl"
            >
              ยกเลิก
            </label>
            <label
              htmlFor="edit_category"
              className="btn btn-soft btn-success rounded-4xl flex-1 text-2xl"
              onClick={() => {}}
            >
              ยืนยัน
            </label>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="edit_category">
          Close
        </label>
      </div>
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

            <div className="text-center flex-1 text-gray-600 text-lg">ถึง</div>

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
            }}
            className="btn btn-info btn-outline rounded-4xl w-1/2"
          >
            ค้นหา
          </button>
        </div>
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
        {(hasExpenseData || hasIncomeData) && (
          <div className="flex justify-center w-full mt-16 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
              <div className="bg-white rounded-4xl shadow-xl p-4">
                <div className="text-center mb-5 text-3xl text-gray-600">
                  รายรับ
                </div>
                {hasIncomeData ? (
                  <div className="w-full h-64 sm:h-72 flex justify-center">
                    <div className="w-full max-w-[280px]">
                      <Doughnut
                        data={incomeData as any}
                        options={options as any}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center mt-32 text-4xl text-gray-300">
                    ไม่มีรายรับ
                  </div>
                )}
              </div>
              <div className="bg-white rounded-4xl shadow-xl p-4">
                <div className="text-center mb-5 text-3xl text-gray-600">
                  รายจ่าย
                </div>
                {hasExpenseData ? (
                  <div className="w-full h-64 sm:h-72 flex justify-center">
                    <div className="w-full max-w-[280px]">
                      <Doughnut
                        data={expenseData as any}
                        options={options as any}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center mt-32 text-4xl text-gray-300">
                    ไม่มีรายจ่าย
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

            <div className="text-gray-600 text-sm whitespace-nowrap">ถึง</div>

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

        <PCTransactionList
          transaction_group_with_date={groupedData}
        ></PCTransactionList>
        <MobileTransactionList
          transaction_group_with_date={groupedData}
        ></MobileTransactionList>

        <TransactionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChangePage={(page) => setCurrentPage(page)}
          pagePattern={pages}
        ></TransactionPagination>
        <div className="" ref={bottomRef}></div>
      </div>
    </>
  );
};

export default TransactionList;
