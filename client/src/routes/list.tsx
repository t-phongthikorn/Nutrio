import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "../api/axios";
import { Doughnut } from "react-chartjs-2";
import { useDoughnutCharts } from "../components/graph";

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

  // ดึงชื่อเดือนแบบย่อภาษาไทย (ม.ค., ก.พ., ...)
  const month = date.toLocaleDateString("th-TH", { month: "short" });
  const day = date.getDate();

  // แปลงปี ค.ศ. เป็น พ.ศ. แล้วเอาแค่ 2 หลักท้าย (เช่น 2026 -> 2569 -> "69")
  const thaiYear = (date.getFullYear() + 543).toString().slice(-2);

  return `${day} ${month} ${thaiYear}`;
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
  ];

  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction[]>(initialTransactions);
  const [currentGroupedTransaction, setCurrentGroupedTransaction] = useState<
    GroupedTransactions[]
  >([]);
  const { incomeData, expenseData } = useDoughnutCharts(initialTransactions);
  const hasIncomeData = incomeData.datasets[0].data.some((v) => v > 0);
  const hasExpenseData = expenseData.datasets[0].data.some((v) => v > 0);
  useEffect(() => {
    setCurrentGroupedTransaction(groupTransactionsByDate(currentTransaction));
    console.log(currentGroupedTransaction);
  }, []);

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

  // useEffect(() => {
  //   fetchDataByRange()
  // }, [startDateTime, endDateTime]); // 👈 สำคัญมาก

  return (
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
      <div className="flex items-center w-1/2 my-6 mx-auto mt-16">
        <div className="grow border-t border-gray-300"></div>

        <span className="mx-4 text-gray-600 text-3xl text-center">ภาพรวม</span>

        <div className="grow border-t border-gray-300"></div>
      </div>
      <div className="w-full">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
            <div className="text-2xl  text-gray-600">ยอดคงเหลือ</div>
            <div className="text-green-500 text-3xl">+3000 THB</div>
          </div>
          <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
            <div className="text-2xl  text-gray-600">ค่าใช้จ่ายทั้งหมด</div>
            <div className="text-red-400 text-3xl">-3000 THB</div>
          </div>
          <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
            <div className="text-2xl  text-gray-600">รายรับทั้งหมด</div>
            <div className="text-green-500 text-3xl">+3000 THB</div>
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
    </div>
  );
};

export default TransactionList;
