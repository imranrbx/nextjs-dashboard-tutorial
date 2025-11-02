import Form from '@/app/ui/categories/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

const CreateCategoryPage = async () => {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Categories', href: '/dashboard/categories' },
          {
            label: 'Create Category',
            href: '/dashboard/categories/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  )
}

export default CreateCategoryPage;

