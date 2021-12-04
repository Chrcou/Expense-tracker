<script lang="ts">
  let date;
  let paymentType;
  let category;
  let amount = "00.00";
  let quantity;
  $: subtotal = Number(amount) * quantity;

  import { createExpense } from "./createExpense";
  let localCreateExpense = () => {
    createExpense(
      date,
      paymentType,
      category,
      Number(amount),
      quantity,
      subtotal
    );
  };
</script>

<form on:submit|preventDefault={localCreateExpense}>
  <div class="form-group">
    <label for="date">Date</label>
    <input
      type="date"
      class="form-control"
      id="date"
      placeholder="dd/mm/yyyy"
      bind:value={date}
    />
  </div>
  <div class="form-group">
    <label for="paymentType">Payment type</label>
    <select class="form-control" id="paymentType" bind:value={paymentType}>
      <option value="cash">cash</option>
      <option value="card">card</option>
      <option value="direct-debit">direct debit</option>
      <option value="cheque">cheque</option>
    </select>
  </div>
  <div class="form-group">
    <label for="category">Category</label>
    <select class="form-control" id="category" bind:value={category}>
      <option value="rent">rent</option>
      <option value="electricity">electricity</option>
      <option value="food">food</option>
      <option value="phone">phone</option>
      <option value="gas">gas</option>
    </select>
  </div>
  <div class="form-group">
    <label for="amount">Amount</label>
    <input
      type="text"
      class="form-control"
      id="amount"
      placeholder="amount"
      bind:value={amount}
    />
  </div>
  <div class="form-group">
    <label for="quantity">Quantity</label>
    <input
      type="number"
      class="form-control"
      id="quantity"
      placeholder="quantity"
      bind:value={quantity}
    />
  </div>
  <button class="btn btn-success">create</button>
</form>

<style lang="scss">
  @import "expenseCreateStyles";
</style>
