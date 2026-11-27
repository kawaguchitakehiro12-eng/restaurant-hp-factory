/** Invitation token stays in URL fragments, never query strings or browser storage. */
export function demoFragment(hash:string):string{const m=/^#demo=([A-Za-z0-9_-]{43})$/.exec(hash);return m?'#demo='+m[1]:'';}
export function customerLanding(hash:string):string{return demoFragment(hash)?'/customer/apply'+demoFragment(hash):'/customer';}
