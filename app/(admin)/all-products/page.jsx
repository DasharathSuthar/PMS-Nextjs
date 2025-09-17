'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { toast } from 'react-toastify';
import { categories } from '@/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination';

const ProductsPage = () => {
  const { products, isLoading, error, fetchProducts, editProduct } =
    useProductStore();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 5;

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter(
      product =>
        product.name.toLowerCase().includes(search.toLocaleLowerCase()) ||
        product.category
          ?.toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()) ||
        product.subCategory
          ?.toLocaleLowerCase()
          .includes(search.toLocaleLowerCase())
    );
  }, [products, search]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [currentPage, productsPerPage, filteredProducts]);

  const [editingProduct, setEditingProduct] = useState(null); // holds product being edited

  useEffect(() => {
    fetchProducts().catch(err =>
      toast.error(err.message || 'Failed to fetch products')
    );
  }, [fetchProducts]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  const handleSave = async () => {
    try {
      await editProduct(editingProduct.id, editingProduct);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50 relative">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Products Management
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
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product, i) => (
                <TableRow key={product.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.subCategory}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {product.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? 'opacity-50 pointer-events-none' : ''
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

      {/* Fixed Edit Form (right side panel) */}
      {editingProduct && (
        <div className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-lg border-l p-6 overflow-y-auto z-50">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Edit Product
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={editingProduct.name}
                onChange={e =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={editingProduct.category}
                onValueChange={value =>
                  setEditingProduct({
                    ...editingProduct,
                    category: value,
                    subCategory: '',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categories).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div>
              <Label>Subcategory</Label>
              <Select
                value={editingProduct.subCategory || ''}
                onValueChange={value =>
                  setEditingProduct({ ...editingProduct, subCategory: value })
                }
                disabled={!editingProduct.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {(categories[editingProduct.category] || []).map(subCat => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="Price"
                value={editingProduct.price}
                onChange={e =>
                  setEditingProduct({
                    ...editingProduct,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="Stock"
                value={editingProduct.stock}
                onChange={e =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description"
                value={editingProduct.description}
                onChange={e =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductsPage;
