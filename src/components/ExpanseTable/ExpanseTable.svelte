<script lang="ts">
  import { expenseService } from "../../shared/expenseService";
  import store from "../../shared/expenseStore";

  // import {fade} from 'svelte/transition'
  import type { Expense } from "../../types/expense.type";
  import ExpenseRow from "../ExpenseRow/ExpenseRow.svelte";

  export let expenses: Expense[];
  //console.log(("expenses", expenses);
  const fadeOptions = { duration: 300 };

  function updateExpense(event:CustomEvent) {
    const updatedExpense: Expense = event.detail;
    expenseService.updateExpense(updatedExpense).then(() => {
      //console.log((updatedExpense);

      store.update((data) => {
        return data.map((expense: Expense) => {
          if (expense.id === updatedExpense.id) {
            return updatedExpense;
          } else {
            return expense;
          }
        });
      });
    });
  }

  function deleteExpense(event: CustomEvent) {
    const deletedExpense: Expense = event.detail;
    expenseService.deleteExpense(deletedExpense).then(() => {
      //console.log(("l'expense est supprimée du store :", deletedExpense);

      store.update((data) => {
        return [...data.filter((expense: Expense) => {
          return expense.id !== deletedExpense.id;
        })];
      });
    });
  }
</script>

<table class="table table-striped">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Date</th>
      <th scope="col">Payment type</th>
      <th scope="col">Category</th>
      <th scope="col">Amount</th>
      <th scope="col">Quantity</th>
      <th scope="col">Subtotal</th>
    </tr>
  </thead>
  <tbody>
    {#each expenses as exp}
      <ExpenseRow
        expense={exp}
        on:expense-update={updateExpense}
        on:expense-delete={deleteExpense}
      />
    {/each}
  </tbody>
</table>

<style lang="scss">
  @import "ExpanseTableStyles";
</style>
