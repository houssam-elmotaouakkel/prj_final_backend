import React, { useState, useEffect } from 'react';
import { getProducts } from '../../api/products';
import ProductCard from '../../components/products/ProductCard';
import ProductFilter from '../../components/products/ProductFilter';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: '',
    inStock: undefined, // true, false, or undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prepare params for API call
        const params = {
          ...filters,
          inStock: filters.inStock === undefined ? undefined : String(filters.inStock), // Convert to string for URL query
        };
        
        const response = await getProducts(params);
        setProducts(response.data.data);
        setMeta(response.data.meta);
      } catch (err) {
        setError("Failed to fetch products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        🛒 All Products
      </h1>
      
      {/* Filters and Search */}
      <ProductFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {/* Product List */}
      {loading ? (
        <div className="text-center text-lg text-indigo-600">Loading products...</div>
      ) : error ? (
        <div className="text-center text-lg text-red-600">{error}</div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-400"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page **{meta.page}** of **{meta.pages}**
            </span>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= meta.pages}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-lg text-gray-500">No products found matching the criteria.</div>
      )}
    </div>
  );
};

export default ProductListPage;