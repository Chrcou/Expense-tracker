<script lang="ts">
import type { expense } from "../../types/expense.type";


export let expenses:expense[]
console.log("expenses",expenses)


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
        <tr>
            <th scope="row">1</th>
            <td>June 1rst</td>
            <td>direct debit</td>
            <td>eletricity</td>
            <td>60.45</td>
            <td>1</td>
            <td>60.45</td>
        </tr>
        <tr>
            <th scope="row">2</th>
            <td>June 2nd</td>
            <td>card</td>
            <td>tank refuel</td>
            <td>45.30</td>
            <td>1</td>
            <td>45.30</td>
        </tr>
        <tr>
            <th scope="row">3</th>
            <td>June 2nd</td>
            <td>cash</td>
            <td>wine</td>
            <td>6.50</td>
            <td>3</td>
            <td>19.50</td>
        </tr>
        <tr>
            <th scope="row">4</th>
            <td>June 3nd</td>
            <td>card</td>
            <td>weekly food</td>
            <td>120.39</td>
            <td>1</td>
            <td>120.39</td>
        </tr>
    </tbody>
</table>

  
<style lang="scss">
@import "ExpanseTableStyles";
</style>
