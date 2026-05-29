import { useRef, useState } from "react";
import axios from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCopyToClipboard } from "@samithahansaka/clipboard";
import BackgroundIcon from "../components/background_icon";

interface LabelItem {
  text: string;
  label: string;
}

interface Transaction {
  amount: string;
  title: string;
  note: string | null;
}

interface OptimizeTransaction {
  transaction_id: any;
  amount: number;
  title: string;
  label: string;
  time: Date;
  type: "income" | "expense" | string;
  note?: string | null;
}

interface FullTransaction {
  amount: string;
  title: string;
  type: "income" | "expense" | string;
  note: any;
  time: Date;
  label: string;
}

type TransactionMap = Record<string, FullTransaction>;

const transformTransactionMap = (
  data: TransactionMap,
): OptimizeTransaction[] => {
  return Object.entries(data).map(([transaction_id, value]) => {
    const parsedAmount = Number(value.amount);

    const base: OptimizeTransaction = {
      transaction_id,
      amount: parsedAmount,
      title: value.title,
      label: value.label,
      type: value.type,
      time: value.time,
    };

    // เพิ่ม note เฉพาะตอนมีค่า
    if (value.note !== null && value.note !== undefined) {
      base.note = value.note;
    }

    return base;
  });
};

const SaveTransaction = () => {
  const [currentCommand, setCurrentCommand] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [targetDeleteId, setTargetDeleteId] = useState("");
  const [transactionMap, setTransactionMap] = useState<TransactionMap>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { copy, copied, reset } = useCopyToClipboard();

  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const CategoryMap = {
    income: ["ธุรกิจ", "ของขวัญ", "เงินกู้ยืม", "เงินเดือน", "รายได้พิเศษ", "อื่น ๆ"],
    expense: [
      "ช้อปปิ้งและของใช้",
      "อาหาร",
      "เดินทาง",
      "บันเทิง",
      "ค่าใช้จ่ายประจำ",
      "สุขภาพและยา",
      "ซ่อมบำรุง",
      "อื่น ๆ"
    ],
  };

  function parseCommand(input: string): Transaction[] {
    const parts = input
      .split("|")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return (
      parts
        .map((p) => {
          const trimmed = p.trim();
          const match = trimmed.match(
            /^([+-]?\d+)\s+([^"]+?)(?:\s+"([^"]*)")?$/,
          );
          if (!match) return null;

          return {
            amount: match[1],
            title: match[2].trim(),
            note: match[3] || null,
          };
        })
        // ใช้เป็น Type Guard เพื่อไล่ null ออกไปจากสายตา TypeScript อย่างสมบูรณ์
        .filter((item): item is Transaction => item !== null)
    );
  }

  const handleDelete = (id: string) => {
    setTransactionMap((prev) => {
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== id),
      );
    });
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsLoading(true);
    let res = await axios.post(
      "/transaction/insert",
      transformTransactionMap(transactionMap),
    );
    setIsSaving(true);
    setIsLoading(false);
    console.log(res.data.message);
    if (res.data.message == "บันทึกสำเร็จ") {
      setIsSuccess(true);
      setTransactionMap({});
    } else {
      setIsSuccess(false);
    }
  };

  const handleAddListSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ❗ สำคัญ กัน reload หน้า
    setLastCommand(currentCommand);
    setIsSaving(false);

    const words: Transaction[] = parseCommand(currentCommand);
    setCurrentCommand("");
    reset();
    console.log(words);

    const titles = words.map((item) => item?.title);

    const res = await axios.post(import.meta.env.VITE_ML_API_URL, {
      titles: titles,
    });

    console.log(res.data.results);
    if (res.data.results) {
      const newCommandWithCategory: TransactionMap = words.reduce(
        (acc, item: Transaction) => {
          const matchedLabel = res.data.results.find(
            (label: LabelItem) => label.text === item.title,
          );

          const id = crypto.randomUUID();

          acc[id] = {
            ...item,
            label: matchedLabel ? matchedLabel.label : "อื่นๆ",
            time: new Date(Date.now()),
            type: Number(item.amount) < 0 ? "expense" : "income",
          };

          return acc;
        },
        {} as TransactionMap,
      );
      setTransactionMap(newCommandWithCategory);
      console.log("ค่าล่าสุดที่ส่งเข้า State:", newCommandWithCategory);
    }

    // ตัวอย่าง: ส่งไป backend
    // axios.post("/api/command", { text: currentCommand });

    // clear input
  };

  return (
    <>
      <input type="checkbox" id="my_modal_7" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-4xl">
          <h3 className="text-3xl font-bold text-center text-gray-800">
            คุณต้องการที่จะลบ
          </h3>
          <p className="mb-1 text-2xl">
            ชื่อ: {transactionMap[targetDeleteId]?.title}
          </p>
          <p className="mb-1 text-2xl">
            จำนวนเงิน: {transactionMap[targetDeleteId]?.amount}
          </p>
          <p className="mb-1 text-2xl">
            ประเภท: {transactionMap[targetDeleteId]?.type}
          </p>
          <p className="mb-1 text-2xl">
            หมวดหมู่: {transactionMap[targetDeleteId]?.label}
          </p>
          {transactionMap[targetDeleteId]?.note && (
            <p className="text-2xl">
              โน๊ต: {transactionMap[targetDeleteId]?.note}
            </p>
          )}

          <div className="mt-7 flex gap-3">
            <label
              htmlFor="my_modal_7"
              className="btn btn-soft btn-error rounded-4xl flex-1 text-2xl"
            >
              ยกเลิก
            </label>
            <label
              htmlFor="my_modal_7"
              className="btn btn-soft btn-success rounded-4xl flex-1 text-2xl"
              onClick={() => {
                handleDelete(targetDeleteId);
              }}
            >
              ยืนยัน
            </label>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="my_modal_7">
          Close
        </label>
      </div>
      <div className="absolute w-full h-"></div>
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center w-full my-6 mt-16">
          <div className="grow border-t border-gray-300"></div>

          <span className="mx-4 text-gray-600 text-7xl text-center">
            บันทึกธุรกรรม
          </span>

          <div className="grow border-t border-gray-300"></div>
        </div>

        <div className="text-center mt-8 text-1xl text-gray-700 ">
          กรุณากรอกธุรกรรมทางการเงิน
        </div>
        <form className="w-full p-2" onSubmit={handleAddListSubmit}>
          <div className="p-4  w-full">
            <textarea
              placeholder={`เช่น -70 ฝรั่ง "ฝรั่ง 2 กิโลกรัม" | +3,000 เงินเดือน`}
              value={currentCommand}
              ref={textareaRef}
              onChange={(e) => setCurrentCommand(e.target.value)}
              className="w-full px-4 pt-4 text-2xl border border-gray-300 rounded-full text-center outline-none bg-white shadow-sm"
            />
          </div>
          <div className="flex flex-2 flex-row gap-5 justify-evenly">
            <button
              type="button"
              onClick={() => {
                const words = currentCommand
                  .split("|")
                  .slice(0, -1) // 🔥 ลบตัวสุดท้าย
                  .map((w) => w.trim());
                setCurrentCommand(words.join(" | "));
                setTimeout(() => {
                  const el = textareaRef.current;
                  if (el) {
                    el.focus();

                    // 🔥 ย้าย cursor ไปท้าย
                    const length = el.value.length;
                    el.setSelectionRange(length, length);
                  }
                }, 0);
              }}
              className={`w-1/2 px-6 py-3 text-center uppercase btn btn-soft btn-error rounded-4xl mb-3`}
            >
              ลบช่วง
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentCommand(currentCommand + " | ");
                setTimeout(() => {
                  const el = textareaRef.current;
                  if (el) {
                    el.focus();

                    // 🔥 ย้าย cursor ไปท้าย
                    const length = el.value.length;
                    el.setSelectionRange(length, length);
                  }
                }, 0);
              }}
              className={`w-1/2 px-6 py-3 text-center uppercase btn btn-soft btn-info rounded-4xl mb-3`}
            >
              เพิ่มการแบ่งช่วง ( | )
            </button>
          </div>
          <button
            type="submit"
            className={`w-full px-6 py-3 text-center uppercase btn btn-soft btn-success rounded-4xl `}
          >
            เพิ่มรายการ
          </button>
        </form>
        {lastCommand && (
          <div className="flex flex-row mb-4 mt-4 gap-3 justify-center items-center ">
            <div className=" text-gray-600 text-md">
              คำสั่งล่าสุด: {lastCommand}{" "}
            </div>
            <button
              type="button"
              onClick={() => {
                copy(lastCommand);
              }}
              className="btn btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#9e9d9d"
              >
                <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
              </svg>
            </button>
            {copied && <div className="text-gray-400">บันทึกแล้ว!</div>}
          </div>
        )}
        <div className="mt-5"></div>
        <div className="flex items-center w-full my-6 mt-8">
          <div className="grow border-t border-gray-300"></div>

          <span className="mx-4 text-gray-600 text-4xl text-center">
            กรุณาเช็คธุรกรรมก่อนบันทึก
          </span>

          <div className="grow border-t border-gray-300"></div>
        </div>
        <form className="" onSubmit={handleSaveSubmit}>
          <div className="w-full p-6 bg-base-200 rounded-2xl shadow-lg">
            <div className="overflow-x-auto">
              <table className="table w-full table-zebra text-lg">
                <thead>
                  <tr className="text-xl font-bold">
                    <th className="text-center">ชื่อรายการ</th>
                    <th className="text-center w-56 whitespace-nowrap">
                      จำนวน
                    </th>
                    <th className="text-center">ประเภท</th>
                    <th className="text-center">หมวดหมู่</th>
                    <th className="text-center">เวลา</th>
                    <th className="text-center">โน๊ต</th>
                    <th className="text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {isSaving ? (
                    <>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center text-3xl p-10 text-gray-500"
                          >
                            <div className="flex flex-row justify-center gap-3">
                              <div className="">กำลังบันทึก</div>
                              <span className="loading loading-dots loading-md"></span>
                            </div>
                          </td>
                        </tr>
                      ) : isSuccess ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center text-3xl p-10 text-gray-500"
                          >
                            <div className="flex flex-row justify-center gap-3">
                              <div className="text-green-500">
                                บันทึกสำเร็จ !!!
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center text-3xl p-10 text-gray-500"
                          >
                            <div className="flex flex-row justify-center gap-3">
                              <div className="text-red-400">
                                บันทึกล้มเหลว ...
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <>
                      {Object.keys(transactionMap).length == 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center text-3xl p-10 text-gray-500"
                          >
                            ไม่มีรายการใด ๆ
                          </td>
                        </tr>
                      ) : (
                        Object.keys(transactionMap).map((id: string) => {
                          const transaction = transactionMap[id];
                          return (
                            <tr className="hover text-center" key={id}>
                              <td>
                                {isEditing ? (
                                  <input
                                    value={transaction.title}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                      const value = e.currentTarget.value;
                                      setTransactionMap((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...prev[id],
                                          title: value,
                                        },
                                      }));
                                    }}
                                    className="input input-bordered focus:outline-none text-lg  focus:border-gray-300 border-bs-gray-200 input-md w-full text-center rounded-4xl"
                                  ></input>
                                ) : (
                                  <div className="font-semibold text-lg">
                                    {transaction.title}
                                  </div>
                                )}
                              </td>

                              <td>
                                {isEditing ? (
                                  <input
                                    value={transaction.amount}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                      let value = e.currentTarget.value;
                                      let finalAmount = Number(value);
                                      if (!Number.isNaN(finalAmount)) {
                                        if (transaction.type == "income") {
                                          finalAmount = Math.abs(finalAmount);
                                        } else {
                                          finalAmount = -Math.abs(finalAmount);
                                        }
                                        value = String(finalAmount);
                                      }
                                      if (/^-?\d*$/.test(value)) {
                                        setTransactionMap((prev) => ({
                                          ...prev,
                                          [id]: {
                                            ...prev[id],
                                            amount: value,
                                          },
                                        }));
                                      }
                                    }}
                                    className="input input-bordered whitespace-nowrap text-lg focus:ring-0 focus:border-gray-300 focus:outline-none input-md w-full text-center rounded-4xl"
                                  ></input>
                                ) : (
                                  <div
                                    className={`${Number(transaction.amount) < 0 ? "text-red-500" : "text-green-500"} font-bold text-lg`}
                                  >
                                    {Number(transaction.amount) > 0
                                      ? "+" + Number(transaction.amount)
                                      : transaction.amount}
                                  </div>
                                )}
                              </td>

                              <td>
                                {isEditing ? (
                                  <select
                                    value={transaction.type}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLSelectElement>,
                                    ) => {
                                      const type = e.target.value;
                                      let newAmount = "";
                                      let finalAmount = Number(
                                        transaction.amount,
                                      );
                                      if (!Number.isNaN(finalAmount)) {
                                        if (type == "income") {
                                          finalAmount = Math.abs(finalAmount);
                                        } else {
                                          finalAmount = -Math.abs(finalAmount);
                                        }
                                        newAmount = String(finalAmount);
                                      }
                                      setTransactionMap((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...prev[id],
                                          type,
                                        },
                                      }));
                                      setTransactionMap((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...prev[id],
                                          amount: newAmount,
                                        },
                                      }));
                                    }}
                                    className="select select-bordered select-lg rounded-2xl w-full "
                                  >
                                    <option value="income">รายรับ</option>
                                    <option value="expense">รายจ่าย</option>
                                  </select>
                                ) : transaction.type === "income" ? (
                                  <span className="badge badge-success text-xl w-full p-3">
                                    รายรับ
                                  </span>
                                ) : (
                                  <span className="badge badge-error text-xl p-3 w-full justify-center whitespace-nowrap">
                                    รายจ่าย
                                  </span>
                                )}
                              </td>

                              <td>
                                {isEditing ? (
                                  <select
                                    value={transaction.label}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLSelectElement>,
                                    ) => {
                                      const label = e.target.value;
                                      setTransactionMap((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...prev[id],
                                          label,
                                        },
                                      }));
                                    }}
                                    className="select select-lg whitespace-nowrap w-full justify-center rounded-4xl  "
                                  >
                                    {transaction.type === "income"
                                      ? CategoryMap["income"].map((c) => (
                                          <option key={c}>
                                            <div className="flex flex-row gap-4 items-center">
                                              <BackgroundIcon
                                                category={c}
                                              ></BackgroundIcon>
                                              <div className="">{c}</div>
                                            </div>
                                          </option>
                                        ))
                                      : CategoryMap["expense"].map((c) => (
                                          <option key={c}>
                                            <div className="flex flex-row gap-4 items-center">
                                              <BackgroundIcon
                                                category={c}
                                              ></BackgroundIcon>
                                              <div className="">{c}</div>
                                            </div>
                                          </option>
                                        ))}
                                  </select>
                                ) : (
                                  <span className="badge badge-outline text-base whitespace-nowrap w-full p-3">
                                    {transaction.label}
                                  </span>
                                )}
                              </td>
                              <td>
                                <DatePicker
                                  selected={transaction.time}
                                  portalId="root-portal"
                                  onChange={(date: any) => {
                                    setTransactionMap((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...prev[id],
                                        time: date,
                                      },
                                    }));
                                  }}
                                  showTimeInput
                                  timeInputLabel="Time:"
                                  dateFormat="dd/MM/yyyy HH:mm"
                                  className="input input-bordered w-full  "
                                  calendarClassName="rounded-box shadow-xl border border-base-300 w-full px-4 py-3 scale-110 rounded-xl shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  popperClassName="z-50"
                                  popperPlacement="bottom-start"
                                />
                              </td>
                              <td>
                                {isEditing ? (
                                  <textarea
                                    placeholder="โน๊ต"
                                    value={transaction.note}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => {
                                      const note = e.target.value;
                                      setTransactionMap((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...prev[id],
                                          note,
                                        },
                                      }));
                                    }}
                                    className="textarea textarea-lg rounded-4xl"
                                  ></textarea>
                                ) : (
                                  <div className="overflow-auto">
                                    {transaction.note}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="flex justify-center gap-5">
                                  {/* <button className="btn btn-md btn-warning ">
                                แก้ไข
                              </button> */}

                                  <label
                                    onClick={() => {
                                      setTargetDeleteId(id);
                                    }}
                                    htmlFor="my_modal_7"
                                    className="btn btn-md btn-error "
                                  >
                                    ลบ
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                      {isEditing && (
                        <tr>
                          <td colSpan={7}>
                            <div className="w-full flex justify-center items-center">
                              <button
                                type="button"
                                className="btn btn-dash btn-accent w-full text-lg rounded-4xl"
                                onClick={() => {
                                  setTransactionMap((prev) => ({
                                    ...prev,
                                    [crypto.randomUUID()]: {
                                      amount: "0",
                                      label: "อื่นๆ",
                                      title: "",
                                      time: new Date(),
                                      type: "income",
                                      note: "",
                                    },
                                  }));
                                }}
                              >
                                เพิ่ม
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-2 flex-row gap-3.5 mt-5">
            <button
              type="button"
              className={`btn ${isLoading && "btn-disabled"}  btn-outline ${isEditing ? "btn-warning" : "btn-info"} flex-1 rounded-4xl`}
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(true);
                  setIsSaving(false);
                } else {
                  setIsEditing(false);
                  setIsSaving(false);
                  console.log(transactionMap);
                }
              }}
            >
              {isEditing ? "ยืนยันการแก้ไข" : "แก้ไข"}
            </button>

            <button
              type="submit"
              className={`btn ${(isEditing || isSaving) && "btn-disabled"} btn-outline btn-success flex-1 rounded-4xl`}
            >
              บันทืก
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SaveTransaction;
