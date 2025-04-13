import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Fetch products based on category filter
  const fetchProducts = async (categoryIds = []) => {
    setProductsLoaded(false);
    let url = `${import.meta.env.VITE_API_URL}/product?`;
    if (categoryIds.length > 0) {
      url += `&category_id=[${categoryIds.join(",")}]`;
    }
    try {
      const res = await axios.get(url);
      const mappedproducts = res.data.data.rows.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        price: parseFloat(p.price),
        threshold: p.threshold,
        quantity: p.quantity,
        description: p.description,
        // Convert category array into an array of names for display
        category: p.category?.map((c) => c.name) || [],
        image: p.image
          ? `data:image/${p.image_extension};base64,${p.image}`
          : "",
      }));
      setProducts(mappedproducts);
      setProductsLoaded(true);
    } catch (err) {
      console.error(
        "Failed to fetch products:",
        err.response?.data || err.message,
      );
      setProductsLoaded(true);
    }
  };

  // Fetch products on first render
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products when selected categories change
  useEffect(() => {
    fetchProducts(selectedCategoryIds);
  }, [selectedCategoryIds]);

  // Build a product map for quick lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Load cart from localStorage on initial app render
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
    setCartLoaded(true);
  }, []);

  // Update localStorage when cartItems change
  useEffect(() => {
    if (cartLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, cartLoaded]);

  ///////////////////////////////
  // PRODUCT CONTEXT FUNCTIONS //
  ///////////////////////////////

  // Get array of all products
  const getProductArray = () => products;

  // Get a single product by ID
  const getProduct = (id) => {
    return products.find((p) => p.id === parseInt(id, 10));
  };

  // POST request to add a new product
  const addProduct = async (productData) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/product`;
      const token = localStorage.getItem("token");

      const res = await axios.post(url, productData, {
        headers: {
          Authorization: token,
        },
      });
      const newProduct = res.data.data;

      // Update local state
      setProducts((prev) => [
        ...prev,
        {
          id: newProduct.id,
          sku: newProduct.sku,
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          threshold: newProduct.threshold,
          quantity: newProduct.quantity,
          description: newProduct.description,
          category: newProduct.category?.map((c) => c.name) || [],
          image: newProduct.image
            ? `data:image/${newProduct.image_extension};base64,${newProduct.image}`
            : "",
        },
      ]);

      return newProduct;
    } catch (err) {
      console.error(
        "Failed to add product:",
        err.response?.data || err.message,
      );
      throw err;
    }
  };

  // PATCH request to update an existing product
  const updateProduct = async (id, productData) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/product/${id}`;
      const token = localStorage.getItem("token");
      const res = await axios.patch(url, productData, {
        headers: {
          Authorization: token,
        },
      });
      const updated = res.data.data;

      // Update frontend state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? {
                id: updated.id,
                sku: updated.sku,
                name: updated.name,
                price: parseFloat(updated.price),
                threshold: updated.threshold,
                quantity: updated.quantity,
                description: updated.description,
                category: updated.category?.map((c) => c.name) || [],
                image: updated.image
                  ? `data:image/${updated.image_extension};base64,${updated.image}`
                  : "",
              }
            : p,
        ),
      );

      return updated;
    } catch (err) {
      console.error(
        "Failed to update product:",
        err.response?.data || err.message,
      );
      throw err;
    }
  };

  // PATCH request to update an existing product image
  const uploadProductImage = async (productId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL}/product/${productId}/image`;

    try {
      const res = await axios.patch(url, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res.data.data;

      // Update frontend state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? {
                ...p,
                image: updated.image
                  ? `data:image/${updated.image_extension};base64,${updated.image}`
                  : "",
              }
            : p,
        ),
      );

      return updated;
    } catch (err) {
      console.error(
        "Failed to upload image:",
        err.response?.data || err.message,
      );
      throw err;
    }
  };

  // DELETE request to delete an existing product
  const deleteProduct = async (id) => {
    const url = `${import.meta.env.VITE_API_URL}/product/${id}`;
    const token = localStorage.getItem("token");

    try {
      await axios.delete(url, {
        headers: {
          Authorization: token,
        },
      });
      // Update frontend state
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err.response?.data || err.message,
      );
      throw err;
    }
  };

  // PATCH request to add/restock products
  const restockProduct = async (id, quantity) => {
    const url = `${import.meta.env.VITE_API_URL}/product/${id}/restock`;
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        url,
        { quantity },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      // Update frontend state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + quantity } : p,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to restock product:",
        err.response?.data || err.message,
      );
      throw err;
    }
  };

  ////////////////////////////
  // CART CONTEXT FUNCTIONS //
  ////////////////////////////

  const getCartAmount = () => {
    return cartItems
      .reduce((total, cartItem) => {
        const product = productMap.get(cartItem.id);
        return product ? total + product.price * cartItem.quantity : total;
      }, 0)
      .toFixed(2);
  };

  const getCartQuantity = () =>
    cartLoaded
      ? cartItems.reduce((total, item) => total + item.quantity, 0)
      : 0;

  const addToCart = (productId, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      const product = productMap.get(productId);

      if (!product || typeof product.quantity !== "number") {
        return prev;
      }

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        const limitedQuantity = Math.min(newQuantity, product.quantity);
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: limitedQuantity } : item,
        );
      }

      const limitedQuantity = Math.min(quantity, product.quantity);
      if (limitedQuantity > 0) {
        return [...prev, { id: productId, quantity: limitedQuantity }];
      }

      return prev;
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) => {
      const product = productMap.get(id);
      if (!product || typeof product.quantity !== "number") {
        return prev;
      }
      return prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          const limitedQuantity = Math.min(newQuantity, product.quantity);
          return { ...item, quantity: limitedQuantity };
        }
        return item;
      });
    });
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  ///////////////////////////////
  // CATEGORY CONTEXT FUNCTIONS //
  ///////////////////////////////

  const updateSelectedCategories = (categoryIds) => {
    setSelectedCategoryIds(categoryIds);
  };

  return (
    <ShopContext.Provider
      value={{
        // Cart
        cartItems,
        cartLoaded,
        getCartAmount,
        getCartQuantity,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,

        // Products
        productsLoaded,
        getProductArray,
        getProduct,
        addProduct,
        updateProduct,
        uploadProductImage,
        deleteProduct,
        restockProduct,

        // Categories
        categories,
        categoriesLoaded,
        updateSelectedCategories,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}
