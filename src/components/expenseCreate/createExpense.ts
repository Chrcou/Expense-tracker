import type { Expense } from "../../types/expense.type";
import store from "../../shared/expenseStore";
import { expenseService } from "../../shared/expenseService";
export function createExpense(
  date: Expense["date"],
  paymentType: Expense["paymentType"],
  category: Expense["category"],
  amount: Expense["amount"],
  quantity: Expense["quantity"],
  subtotal: Expense["subtotal"]
) {



    let newExpense:Expense = {
      paymentType,
      date,
      category,
      amount,
      quantity,
      subtotal,
    };

    expenseService.createExpense(newExpense).then((docRef) =>{
    console.log("docRef",docRef)
      store.update((data: Expense[]) => {
        return  [...data, { ...newExpense, id: docRef.id }];
      })
    })
  ;
}
