import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import BrandsTable from '@/app/ui/brands/table';
import { CreateBrand } from '@/app/ui/brands/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchBrandsPages } from '@/app/lib/data';

const BrandsPage = async (props: {
  searchParams?: Promise<{
    query?: string
    page?: string
  }>
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchBrandsPages(query);
  
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Brands</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search brands..." />
        <CreateBrand />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <BrandsTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  )
}

export default BrandsPage;

