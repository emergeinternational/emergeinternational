
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProductsPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to ProductManagementPage
    navigate("/admin/product-management");
  }, [navigate]);
  
  return null;
};

export default ProductsPage;
