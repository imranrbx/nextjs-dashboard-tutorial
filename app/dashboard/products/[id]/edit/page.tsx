import Form from '@/app/ui/products/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchProductById, fetchCategories, fetchBrands } from '@/app/lib/data';
import { notFound } from 'next/navigation';

const EditProductPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  const [product, categories, brands] = await Promise.all([
    fetchProductById(id),
    fetchCategories(),
    fetchBrands(),
  ]);
  
  if (!product) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Products', href: '/dashboard/products' },
          {
            label: 'Edit Product',
            href: `/dashboard/products/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form product={product} categories={categories} brands={brands} />
    </main>
  )
}

export default EditProductPage;

