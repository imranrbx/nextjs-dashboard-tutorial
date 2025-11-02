import Form from '@/app/ui/coupons/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

const CreateCouponPage = async () => {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Coupons', href: '/dashboard/coupons' },
          {
            label: 'Create Coupon',
            href: '/dashboard/coupons/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  )
}

export default CreateCouponPage;

