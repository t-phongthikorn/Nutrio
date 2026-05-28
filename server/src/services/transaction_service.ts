import supabase from "../api/supabaseClient";

export const insertTransactions = async (
  payload: any[],
  userId: string
) => {
    console.log(payload)
  const dataWithUser = payload.map((item) => ({
    ...item,
    user_id: userId,
  }));

  const { data, error } = await supabase
    .from("transactions")
    .insert(dataWithUser)
    .select(); // เอาข้อมูลกลับมา

  if (error) {
    throw new Error(error.message);
  }

  return data;
};