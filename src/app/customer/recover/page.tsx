import {CustomerPassword} from "@/components/customer/CustomerPassword";
export default async function Page({searchParams}:{searchParams:Promise<{error?:string|string[]}>}){
 const {error}=await searchParams;
 const initialError=error==="expired"?"リンクが無効か期限切れです。再設定メールをもう一度リクエストしてください。":error==="unavailable"?"認証サービスに接続できませんでした。少し待ってから、元のメールのリンクを再度開いてください。":"";
 return <CustomerPassword recover initialError={initialError}/>;
}
