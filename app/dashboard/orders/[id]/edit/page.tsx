import Form from '@/app/ui/orders/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchOrderById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

const EditOrderPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  const order = await fetchOrderById(id);
  
  if (!order) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Orders', href: '/dashboard/orders' },
          {
            label: 'Update Order Status',
            href: `/dashboard/orders/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form order={order} />
    </main>
  )
}

export default EditOrderPage;

