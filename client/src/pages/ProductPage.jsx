import React, { useEffect } from 'react';
import ProductShowcase from '../components/ProductShowcase';

const ProductPage = () => {
  useEffect(() => {
    document.title = 'Product — CommercePilot AI | The Intelligence Engine for Modern Commerce';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="product-page-wrapper">
      <ProductShowcase />
    </div>
  );
};

export default ProductPage;
