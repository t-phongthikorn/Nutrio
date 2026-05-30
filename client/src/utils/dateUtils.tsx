export const formatThaiDate = (dateString: string): string => {
  const date = new Date(dateString);

  // 1. เช็คก่อนว่า Format วันที่ส่งมาถูกต้องไหม ถ้าระบบอ่านไม่ออก ให้ส่งสตริงว่างหรือค่าเดิมกลับไปก่อน กันแอปพัง
  if (isNaN(date.getTime())) {
    return dateString;
  }

  // 2. ใช้ option "2-digit" สำหรับปี เพื่อให้ตัดเหลือ 2 หลักท้าย (เช่น "69") อัตโนมัติในระบบ พ.ศ.
  const formatted = date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });

  // ผลลัพธ์ที่ได้จาก th-TH จะหน้าตาประมาณ "28 พ.ค. 69"
  return formatted;
};

export const getStartOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);
export const getEndOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);