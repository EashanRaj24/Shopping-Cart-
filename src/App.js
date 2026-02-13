import React, { useState, useEffect, useRef, useMemo, createContext } from 'react';
import useLocalStorage from './useLocalStorage'; // Updated path

const ThemeContext = createContext();

export default function App() {
  // 1. Persist theme using your custom hook
  const [theme, setTheme] = useLocalStorage("site-theme", "dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // 2. This Effect forces the browser's background to be black 
  // preventing the white bar at the bottom
  useEffect(() => {
    const bgColor = theme === 'dark' ? '#181818' : '#ffffff';
    document.body.style.backgroundColor = bgColor;
    document.body.style.margin = "0"; 
  }, [theme]);

  const containerStyle = {
    backgroundColor: theme === 'dark' ? '#181818' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    minHeight: '100vh', // Stretches the div to the bottom of the screen
    padding: '40px',
    transition: 'all 0.3s ease',
    fontFamily: 'sans-serif'
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div style={containerStyle}>  
        <h1>CartFlow</h1>
        <button 
            onClick={toggleTheme}
            style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px' }}
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        
        <hr style={{ margin: '30px 0', opacity: 0.2 }} />
        
        <div style={{ display: 'grid', gap: '40px' }}>
          <ShoppingCart />
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// --- Shopping Cart using All Hooks ---

const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Laptop', price: 150000, category: 'Electronics' },
  { id: 2, name: 'Phone', price: 80000, category: 'Electronics' },
  { id: 3, name: 'Headphones', price: 25000, category: 'Electronics' },
  { id: 4, name: 'T-Shirt', price: 1300, category: 'Clothing' },
  { id: 5, name: 'Jeans', price: 3999, category: 'Clothing' },
  { id: 6, name: 'Sneakers', price: 10000, category: 'Clothing' },
];

function ShoppingCart() {
  const theme = React.useContext(ThemeContext);
  
  // useState: Manage cart items, quantity, and filters
  const [cart, setCart] = useLocalStorage('shopping-cart', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState('');

  // useRef: Focus on search input and manage scroll
  const searchRef = useRef(null);
  const cartRef = useRef(null);

  // useEffect: Log cart updates and notification management
  useEffect(() => {
    console.log('Cart updated:', cart);
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [cart, notification]);

  // useMemo: Calculate filtered products, total price, and cart count
  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter(
      (product) =>
        (selectedCategory === 'All' || product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedCategory]);

  const { totalPrice, itemCount } = useMemo(() => {
    return {
      totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setNotification(`✓ ${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const containerStyle = {
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: theme === 'dark' ? '#222222' : '#f9f9f9',
    border: `1px solid ${theme === 'dark' ? '#333333' : '#e0e0e0'}`,
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const badgeStyle = {
    backgroundColor: '#4A90E2',
    color: '#ffffff',
    borderRadius: '50%',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginLeft: '8px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>🛒 Shopping Cart</h2>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          Total: ₹{totalPrice.toFixed(2)}
          <span style={badgeStyle}>{itemCount} items</span>
        </div>
      </div>

      {notification && (
        <div style={{
          backgroundColor: '#4CAF50',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
        }}>
          {notification}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
        
        {/* Product Catalog */}
        <div>
          <h3 style={{ marginTop: 0 }}>📦 Products</h3>
          
          {/* Search - using useRef to focus */}
          <input
            ref={searchRef}
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              marginBottom: '12px',
              border: `1px solid ${theme === 'dark' ? '#404040' : '#ddd'}`,
              borderRadius: '6px',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
              color: theme === 'dark' ? '#fff' : '#000',
              boxSizing: 'border-box',
            }}
          />

          {/* Category Filter - using useState for filtering */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {['All', 'Electronics', 'Clothing'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedCategory === category ? '#4A90E2' : (theme === 'dark' ? '#333333' : '#e8e8e8'),
                  color: selectedCategory === category ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#000000'),
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product List - using useMemo for filtering */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#404040' : '#ddd'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{product.name}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
                    {product.category} • ₹{product.price}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4A90E2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart - using useRef for scroll, useEffect for logging */}
        <div>
          <h3 style={{ marginTop: 0 }}>🛍️ Your Cart</h3>
          <div
            ref={cartRef}
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '12px',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
              borderRadius: '8px',
              border: `1px solid ${theme === 'dark' ? '#404040' : '#ddd'}`,
            }}
          >
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.6 }}>Your cart is empty</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
                    border: `1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{item.name}</strong>
                    <span style={{ opacity: 0.7 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: theme === 'dark' ? '#404040' : '#ddd',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center' }}>x{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: theme === 'dark' ? '#404040' : '#ddd',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginLeft: 'auto',
                        padding: '4px 8px',
                        backgroundColor: '#E74C3C',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Button */}
          {cart.length > 0 && (
            <button
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '12px',
                backgroundColor: '#4CAF50',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#45a049')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#4CAF50')}
            >
              Checkout (₹{totalPrice.toFixed(2)})
            </button>
          )}
        </div>
      </div>

      {/* Hook Explanation */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        borderRadius: '8px',
        fontSize: '12px',
        opacity: 0.8,
        lineHeight: '1.6',
      }}>
        <strong>Hooks Used:</strong>
        <ul style={{ margin: '8px 0 0 20px' }}>
          <li><strong>useState:</strong> Manage search, filters, and notifications</li>
          <li><strong>useEffect:</strong> Log cart updates and handle notifications</li>
          <li><strong>useRef:</strong> Focus search input and manage cart scroll</li>
          <li><strong>useMemo:</strong> Optimize filtered products and price calculations</li>
          <li><strong>useLocalStorage:</strong> Persist cart data across page refreshes</li>
        </ul>
      </div>
    </div>
  );
}