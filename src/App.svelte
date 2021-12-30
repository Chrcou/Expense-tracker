<script lang="ts">
	import ExpanseTable from "./components/ExpanseTable/ExpanseTable.svelte";
	import ExpenseCreate from "./components/expenseCreate/expenseCreate.svelte";
	import store from "./shared/expanseStore";
	import type { Expense } from "./types/expense.type";

	import ExpenseTotal from "./components/ExpenseTotal/ExpenseTotal.svelte";
	export let title: string;

	let expenses: Expense[] = [];
	store.subscribe((data: Expense[]) => {
		expenses = data;
	});
</script>

<main>
	<h1>{title}</h1>

	<ExpenseTotal />
	<ExpenseCreate />
	<ExpanseTable {expenses} />
</main>

<style lang="scss">
	@import "styles";
</style>
