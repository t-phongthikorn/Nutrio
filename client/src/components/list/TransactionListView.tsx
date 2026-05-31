import { useState } from "react";
import {
  GroupedTransactionsWithDate,
  QueryTransaction,
} from "../../types/transaction";
import { formatThaiDate } from "../../utils/dateUtils";
import BackgroundIcon from "../background_icon";
import { EditTransaction } from "./transaction_list/EditTransaction";
import { useEffect } from "react";

interface TransactionListProp {
  transaction_group_with_date: GroupedTransactionsWithDate[];
  onEdit: (transaction: QueryTransaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionLists = ({
  transaction_group_with_date, onEdit, onDelete
}: TransactionListProp) => {
  const [editTransaction, setEditTransaction] =
    useState<QueryTransaction | null>(null);

  useEffect(() => {
    if (editTransaction) {
      const modal = document.getElementById(
        "edit_category",
      ) as HTMLDialogElement;

      modal?.showModal();
    }
  }, [editTransaction]);

  const openModal = (item: QueryTransaction) => {
    setEditTransaction(null); // 👈 บังคับให้เปลี่ยนก่อน

    setTimeout(() => {
      setEditTransaction(item);
    }, 0);
  };

  return (
    <>
      <EditTransaction
        key={editTransaction?.id}
        onEdit={onEdit}
        onDelete={onDelete}
        transaction={editTransaction}
      />

      <div className="bg-white shadow-2xl rounded-4xl p-5 sm:p-7">
        {transaction_group_with_date.map((group) => (
          <div key={group.date} className="mb-6 last:mb-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-lg sm:text-xl font-medium text-gray-500 sm:text-gray-700 whitespace-nowrap">
                {formatThaiDate(group.date)}
              </div>
              <div className="flex-1 h-[1px] bg-gray-200 sm:bg-gray-400"></div>
            </div>

            <div className="space-y-2 sm:space-y-1">
              {group.items.map((item) => (
                <TransactionRow
                  key={item.id}
                  item={item}
                  onSelect={() => openModal(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ==========================================
   COMPONENT ย่อย: แถวรายการธุรกรรม (Responsive ในตัว)
   ========================================== */
interface RowProps {
  item: QueryTransaction;
  onSelect: () => void;
}

const TransactionRow = ({ item, onSelect }: RowProps) => {
  const isIncome = item.type === "income";

  return (
    <div
      onClick={onSelect}
      className="flex sm:grid sm:grid-cols-4 items-center justify-between rounded-4xl p-2 cursor-pointer hover:bg-gray-100 active:bg-gray-50 text-gray-700"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <BackgroundIcon category={item.label} />

        <div className="flex flex-col">
          {/* หมวดหมู่ */}
          <span className="font-semibold sm:font-normal text-lg sm:text-base">
            {item.label}
          </span>

          {/* ชื่อรายการ (อยู่ใต้หมวดหมู่ เฉพาะ mobile) */}
          <span className="text-sm text-gray-500 sm:hidden">{item.title}</span>
        </div>
      </div>

      <div className="hidden sm:block text-gray-700">{item.title}</div>
      <div className="hidden sm:block text-gray-500">{item.note}</div>

      <div
        className={`font-semibold text-lg text-right ${isIncome ? "text-success" : "text-error"}`}
      >
        {isIncome ? "+" : "-"}
        {Math.abs(item.amount).toLocaleString()} บาท
      </div>
    </div>
  );
};
