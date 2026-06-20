import { PageHeader } from "@/components/admin/PageHeader";
import { customers } from "@/data/admin/mock";
import { formatDate } from "@/lib/admin/labels";

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="顧客一覧"
        description="契約顧客の管理"
        action={
          <button type="button" className="admin-btn admin-btn--secondary">
            顧客を追加
          </button>
        }
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>顧客名</th>
              <th>メール</th>
              <th>電話番号</th>
              <th>登録日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="font-medium">{customer.name}</td>
                <td>{customer.contactEmail}</td>
                <td>{customer.contactPhone}</td>
                <td>{formatDate(customer.createdAt)}</td>
                <td>
                  <button type="button" className="admin-btn admin-btn--ghost">
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
