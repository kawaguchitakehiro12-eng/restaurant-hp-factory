import type { Metadata } from "next";
import "../admin/admin.css";
import "./customer.css";
export const metadata:Metadata={title:"SAKUPAGE | 店舗管理",robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return children;}
