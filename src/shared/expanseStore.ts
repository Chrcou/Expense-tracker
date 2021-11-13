import { writable } from "svelte/store";
import type { expense } from "../types/expense.type";

const storeDefaultValue:expense[]=[ {
    id: 1,
    date: "3rd",
    paymentType: "direct debit",
    category: "rent",
    amount: 600,
    quantity: 1,
    subtotal: 600,
  },  {
    id: 2,
    date: "1st",
    paymentType: "direct debit",
    category: "internet service provider",
    amount: 39,
    quantity: 1,
    subtotal: 39,
  }]
const store = writable(storeDefaultValue);


export default store