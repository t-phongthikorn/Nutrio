import { QueryTransaction } from "../../types/transaction";
import { CATEGORY_COLORS, EXPENSE_CATEGORIES_TH, INCOME_CATEGORIES_TH } from "../../types/category";
import { Doughnut } from "react-chartjs-2";

interface incomeChartProp {
    transactions: QueryTransaction[];
    title: "รายรับ" | "รายจ่าย"
}

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

function buildChartData(
  transactions: QueryTransaction[],
  type: "รายรับ" | "รายจ่าย"
) {
    
  const categories =
    type === "รายรับ" ? INCOME_CATEGORIES_TH : EXPENSE_CATEGORIES_TH;
const targetType = type === "รายรับ" ? "income" : "expense";
  // init ทุก category = 0 (f    ix missing data problem)
  const map: Record<string, number> = Object.fromEntries(
    categories.map((c : any) => [c, 0])
  );

  for (const t of transactions) {
    if (t.type !== targetType) continue;

    const label = t.label?.trim();

    // 🔥 only count known category
    if (label && label in map) {
      map[label] += Math.abs(Number(t.amount) || 0);
    }
  }

  const labels = categories;
  const data = categories.map((c : any) => map[c]);
  const backgroundColor = categories.map(
    (c) => CATEGORY_COLORS[c] ?? "#9ca3af"
  );

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };
}


export const TransactionChart = ({transactions, title} : incomeChartProp) => {
    let data = buildChartData(transactions, title)
    console.log(data)
    const hasData = data.datasets[0].data.some((v) => v > 0);
    console.log(hasData)
  return (
    <>
      <div className="bg-white rounded-4xl shadow-xl p-4">
        <div className="text-center mb-5 text-3xl text-gray-600">รายรับ</div>
        {hasData ? (
          <div className="w-full h-64 sm:h-72 flex justify-center">
            <div className="w-full max-w-[280px]">
              <Doughnut data={data as any} options={options as any} />
            </div>
          </div>
        ) : (
          <div className="w-full text-center mt-32 text-4xl text-gray-300">
            ไม่มีรายรับ
          </div>
        )}
      </div>
    </>
  );
};

