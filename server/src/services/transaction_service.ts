import supabase from "../api/supabaseClient";

export const insertTransactions = async (payload: any[], userId: string) => {
  console.log(payload);
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

export const editTransactions = async (item: any, userId: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      ...item,
      user_id: userId,
    })
    .eq("transaction_id", item.transaction_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};


export const deleteTransaction = async (
  transactionId: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("transaction_id", transactionId)
    .eq("user_id", userId) // 🔥 ป้องกันลบของคนอื่น
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};