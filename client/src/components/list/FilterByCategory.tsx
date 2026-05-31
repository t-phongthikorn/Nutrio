import { useEffect, useState } from "react";
import {
  EXPENSE_CATEGORIES_TH,
  INCOME_CATEGORIES_TH,
} from "../../types/category.tsx";
import BackgroundIcon from "../background_icon";

interface FilterModalProps {
  selectedLabels: string[];
  onConfirm: (labels: string[]) => void;
}

export const FilterByCategoryModal = ({
  selectedLabels,
  onConfirm,
}: FilterModalProps) => {
  const [tempCategoryFilter, setTempCategoryFilter] = useState<string[]>([]);

  const handleToggle = (label: string) => {
    setTempCategoryFilter((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  useEffect(() => {
    setTempCategoryFilter(selectedLabels);
  }, [selectedLabels]);

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
                  <label key={id} className="label p-4 border border-gray-200 rounded-4xl text-gray-700">
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
                  <label key={id} className="label p-4 border border-gray-200 rounded-4xl text-gray-700">
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
              onClick={() => onConfirm(tempCategoryFilter)}
            >
              ยืนยัน
            </label>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="filter_by_category">
          Close
        </label>
      </div>
    </>
  );
};
