import { GroupedTransactionsWithDate } from "../../types/transaction";
import { formatThaiDate } from "../../utils/dateUtils";
import BackgroundIcon from "../background_icon";

interface TransactionListProp {
    transaction_group_with_date: GroupedTransactionsWithDate[]
}

export const PCTransactionList = ({transaction_group_with_date} : TransactionListProp) => {
  return (
    <>
      <div className="hidden sm:grid bg-white shadow-2xl rounded-4xl cursor-pointer  focus:outline-none focus:ring-2 focus:ring-blue-500 p-7">
        {/* 1. เอา Object.keys ออก แล้ว map ดื้อ ๆ เลย */}
        {transaction_group_with_date.map((group) => {
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
                    //   onClick={() => setEditTransactionId(items.transaction_id)}
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
        {transaction_group_with_date.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-xl">
            ไม่มีรายการธุรกรรมในช่วงนี้
          </div>
        )}

        <div className="mb-0"></div>
      </div>
    </>
  );
};

export const MobileTransactionList = ({transaction_group_with_date} : TransactionListProp) => {
  return (
    <>
      <div className="bg-white shadow-2xl rounded-4xl p-5 sm:hidden space-y-6">
        {/* 1. วนลูปกลุ่มข้อมูลรายวัน (Grouped Data) */}
        {transaction_group_with_date.map((group) => (
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
                    // onClick={() => setEditTransactionId(item.transaction_id)}
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

        {transaction_group_with_date.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            ไม่มีรายการธุรกรรมในช่วงนี้
          </div>
        )}
      </div>
    </>
  );
};
