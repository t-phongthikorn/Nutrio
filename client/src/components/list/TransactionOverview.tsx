interface TransactionOverviewProp {
    income: number;
    expense: number;
    netBalance: number;
}

export const TransactionOverview = ({income, expense, netBalance} : TransactionOverviewProp) => {
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
            <div className="text-2xl font-medium text-gray-600">ยอดคงเหลือ</div>
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
              -{Math.abs(expense).toLocaleString()} THB
            </div>
          </div>

          <div className="w-full p-6 bg-white rounded-2xl shadow-lg text-center">
            <div className="text-2xl font-medium text-gray-600">
              รายรับทั้งหมด
            </div>
            <div className="text-success text-3xl mt-2">
              +{income.toLocaleString()} THB
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
