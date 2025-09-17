'use client';

import { useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/data';

const AddProductPage = () => {
  const { addProduct, isLoading } = useProductStore();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    price: '',
    stock: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(file ? URL.createObjectURL(file) : null);
    } else if (name === 'price' || name === 'stock') {
      setFormData({ ...formData, [name]: Math.max(0, Number(value)) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addProduct(formData);
      toast.success('Product added successfully!');
      setFormData({
        name: '',
        category: '',
        subCategory: '',
        description: '',
        price: '',
        stock: '',
        image: null,
      });
      setImagePreview(null);
    } catch (err) {
      toast.error(err.message || 'Failed to add product');
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Add New Product
        </h1>

        {/* Name */}
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={value =>
              setFormData({ ...formData, category: value, subCategory: '' })
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
        {formData.category && (
          <div>
            <Label htmlFor="subCategory">Subcategory</Label>
            <Select
              value={formData.subCategory}
              onValueChange={value =>
                setFormData({ ...formData, subCategory: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subcategory" />
              </SelectTrigger>
              <SelectContent>
                {(categories[formData.category] || []).map(subCat => (
                  <SelectItem key={subCat} value={subCat}>
                    {subCat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Product description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            placeholder="Price"
            min={0}
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        {/* Stock */}
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            placeholder="Stock quantity"
            min={0}
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>

        {/* Image */}
        <div>
          <Label htmlFor="image">Product Image</Label>
          <Input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div>
            <Label>Image Preview</Label>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}

        {/* Submit */}
        <Button type="submit" className="mt-4" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Product'}
        </Button>
      </form>
    </main>
  );
};

export default AddProductPage;
