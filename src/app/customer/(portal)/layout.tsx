import Link from "next/link";
import {redirect} from "next/navigation";
import {CustomerAccessError,requireCustomerUser} from "@/lib/customer/server";
import {CustomerAccount} from "@/components/customer/CustomerAccount";
export const dynamic = "force-dynamic";
export default async function Layout({children}:{children:React.ReactNode}){
 try{await requireCustomerUser();}catch(error){if(error instanceof CustomerAccessError&&error.status===401)redirect("/customer/login");throw error;}
 return <div className="admin-root customer-root"><header className="customer-header"><Link href="/customer" className="customer-brand">SAKUPAGE <span>店舗管理</span></Link><Link href="/customer">店舗一覧</Link><CustomerAccount/></header><main className="customer-main">{children}</main></div>;
}
