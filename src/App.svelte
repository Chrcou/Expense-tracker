<script lang="ts">
  import { onMount } from "svelte";
  import ExpanseTable from "./components/ExpanseTable/ExpanseTable.svelte";
  import ExpenseCreate from "./components/expenseCreate/expenseCreate.svelte";
  import store from "./shared/expenseStore";
  import type { Expense } from "./types/expense.type";
  import { db } from "./shared/firebase";
  import ExpenseTotal from "./components/ExpenseTotal/ExpenseTotal.svelte";
  export let title: string;

  let expenses: Expense[] = [];
  let expensesFirestore = [];
  store.subscribe((data: Expense[]) => {
    expenses = data;
  });

  onMount(() => {
    db.collection("expenses").onSnapshot((collectionSnapshot) => {
      expensesFirestore = [];
      collectionSnapshot.forEach((doc) => {
        expensesFirestore = [...expensesFirestore, doc.data() as Expense];
      });

      //console.log(("Dépense au sein de fireStore",expensesFirestore)
    });
  });
</script>
 <h1>{title}</h1>
<main>
 
  <div class="createAndTotal">
    <ExpenseTotal />
    <ExpenseCreate />
  </div>

  <ExpanseTable {expenses} />
</main>

<style lang="scss">
  @import "styles";
</style>
