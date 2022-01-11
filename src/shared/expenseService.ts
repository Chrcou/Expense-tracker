import type { Expense } from "../types/expense.type";
import { db } from "./firebase";

function createExpense(expense:Expense) {
  return db.collection('expenses').add(expense);
}

function readExpense() {
  return db.collection('expenses').get();
}
function updateExpense(expense:Expense) {
  return db.collection('expenses').doc(expense.id).update({...expense});
}

function deleteExpense(expense:Expense) {
  return db.collection('expenses').doc(expense.id).delete();
}

export const expenseService = {
  createExpense,
  readExpense,
  updateExpense,
  deleteExpense,
};
