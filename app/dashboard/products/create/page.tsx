import Form from '@/app/ui/products/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCategories, fetchBrands } from '@/app/lib/data';

const CreateProductPage = async () => {
  const [categories, brands] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Products', href: '/dashboard/products' },
          {
            label: 'Create Product',
            href: '/dashboard/products/create',
            active: true,
          },
        ]}
      />
      <Form categories={categories} brands={brands} />
    </main>
  )
}

export default CreateProductPage;

