import { useState } from "react";
import type { ReactNode } from "react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CartModal from "./CartModal";
import MinecraftModal from "./MinecraftModal";
import EmailModal from "./EmailModal";
import SuccessModal from "./SuccessModal";

import styles from "../styles/Layout.module.css";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { apiFetch } from "../services/api";

interface LayoutProps {
  children: ReactNode;
  showCart?: boolean;
  showAccount?: boolean;
}

export default function Layout({
  children,
  showCart = true,
  showAccount = true,
}: LayoutProps) {
  const {
    user,
    refreshUser,
  } = useAuth();

  const {
    cart,
    clearCart,
  } = useCart();

  const [minecraftModalOpen, setMinecraftModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleLinkMinecraft = () => {
    setMinecraftModalOpen(true);
  };

  const handleLinkEmail = () => {
    setEmailModalOpen(true);
  };

  const handleMinecraftSuccess = async () => {
    await refreshUser();

    setSuccessMessage("¡Cuenta de Minecraft vinculada!");
    setIsSuccessOpen(true);
  };

  const handleEmailSuccess = async () => {
    await refreshUser();

    setSuccessMessage("¡Email vinculado correctamente!");
    setIsSuccessOpen(true);
  };

  const handleCheckout = async () => {
    if (!user?.minecraftUsername) {
      alert("⚠ Debes vincular tu cuenta de Minecraft");
      return;
    }

    if (!user?.email) {
      alert("⚠ Debes registrar tu email antes de comprar");
      return;
    }

    if (cart.length === 0) {
      alert("⚠ El carrito está vacío");
      return;
    }

    try {
      const result = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      clearCart();

      window.location.href = result.paymentUrl;
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className={styles.layout}>
      <Navbar
        username={user?.discordUsername ?? undefined}
        minecraftUsername={user?.minecraftUsername}
        email={user?.email}
        onLinkMinecraft={handleLinkMinecraft}
        onLinkEmail={handleLinkEmail}
        showCart={showCart}
        showAccount={showAccount}
      />

      <main className={styles.content}>
        {children}
      </main>

      {showCart && (
        <CartModal
          onCheckout={handleCheckout}
        />
      )}

      {minecraftModalOpen && (
        <MinecraftModal
          currentUsername={user?.minecraftUsername}
          onClose={() => setMinecraftModalOpen(false)}
          onSuccess={handleMinecraftSuccess}
        />
      )}

      {emailModalOpen && (
        <EmailModal
          currentEmail={user?.email}
          onClose={() => setEmailModalOpen(false)}
          onSuccess={handleEmailSuccess}
        />
      )}

      <SuccessModal
        isOpen={isSuccessOpen}
        message={successMessage}
        onClose={() => setIsSuccessOpen(false)}
      />

      <Footer />
    </div>
  );
}
