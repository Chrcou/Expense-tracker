import type { Expense } from "../../types/expense.type";
import store from "../../shared/expanseStore";
export function createExpense(
  date: Expense["date"],
  paymentType: Expense["paymentType"],
  category: Expense["category"],
  amount: Expense["amount"],
  quantity: Expense["quantity"],
  subtotal: Expense["subtotal"]
): void {
  console.log("createExpanse");
  store.update((data: Expense[]) => {
    let id = data.length + 1;
    let newExpense = {
      id,
      paymentType,
      date,
      category,
      amount,
      quantity,
      subtotal,
    };

    return [...data, newExpense];
  });
}


