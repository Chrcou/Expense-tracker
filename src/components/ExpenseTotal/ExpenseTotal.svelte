<script lang="ts">
import store,{totalTweenStore} from "../../shared/expanseStore";
import type { Expense } from "../../types/expense.type";
// import {totalTweenStore} from "../../shared/expanseStore";
let total=0;


store.subscribe((data)=>{

    total=data.reduce((acc:number,curr:Expense,)=>{
        return curr.subtotal+acc;
      },0)
    totalTweenStore.set(total);
    console.log("totalTweenStore", totalTweenStore)
  
    
})

</script>

<div>
    <div class="card" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Total</h5>
          <h6 class="card-subtitle mb-2 text-muted">All depenses</h6>
          <p class="card-text">{$totalTweenStore} €</p>
          <!-- <a href="#" class="card-link">Card link</a>
          <a href="#" class="card-link">Another link</a> -->
        </div>
      </div>
</div>

<style lang="scss">
    @import "ExpenseTotalStyles";
</style>
