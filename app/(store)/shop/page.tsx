import { getStoreProducts } from '@/app/lib/store-service';
import { ProductCard } from '@/app/ui/store/product-card';

export default async function ShopPage() {
    const products = await getStoreProducts();

    return (
        <div className="space-y-8">
            <header className="space-y-3 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Shop
                </p>
                <h1 className="text-3xl font-bold text-gray-900">Find your next favorite</h1>
                <p className="text-base text-gray-600">
                    Curated products, transparent pricing, and a hassle-free checkout experience.
                </p>
            </header>

            {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                    <p className="text-lg font-semibold text-gray-900">No products yet</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Add products in the admin dashboard to see them here.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

