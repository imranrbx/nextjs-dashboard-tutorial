import Form from '@/app/ui/categories/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCategoryById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

const EditCategoryPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  const category = await fetchCategoryById(id);
  
  if (!category) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Categories', href: '/dashboard/categories' },
          {
            label: 'Edit Category',
            href: `/dashboard/categories/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form category={category} />
    </main>
  )
}

export default EditCategoryPage;

