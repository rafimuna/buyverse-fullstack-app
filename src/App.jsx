import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SearchResults from './pages/SearchResults';
import { AppProvider } from './context/AppContext';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import { Toaster } from 'react-hot-toast';
import ProductDetails from './pages/ProductDetails';
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <AppProvider>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />

    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/category/:slug" element={<ProductsPage />} />
      </Routes>
    </Router>
    </AppProvider>
  );
}

export default App;