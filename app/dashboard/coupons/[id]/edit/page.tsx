import Form from '@/app/ui/coupons/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCouponById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

const EditCouponPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  const coupon = await fetchCouponById(id);
  
  if (!coupon) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Coupons', href: '/dashboard/coupons' },
          {
            label: 'Edit Coupon',
            href: `/dashboard/coupons/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form coupon={coupon} />
    </main>
  )
}

export default EditCouponPage;

