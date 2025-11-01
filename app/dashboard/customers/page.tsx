import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredUsers } from '@/app/lib/data';

const CustomersPage = async (props: {
  searchParams?: Promise<{
    query?: string
  }>
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const customers = await fetchFilteredUsers(query);
  return (
    <div className="w-full">
      <CustomersTable customers={customers} />
    </div>
  )
}
export default CustomersPage;