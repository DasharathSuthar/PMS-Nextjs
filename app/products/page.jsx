'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductStore } from '@/store/useProductStore';
import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination';

const ProductsPage = () => {
  const { products, isLoading, error, fetchProducts } = useProductStore();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 4; //  number of products per page

  // Fetch all products only once
  useEffect(() => {
    fetchProducts().catch(err =>
      toast.error(err.message || 'Failed to fetch products')
    );
  }, [fetchProducts]);

  // Filter products locally
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter(
      product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category?.toLowerCase().includes(search.toLowerCase()) ||
        product.subCategory?.toLowerCase().includes(search.toLocaleLowerCase())
    );
  }, [products, search]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-blue-600">
        Products
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-4 sm:mb-6 gap-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-48 sm:w-64"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => setSearch('')} // clear search button
          variant="outline"
        >
          Clear
        </Button>
      </div>

      {/* Products List */}
      {isLoading ? (
        <p className="text-center text-sm sm:text-base">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-sm sm:text-base">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 text-sm sm:text-base">
          No products found
        </p>
      ) : (
        <>
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {paginatedProducts.map(product => (
                <Card
                  key={product.id}
                  className="shadow-md hover:shadow-lg transition p-2 flex flex-col justify-between"
                >
                  <CardHeader className="p-0 mb-1">
                    <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                      {product.name}
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {product.category}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {product.subCategory}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 p-0">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-24 sm:h-28 object-cover rounded"
                      />
                    )}
                    <p className="text-[11px] sm:text-xs line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[11px] sm:text-xs font-semibold">
                        Stock: {product.stock}
                      </p>
                      <p className="text-[11px] sm:text-xs font-semibold">
                        ₹{product.price}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-1 mt-1">
                    <Link href={`/products/${product.id}`} className="w-full">
                      <Button
                        size="sm"
                        className="w-full text-[11px] sm:text-xs"
                      >
                        View
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? 'opacity-50 pointer-events-none'
                          : ''
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(p => Math.min(p + 1, totalPages))
                      }
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? 'opacity-50 pointer-events-none'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default ProductsPage;
