import Form from '@/app/ui/brands/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchBrandById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

const EditBrandPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  const brand = await fetchBrandById(id);
  
  if (!brand) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Brands', href: '/dashboard/brands' },
          {
            label: 'Edit Brand',
            href: `/dashboard/brands/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form brand={brand} />
    </main>
  )
}

export default EditBrandPage;

