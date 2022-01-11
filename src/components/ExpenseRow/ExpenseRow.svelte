<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Expense } from "../../types/expense.type";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let expense: Expense;

  const fadeOptions = { duration: 700 };

  let isInEditMode = false;

  let itemEdit: Expense = {
    id: "",
    paymentType: "",
    amount: 0,
    quantity: 0,
    subtotal: 0,
    date: "",
    category: "",
  };

  function toggleEdit(exp: Expense): void {
      console.log(this)
    if (!isInEditMode) {
      itemEdit = { ...exp };
      isInEditMode = true;
    } else {
      isInEditMode = false;
    }

    // isInEditMode = !isInEditMode;
  }

  function handleInput(event, fieldName) {
    itemEdit[fieldName] = event.target.value;
    if (fieldName === "amount" || fieldName === "quantity") {
      itemEdit.subtotal = itemEdit.amount * itemEdit.quantity;
    }
  }

  function save(expense: Expense) {
    dispatch("expense-update", itemEdit);
    isInEditMode = false;
  }

  function deleteExpense(expense: Expense): void {
    dispatch("expense-delete", expense);
  }


//   console.log(self)
</script>

{#if !isInEditMode}
  <tr transition:fade={fadeOptions}>
    <td>
      {expense.id}
    </td>
    <td>{expense.date}</td>

    <td>{expense.paymentType}</td>
    <td>{expense.category}</td>
    <td>{expense.amount}</td>
    <td>{expense.quantity}</td>
    <td>{expense.subtotal}</td>
    <td class="actions">
      <button class="btn btn-dark"
        on:click={() => {
          toggleEdit(expense);
        }}>edit</button 
      >
      <button class="btn btn-dark" on:click={() => deleteExpense(expense)}>delete</button >
    </td>
  </tr>
{:else}
  <tr>
    <th scope="row">
      <span>{expense.id}</span >
    </th>

    <td
      ><input
        type="date"
        value={expense.date}
        on:change={(evt) => handleInput(evt, "date")}
      /></td
    >
    <td
      ><input
        type="text"
        value={expense.paymentType}
        on:input={(evt) => handleInput(evt, "paymentType")}
      /></td
    >
    <td
      ><input
        type="text"
        value={expense.category}
        on:input={(evt) => handleInput(evt, "category")}
      /></td
    >
    <td
      ><input
        type="number"
        value={expense.amount}
        on:change={(evt) => handleInput(evt, "amount")}
      /></td
    >
    <td
      ><input
        type="number"
        value={expense.quantity}
        on:change={(evt) => handleInput(evt, "quantity")}
      /></td
    >
    <td>{itemEdit.subtotal}</td>
    <td class="actions">
      <button class="btn btn-dark"
        on:click={() => {
          save(expense);
        }}>save</button 
      >
      <button class="btn btn-dark" on:click={toggleEdit.bind(this)}>cancel</button >
    </td>
  </tr>
  <div>in edit mode</div>
{/if}

<style lang="scss">
  @import "ExpenseRowStyles";
</style>
