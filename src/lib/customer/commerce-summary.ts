import type {State} from '@/lib/commerce/engine';
export function commerceSummary(state:Pick<State,'contracts'|'invoices'|'published'|'operatorStopped'>,today:string){
 const contract=state.contracts.at(-1);
 const unpaid=state.invoices.filter(i=>i.status!=='paid');
 const outstanding=unpaid.reduce((sum,i)=>sum+i.price.gross,0);
 const nextDue=unpaid.map(i=>i.dueOn).filter(date=>date>=today).sort()[0]??null;
 const payment=unpaid.some(i=>i.status==='failed')?'決済失敗あり':unpaid.some(i=>i.dueOn<today)?'支払期限超過あり':outstanding>0?'未決済あり':state.invoices.length?'未払いなし':'請求履歴なし';
 const first=contract?new Date(contract.startOn.slice(0,7)+'-01T00:00:00Z'):null;
 if(first)first.setUTCMonth(first.getUTCMonth()+6);
 const cancellationOn=first?.toISOString().slice(0,10)??null;
 if(first)first.setUTCDate(first.getUTCDate()-1);
 return {contract,contractLabel:!contract?'申込未完了':contract.finished?'契約終了':contract.endOn?'解約申請済み':'契約中',publicationLabel:contract?.finished?'非公開':state.operatorStopped?'一時停止中':state.published?'公開中':'非公開',outstanding,nextDue,payment,cancellationOn,minimumEnd:first?.toISOString().slice(0,10)??null};
}

export function customerDateTime(value?:string){if(!value)return '旧記録のため日時未記録';const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Tokyo'}).format(date):'日時を確認できません';}
