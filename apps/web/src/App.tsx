import { Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext'; 
import { CartProvider } from './context/CartContext';
import ShopContainer from './pages/Shop'; 
import ScrollToHash from './components/ScrollToHash';
import PaymentSuccess from './pages/PaymentSuccess'; 
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

function AppRoutes() { 
  return ( 
    <Routes> 
      <Route path="/payment/return" element={<PaymentSuccess />} /> 
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/shop" element={<ShopContainer />} /> 
      <Route path="/" element={<ShopContainer />} /> 
      <Route path="*" element={<Navigate to="/" />} /> 
    </Routes> 
  ); 
} 

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToHash />
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
