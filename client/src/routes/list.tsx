import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "../api/axios";
import { Doughnut } from "react-chartjs-2";
import { useDoughnutCharts } from "../components/graph";
import BackgroundIcon from "../components/background_icon";
import getOwnPagination from "../utils/pagination";

import FoodSvg from "../assets/food.svg";
import { EXPENSE_CATEGORIES_TH, INCOME_CATEGORIES_TH } from "../types/category";

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

interface GroupedTransactions {
  date: string; // วันที่สำหรับใช้แสดงหัวข้อ (เช่น "2026-05-27")
  items: Transaction[]; // รายการธุรกรรมของวันนั้น ๆ
}

const formatThaiDate = (dateString: string): string => {
  const date = new Date(dateString);

  // 1. เช็คก่อนว่า Format วันที่ส่งมาถูกต้องไหม ถ้าระบบอ่านไม่ออก ให้ส่งสตริงว่างหรือค่าเดิมกลับไปก่อน กันแอปพัง
  if (isNaN(date.getTime())) {
    return dateString;
  }

  // 2. ใช้ option "2-digit" สำหรับปี เพื่อให้ตัดเหลือ 2 หลักท้าย (เช่น "69") อัตโนมัติในระบบ พ.ศ.
  const formatted = date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });

  // ผลลัพธ์ที่ได้จาก th-TH จะหน้าตาประมาณ "28 พ.ค. 69"
  return formatted;
};

const groupTransactionsByDate = (
  transactions: Transaction[],
): GroupedTransactions[] => {
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
    {} as Record<string, Transaction[]>,
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
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [startDateTime, setStartDateTime] = useState<Date | null>(startOfMonth);
  const [endDateTime, setEndDateTime] = useState<Date | null>(endOfMonth);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [viewStartDateTime, setViewStartDateTime] = useState<Date | null>(
    startOfMonth,
  );
  const [viewEndDateTime, setViewEndDateTime] = useState<Date | null>(
    startOfMonth,
  );

  const initialTransactions: Transaction[] = [
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
    useState<Transaction[]>(initialTransactions);

  const [currentGroupedTransaction, setCurrentGroupedTransaction] = useState<
    GroupedTransactions[]
  >([]);
  const { incomeData, expenseData } = useDoughnutCharts(initialTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editTransactionId, setEditTransactionId] = useState("");

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
  const [tempCategoryFilter, setTempCategoryFilter] = useState<string[]>([]);
  const hasIncomeData = incomeData.datasets[0].data.some((v) => v > 0);
  const hasExpenseData = expenseData.datasets[0].data.some((v) => v > 0);
  useEffect(() => {
    setCurrentGroupedTransaction(groupTransactionsByDate(initialTransactions));
    console.log(currentGroupedTransaction);
  }, []);
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

  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    initialTransactions.forEach((item) => {
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
  }, [initialTransactions]);

  useEffect(() => {
    setViewStartDateTime(startDateTime);
    setViewEndDateTime(endDateTime);
  }, []);

  const handleToggle = (label: string) => {
    setTempCategoryFilter((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };
  // useEffect(() => {
  //   fetchDataByRange()
  // }, [startDateTime, endDateTime]); // 👈 สำคัญมาก

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((item) => {
      if (item.type === "income" && !useIncomeData) return false;
      if (item.type === "expense" && !useExpenseData) return false;

      if (
        selectedLabels.length > 0 &&
        (!item.label || !selectedLabels.includes(item.label))
      ) {
        return false;
      }

      const itemTime = item.time ? new Date(item.time).getTime() : 0;

      const start = viewStartDateTime
        ? new Date(viewStartDateTime).setHours(0, 0, 0, 0)
        : 0;

      const end = viewEndDateTime
        ? new Date(viewEndDateTime).setHours(23, 59, 59, 999)
        : Infinity;

      return itemTime >= start && itemTime <= end;
    });
  }, [
    initialTransactions,
    useIncomeData,
    useExpenseData,
    selectedLabels,
    viewStartDateTime,
    viewEndDateTime,
  ]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredTransactions.length / itemsPerPage);
  }, [filteredTransactions, itemsPerPage]);

  const pages = useMemo(() => {
    return getOwnPagination(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  }, [filteredTransactions]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const groupedData = useMemo(() => {
    return groupTransactionsByDate(paginatedTransactions);
  }, [paginatedTransactions]);

  return (
    <>
      <input type="checkbox" id="filter_by_category" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-4xl">
          <h3 className="text-3xl font-bold text-center text-gray-800">
            เลือกหมวดหมู่ที่ต้องการแสดง
          </h3>
          <div className="mt-4">
            <div className="text-2xl mb-3">รายจ่าย</div>
            <div className="space-x-3 space-y-3">
              {EXPENSE_CATEGORIES_TH.map((id) => {
                if (id === "อื่น ๆ") return;
                return (
                  <label className="label p-4 border border-gray-200 rounded-4xl text-gray-700">
                    <input
                      type="checkbox"
                      checked={tempCategoryFilter.includes(id)}
                      onChange={() => handleToggle(id)}
                      className="checkbox-lg checkbox text-2xl"
                    />
                    <BackgroundIcon category={id}></BackgroundIcon>
                    <div className="">{id}</div>
                  </label>
                );
              })}
            </div>
            <div className="text-2xl mb-3">รายรับ</div>
            <div className="space-x-3 space-y-3">
              {INCOME_CATEGORIES_TH.map((id) => {
                if (id === "อื่น ๆ") return;
                return (
                  <label className="label p-4 border border-gray-200 rounded-4xl text-gray-700">
                    <input
                      type="checkbox"
                      checked={tempCategoryFilter.includes(id)}
                      onChange={() => handleToggle(id)}
                      className="checkbox-lg checkbox text-2xl"
                    />
                    <BackgroundIcon category={id}></BackgroundIcon>
                    <div className="">{id}</div>
                  </label>
                );
              })}
            </div>
            <div className="text-2xl mb-3">อื่น ๆ</div>
            <div className="space-x-3 space-y-3">
              <label className="label p-4 border border-gray-200 rounded-4xl text-gray-700">
                <input
                  type="checkbox"
                  checked={tempCategoryFilter.includes("อื่น ๆ")}
                  onChange={() => handleToggle("อื่น ๆ")}
                  className="checkbox-lg checkbox text-2xl"
                />
                อื่น ๆ
              </label>
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <label
              htmlFor="filter_by_category"
              className="btn btn-soft btn-error rounded-4xl flex-1 text-2xl"
            >
              ปิด
            </label>
            <label
              htmlFor="filter_by_category"
              className="btn btn-soft btn-success rounded-4xl flex-1 text-2xl"
              onClick={() => {
                setSelectedLabels(tempCategoryFilter);
              }}
            >
              ยืนยัน
            </label>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="filter_by_category">
          Close
        </label>
      </div>
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
              setViewStartDateTime(startDateTime);
              setViewEndDateTime(endDateTime);
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
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
              <div className="text-2xl font-medium text-gray-600">
                ยอดคงเหลือ
              </div>
              <div
                className={`text-3xl  mt-2 ${netBalance >= 0 ? "text-success" : "text-error"}`}
              >
                {netBalance >= 0 ? "+" : ""}
                {netBalance.toLocaleString()} THB
              </div>
            </div>

            <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
              <div className="text-2xl font-medium text-gray-600">
                ค่าใช้จ่ายทั้งหมด
              </div>
              <div className="text-error text-3xl  mt-2">
                -{Math.abs(totalExpense).toLocaleString()} THB
              </div>
            </div>

            <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
              <div className="text-2xl font-medium text-gray-600">
                รายรับทั้งหมด
              </div>
              <div className="text-success text-3xl mt-2">
                +{totalIncome.toLocaleString()} THB
              </div>
            </div>
          </div>
        </div>
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
              onClick={() => {
                setTempCategoryFilter(selectedLabels);
              }}
              htmlFor="filter_by_category"
              className="btn rounded-4xl text-lg "
            >
              คัดกรอง
            </label>
          </div>

          {/* RIGHT (datepicker) */}
          <div className="flex items-center gap-2 w-full md:w-[320px] md:ml-auto justify-center md:justify-end">
            <DatePicker
              selected={viewStartDateTime}
              onChange={(e: any) => {
                setViewStartDateTime(e);
              }}
              dateFormat="dd/MM/yyyy"
              calendarClassName="w-full px-4 py-3 scale-110 rounded-xl shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              className="input input-bordered w-full rounded-4xl flex-1  "
            />

            <div className="text-gray-600 text-sm whitespace-nowrap">ถึง</div>

            <DatePicker
              selected={viewEndDateTime}
              onChange={(e: any) => {
                setViewEndDateTime(e);
              }}
              dateFormat="dd/MM/yyyy"
              calendarClassName="w-full px-4 py-3 scale-110 rounded-xl shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              className="input input-bordered w-full rounded-4xl flex-1  "
            />
          </div>
        </div>

        <div className="hidden sm:grid bg-white shadow-2xl rounded-4xl cursor-pointer  focus:outline-none focus:ring-2 focus:ring-blue-500 p-7">
          {/* 1. เอา Object.keys ออก แล้ว map ดื้อ ๆ เลย */}
          {groupedData.map((group) => {
            // 2. ดึง group.date (ซึ่งมีค่าเป็น "2026-05-28") ไปส่งให้ฟังก์ชันแปลงวันที่
            return (
              <div>
                <div key={group.date} className="flex items-center gap-4 mb-3">
                  <div className="text-lg text-gray-700 font-medium whitespace-nowrap">
                    {formatThaiDate(group.date)}{" "}
                    {/* ✅ ได้ "28 พ.ค. 69" แน่นอน! */}
                  </div>
                  <div className="flex-1 h-[1px] bg-gray-400"></div>
                </div>
                {group.items.map((items) => {
                  return (
                    <div className="">
                      <label
                        onClick={() =>
                          setEditTransactionId(items.transaction_id)
                        }
                        htmlFor="edit_category"
                        className="hidden sm:grid grid-cols-5 cursor-pointer  mb-1 items-center hover:bg-gray-100 p-2 rounded-4xl"
                      >
                        <div>
                          <div className="flex flex-row gap-4 items-center">
                            <BackgroundIcon
                              category={items.label}
                            ></BackgroundIcon>
                            <div className="text-gray-700">{items.label}</div>
                          </div>
                        </div>
                        <div className="text-gray-700">{items.title}</div>
                        <div>-</div>
                        <div>{items.note}</div>
                        <div
                          className={`text-right font-semibold ${items.type === "income" ? "text-success" : "text-error"}`}
                        >
                          {items.type === "income" ? "+" : "-"}
                          {Math.abs(items.amount).toLocaleString()} บาท
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {groupedData.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-xl">
              ไม่มีรายการธุรกรรมในช่วงนี้
            </div>
          )}

          <div className="mb-0"></div>
        </div>

        <div className="bg-white shadow-2xl rounded-4xl p-5 sm:hidden space-y-6">
          {/* 1. วนลูปกลุ่มข้อมูลรายวัน (Grouped Data) */}
          {groupedData.map((group) => (
            <div key={group.date} className="space-y-3">
              {/* 📅 หัวข้อวันที่ (DATE HEADER) */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-semibold text-gray-500 whitespace-nowrap">
                  {formatThaiDate(group.date)}{" "}
                  {/* ✅ แปลงวันที่ เช่น 28 พ.ค. 69 อัตโนมัติ */}
                </span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* 📝 รายการธุรกรรมภายในวันนั้น (LIST) */}
              <div className="space-y-4">
                {group.items.map((item) => {
                  // คำนวณสี เครื่องหมาย และยอดเงิน เตรียมไว้ล่วงหน้า
                  const isIncome = item.type === "income";
                  const textColor = isIncome ? "text-success" : "text-error";
                  const prefix = isIncome ? "+" : "-";

                  return (
                    <label
                      htmlFor="edit_category"
                      key={item.id}
                      onClick={() => setEditTransactionId(item.transaction_id)}
                      className="flex items-center justify-between rounded-4xl p-2 active:bg-gray-100"
                    >
                      {/* ฝั่งซ้าย: ไอคอนและข้อมูลสินค้า */}
                      <div className="flex items-center gap-3">
                        {/* 🎨 เรียกใช้คอมโพเนนต์ไอคอนแยกตามหมวดหมู่พาสเทล */}
                        <BackgroundIcon category={item.label} />

                        <div>
                          <p className="font-semibold text-base-content text-lg">
                            {item.label}
                          </p>
                          <p className="text-lg text-gray-400 mt-0.5">
                            {item.title}
                          </p>
                        </div>
                      </div>

                      {/* ฝั่งขวา: ยอดเงินแยกสีตามประเภท */}
                      <div
                        className={`font-semibold text-lg text-right ${textColor}`}
                      >
                        {prefix}
                        {Math.abs(item.amount).toLocaleString()} บาท
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {groupedData.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              ไม่มีรายการธุรกรรมในช่วงนี้
            </div>
          )}
        </div>
        <div className="flex justify-center items-center gap-2 mt-3 bg-white p-4 rounded-4xl shadow-2xl mb-5">
          {/* Prev */}
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(p - 1, 1));
            }}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-xl bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>

          {/* Pages — fixed width container */}
          <div className="flex items-center gap-2 w-64 justify-center">
            {pages.map((p, index) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 text-center text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => {
                    setCurrentPage(p);
                  }}
                  className={`w-8 h-8 rounded-4xl flex-shrink-0 ${
                    currentPage === p
                      ? "btn btn-accent text-white"
                      : "btn btn-accen bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          {/* Next */}
          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(p + 1, totalPages));
            }}
            disabled={currentPage === totalPages}
            className="px-3 py-1 btn rounded-xl bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="" ref={bottomRef}></div>
      </div>
    </>
  );
};

export default TransactionList;
