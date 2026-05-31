import DatePicker from "react-datepicker";
import {
  EXPENSE_CATEGORIES_TH,
  INCOME_CATEGORIES_TH,
} from "../../../types/category";
import { QueryTransaction } from "../../../types/transaction";
import BackgroundIcon from "../../background_icon";
import { useEffect, useState } from "react";

interface EditTransactionProp {
  transaction: QueryTransaction | null;
  onEdit: (transaction: QueryTransaction) => void;
  onDelete: (id: string) => void;
}

export const EditTransaction = ({ transaction, onEdit, onDelete }: EditTransactionProp) => {
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState<number>(0);
  const [time, setTime] = useState<Date | null>(null);
  const [note, setNote] = useState<string | null>("");
  const [transaction_id, setTransactionId] = useState<string>("");
  const [confirmButton, setConfirmButton] = useState<boolean>(false);

  // ✅ sync state ทุกครั้งที่เปลี่ยน transaction
  useEffect(() => {
    if (transaction) {
      setCategory(transaction.label);
      setTitle(transaction.title);
      setType(transaction.type as "income" | "expense");
      setAmount(Number(transaction.amount)); // กันติดลบใน input
      setTime(transaction.time ? new Date(transaction.time) : null);
      setNote(transaction.note);
      setTransactionId(transaction.transaction_id);
    }
  }, [transaction]);

  // ✅ กัน render ตอนยังไม่มีข้อมูล
  if (!transaction) return null;

  const handleSave = () => {
    if (!time) {
      alert("กรุณาเลือกวันที่");
      return;
    }

    const finalAmount = type === "expense" ? -amount : amount;

    const updatedTransaction: QueryTransaction = {
      id: transaction?.id ?? 0, // หรือใช้ของเดิม
      created_at: transaction?.created_at ?? new Date().toISOString(),
      user_id: transaction?.user_id ?? "",
      amount: finalAmount,
      title: title.trim(),
      label: category,
      type,
      note: note?.trim() || null,
      time: time.toISOString(), // 🔥 สำคัญ (Date → string)
      transaction_id: transaction_id,
    };

    onEdit(updatedTransaction)

  };

  const handleDelete = () => {
    onDelete(transaction_id)
  };

  return (
    <dialog id="edit_category" className="modal">
      <div className="modal-box rounded-3xl p-6 space-y-5">
        {/* HEADER */}
        <div className="text-center">
          <h3 className="text-2xl font-bold">แก้ไขรายการ</h3>
        </div>

        {/* ICON */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 bg-gray-100 rounded-full">
            <BackgroundIcon category={category} />
          </div>
          <p className="text-lg font-semibold">{title}</p>
        </div>

        {/* TYPE */}
        <div>
          <label className="label text-sm ">ประเภท</label>
          <div className="flex gap-2 p-3">
            <button
              className={`btn rounded-4xl  duration-75 flex-1 ${
                type === "income"
                  ? "btn-success"
                  : "btn-outline border-gray-300 outline-gray-300"
              }`}
              onClick={() => {
                setType("income");
                let finalAmount = Number(amount);
                if (!Number.isNaN(finalAmount)) {
                  finalAmount = Math.abs(finalAmount);
                  setAmount(finalAmount);
                }
              }}
            >
              รายรับ
            </button>
            <button
              className={`btn flex-1 transition-none duration-75 rounded-4xl ${
                type === "expense"
                  ? "btn-error"
                  : "btn-outline border-gray-300 outline-gray-300"
              }`}
              onClick={() => {
                setType("expense");
                let finalAmount = Number(amount);
                if (!Number.isNaN(finalAmount)) {
                  finalAmount = -Math.abs(finalAmount);
                  setAmount(finalAmount);
                }
              }}
            >
              รายจ่าย
            </button>
          </div>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* CATEGORY */}
          <div>
            <label className="label text-sm">หมวดหมู่</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full rounded-xl"
            >
              {(type === "income"
                ? INCOME_CATEGORIES_TH
                : EXPENSE_CATEGORIES_TH
              ).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* TITLE */}
          <div>
            <label className="label text-sm">ชื่อรายการ</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          {/* AMOUNT */}
          <div>
            <label className="label text-sm">จำนวนเงิน</label>
            <input
              type="number"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                let value = e.currentTarget.value;
                let finalAmount = Number(value);
                if (!Number.isNaN(finalAmount)) {
                  if (type == "income") {
                    finalAmount = Math.abs(finalAmount);
                  } else {
                    finalAmount = -Math.abs(finalAmount);
                  }
                  value = String(finalAmount);
                }
                if (/^-?\d*$/.test(value)) {
                  setAmount(finalAmount);
                }
              }}
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          {/* DATE */}
          <div className="flex flex-col">
            <label className="label text-sm">วันที่</label>
            <DatePicker
              selected={time}
              onChange={(date: any) => setTime(date)}
              showTimeInput
              dateFormat="dd/MM/yyyy HH:mm"
              className="input input-bordered w-full rounded-xl"
              popperClassName="z-50"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="label text-sm">โน๊ต</label>
          <textarea
            value={note ?? ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const note = e.target.value;
              setNote(note);
              // setTransactionMap((prev) => ({
              //   ...prev,
              //   [id]: {
              //     ...prev[id],
              //     note,
              //   },
              // }));
            }}
            className="textarea textarea-md p-4 rounded-4xl w-full"
          ></textarea>
        </div>

        {/* ACTIONS */}
        <form method="dialog">
          <div className="flex gap-3 pt-4">
            <button
              className="btn btn-outline border-gray-500 rounded-4xl btn-we flex-1"
 
            >
              ยกเลิก
            </button>

            <button
              className="btn btn-info rounded-4xl flex-1"
              onClick={handleSave}
            >
              บันทึก
            </button>
          </div>
        </form>
        {!confirmButton ? <div className="btn btn-error btn-outline  w-full rounded-4xl" onClick={() => setConfirmButton(true)}>ลบ</div> :
        <>
        
          <div className="btn btn-warning btn-outline  w-full rounded-4xl" onClick={() => setConfirmButton(false)}>ไม่ยืนยันการลบ</div>
          <form method="dialog">
            <button className="btn btn-error btn-outline  w-full rounded-4xl" onClick={handleDelete}>ยืนยันการลบ</button>
          </form>
        </>
        }
        <form method="dialog">
        </form>
      </div>

      {/* BACKDROP */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};
