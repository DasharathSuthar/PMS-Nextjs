import { create } from 'zustand';
import axios from 'axios';

export const useProductStore = create(set => ({
  products: [],
  isLoading: false,
  error: null,

  // fetch all products (no search query)
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get('/api/products/all');
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      set({ products: data.data, isLoading: false });
      return data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch products',
        isLoading: false,
      });
      throw err;
    }
  },

  // add new product
  addProduct: async productData => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });

      const { data } = await axios.post('/api/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!data.success)
        throw new Error(data.message || 'Failed to add product');

      set(state => ({
        products: [...state.products, data.data],
        isLoading: false,
      }));
      return data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to add product',
        isLoading: false,
      });
      throw err;
    }
  },

  //  edit product
  editProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.put(`/api/products/${id}`, productData);

      if (!data.success)
        throw new Error(data.message || 'Failed to update product');

      set(state => ({
        products: state.products.map(p => (p.id === id ? data.data : p)),
        isLoading: false,
      }));

      return data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to update product',
        isLoading: false,
      });
      throw err;
    }
  },

  // search products locally
  searchProducts: query =>
    set(state => ({
      products: state.products.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      ),
    })),

  setProducts: products => set({ products }),
}));
