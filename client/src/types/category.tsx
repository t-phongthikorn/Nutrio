// 1. 🇹🇭 Category รายรับ-รายจ่าย เวอร์ชันภาษาไทย (มีอยู่แล้ว)
export const INCOME_CATEGORIES_TH = [
  "ธุรกิจ",
  "ของขวัญ",
  "เงินกู้ยืม",
  "เงินเดือน",
  "รายได้พิเศษ",
  "อื่น ๆ",
] as const;

export const EXPENSE_CATEGORIES_TH = [
  "ช้อปปิ้งและของใช้",
  "อาหาร",
  "เดินทาง",
  "บันเทิง",
  "ค่าใช้จ่ายประจำ",
  "สุขภาพและยา",
  "ซ่อมบำรุง",
  "อื่น ๆ",
] as const;

// 2. 🇬🇧 Category รายรับ-รายจ่าย เวอร์ชันภาษาอังกฤษ (ตรงกับชื่อตัวแปร Icon เป๊ะ ๆ)
export const INCOME_CATEGORIES_EN = [
  "business",
  "gift",
  "loan",
  "salary",
  "bonus",
  "fallback",
] as const;

export const EXPENSE_CATEGORIES_EN = [
  "shopping",
  "food",
  "travel",
  "entertainment",
  "bills",
  "health",
  "maintenance",
  "fallback",
] as const;

// 3. 🔄 Record สำหรับเปลี่ยนภาษาไทย ➡️ อังกฤษ (Category Translation Map)
// เอาไว้ใช้เวลาจะดึงชื่อไอคอนภาษาอังกฤษ หรือทำระบบสลับภาษา
export const TH_TO_EN_CATEGORIES: Record<string, string> = {
  // === EXPENSE ===
  "ช้อปปิ้งและของใช้": "shopping",
  "อาหาร": "food",
  "เดินทาง": "travel",
  "บันเทิง": "entertainment",
  "ค่าใช้จ่ายประจำ": "bills",
  "สุขภาพและยา": "health",
  "ซ่อมบำรุง": "maintenance",

  // === INCOME ===
  "ธุรกิจ": "business",
  "ของขวัญ": "gift",
  "เงินกู้ยืม": "loan",
  "เงินเดือน": "salary",
  "รายได้พิเศษ": "bonus",

  // === FALLBACK ===
  "อื่น ๆ": "fallback",
};


export const CATEGORY_COLORS: Record<string, string> = {
  ธุรกิจ: "#1F3A60",
  ของขวัญ: "#FFC6FF",
  เงินกู้ยืม: "#B3C5D7",
  เงินเดือน: "#A3E4D7",
  รายได้พิเศษ: "#FFD166",

  ช้อปปิ้งและของใช้: "#FFB7B2",
  อาหาร: "#FCD5A1",
  เดินทาง: "#A9DEF9",
  บันเทิง: "#CFBAF0",
  ค่าใช้จ่ายประจำ: "#E8AEB7",
  สุขภาพและยา: "#98DDCA",
  ซ่อมบำรุง: "#D3D3D3",

  "อื่น ๆ": "#9ca3af",
};

// 4. 🗂️ เวอร์ชันที่รวม CATEGORY ภาษาไทยทั้งหมดไว้ด้วยกัน (ไม่มีตัวซ้ำ)
// เหมาะมากสำหรับเอาไปทำปุ่ม Filter หรือใช้ลูปเช็คประเภทข้อมูลทั้งหมด
export const ALL_CATEGORIES_TH = Array.from(
  new Set([...INCOME_CATEGORIES_TH, ...EXPENSE_CATEGORIES_TH])
);