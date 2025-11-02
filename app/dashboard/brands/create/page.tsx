import Form from '@/app/ui/brands/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

const CreateBrandPage = async () => {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Brands', href: '/dashboard/brands' },
          {
            label: 'Create Brand',
            href: '/dashboard/brands/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  )
}

export default CreateBrandPage;

