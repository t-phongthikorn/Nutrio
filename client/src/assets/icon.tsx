// icons.ts หรือจับยัดรวมไว้ในไฟล์สี Pantone ก็ได้ครับ
import foodIcon from './icon/food.svg';
import shoppingIcon from './icon/shopping.svg';
import travelIcon from './icon/travel.svg';
import entertainmentIcon from './icon/entertainment.svg';
import billsIcon from './icon/bills.svg';
import healthIcon from './icon/health.svg';
import maintenanceIcon from './icon/maintenance.svg';

import businessIcon from './icon/business.svg';
import giftIcon from './icon/gift.svg';
import loanIcon from './icon/loan.svg';
import salaryIcon from './icon/salary.svg';
import bonusIcon from './icon/bonus.svg';
import fallbackIcon from './icon/fallback.svg'; // ไอคอนสำหรับหมวดอื่น ๆ


// 2. 🔥 แมปชื่อคีย์ภาษาไทย (ตามข้อมูลในระบบ) ให้วิ่งไปเรียกตัวแปรภาษาอังกฤษข้างบน
export const CATEGORY_ICONS: Record<string, string> = {
  // === EXPENSE ===
  "ช้อปปิ้งและของใช้": shoppingIcon,
  "อาหาร": foodIcon,
  "เดินทาง": travelIcon,
  "บันเทิง": entertainmentIcon,
  "ค่าใช้จ่ายประจำ": billsIcon,
  "สุขภาพและยา": healthIcon,
  "ซ่อมบำรุง": maintenanceIcon,
  
  // === INCOME ===
  "ธุรกิจ": businessIcon,
  "ของขวัญ": giftIcon,
  "เงินกู้ยืม": loanIcon,
  "เงินเดือน": salaryIcon,
  "รายได้พิเศษ": bonusIcon,

  // === FALLBACK ===
  "อื่น ๆ": fallbackIcon,
};

