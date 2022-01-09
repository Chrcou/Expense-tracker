import { writable } from "svelte/store";
import type { Expense } from "../types/expense.type";
import { tweened } from "svelte/motion";
import { cubicOut } from "svelte/easing";
import { expenseService } from "./expenseService";
// const storeDefaultValue:Expense[]=[ {
//     id: '1',
//     date: "3rd",
//     paymentType: "direct debit",
//     category: "rent",
//     amount: 600,
//     quantity: 1,
//     subtotal: 600,
//   },  {
//     id: '2',
//     date: "1st",
//     paymentType: "direct debit",
//     category: "internet service provider",
//     amount: 39,
//     quantity: 1,
//     subtotal: 39,
//   }]
let expensesFirestore = [];
expenseService
  .readExpense()
  .then((snapshot) => {
    expensesFirestore = [];
    snapshot.forEach((doc) => {
      console.log("doc", doc);
      expensesFirestore = [...expensesFirestore, {...doc.data(), id: doc.id}];
    });

    console.log(expensesFirestore);
    store.set(expensesFirestore);
  })
  .catch((msg) => {
    console.log("error", msg);
  });
const store = writable(expensesFirestore);

export default store;
export const totalTweenStore = tweened(0, {
  easing: cubicOut,
  duration: 500,
  delay: 800,
});
