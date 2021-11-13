<script lang="ts">
import ExpanseTable from "./components/ExpanseTable/ExpanseTable.svelte";
import store from "./shared/expanseStore";
import type { expense } from "./types/expense.type";
	export let title: string;



	let expenses:expense[]=[]
	store.subscribe((data:expense[])=>{
expenses=data
	})
</script>

<main>
	<h1> {title}</h1>
<ExpanseTable expenses={expenses}/>
</main>

<style lang="scss">
@import "styles"
</style>

