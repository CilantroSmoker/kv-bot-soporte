import { MorphIcon } from "morphicons/react";
import { Menu, X } from "lucide";
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  User as UserIcon,
  Gamepad2,
  Mail,
} from 'lucide-react';
import styles from '../styles/Navbar.module.css';

interface NavbarProps {
  username?: string;
  minecraftUsername?: string | null;
  email?: string | null;

  onLinkMinecraft?: () => void;
  onLinkEmail?: () => void;

  showCart?: boolean;
  showAccount?: boolean;
}

export default function Navbar({
  username,
  minecraftUsername,
  email,
  onLinkMinecraft,
  onLinkEmail,
  showCart = true,
  showAccount = true,
}: NavbarProps) {
  const {
    cartItemsCount,
    cartExpanded,
    setCartExpanded,
  } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     CERRAR CUENTA AL HACER CLICK FUERA
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* =========================================================
     CERRAR MENÚ MÓVIL AL CAMBIAR TAMAÑO
  ========================================================= */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /* =========================================================
     CERRAR MENÚ MÓVIL AL NAVEGAR
  ========================================================= */

  const handleNavigation = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>

      {/* =====================================================
          IZQUIERDA / LOGO
      ===================================================== */}

      <div className={styles.navLeft}>
        <Link
          to="/"
          className={styles.navBrand}
          onClick={handleNavigation}
        >
          <span>Koshi Village</span>
        </Link>
      </div>

      {/* =====================================================
          NAVEGACIÓN CENTRAL
      ===================================================== */}

      <div
        className={`${styles.navCenter} ${
          menuOpen ? styles.open : ''
        }`}
      >
        <Link
          to="/#products"
          className={styles.navLink}
          onClick={handleNavigation}
        >
          Productos
        </Link>

        <Link
          to="/terms"
          className={styles.navLink}
          onClick={handleNavigation}
        >
          Términos
        </Link>

        <Link
          to="/privacy"
          className={styles.navLink}
          onClick={handleNavigation}
        >
          Privacidad
        </Link>

        {/* ===================================================
            ACCIONES MÓVILES
        =================================================== */}

        {showAccount && (
          <div className={styles.mobileActions}>

            <div className={styles.mobileAccount}>
              <UserIcon size={17} />

              <span>
                {username ?? 'Cuenta'}
              </span>
            </div>

            <div className={styles.mobileAccountDetails}>

              <div className={styles.accountItem}>
                <strong>
                  <Gamepad2 size={16} />
                  Cuenta vinculada
                </strong>

                <span>
                  {minecraftUsername ?? 'No vinculada'}
                </span>

                <button
                  className={styles.actionButton}
                  onClick={onLinkMinecraft}
                >
                  {minecraftUsername ? 'Cambiar' : 'Vincular'}
                </button>
              </div>

              <div className={styles.accountItem}>
                <strong>
                  <Mail size={16} />
                  Email
                </strong>

                <span>
                  {email ?? 'No configurado'}
                </span>

                <button
                  className={styles.actionButton}
                  onClick={() => onLinkEmail?.()}
                >
                  {email ? 'Cambiar' : 'Agregar'}
                </button>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* =====================================================
          ACCIONES ESCRITORIO
      ===================================================== */}

      <div className={styles.navRight}>

        {/* ===================================================
            CUENTA
        =================================================== */}

        {showAccount && (
          <div
            ref={accountRef}
            className={styles.accountMenu}
          >
            <button
              type="button"
              className={styles.accountButton}
              onClick={() => setAccountOpen(!accountOpen)}
              aria-expanded={accountOpen}
              aria-label="Abrir menú de cuenta"
            >
              <UserIcon size={17} />

              <span>
                {username ?? 'Cuenta'}
              </span>

              <span
                className={`${styles.accountArrow} ${
                  accountOpen ? styles.accountArrowOpen : ''
                }`}
              >
                ▼
              </span>
            </button>

            {accountOpen && (
              <div className={styles.dropdown}>

                {/* Cuenta Discord */}

                <div className={styles.accountItem}>
                  <strong>
                    <UserIcon size={16} />
                    Cuenta Discord
                  </strong>

                  <span>
                    {username ?? 'Sin usuario'}
                  </span>
                </div>

                <div className={styles.dropdownDivider} />

                {/* Minecraft */}

                <div className={styles.accountItem}>
                  <strong>
                    <Gamepad2 size={16} />
                    Cuenta vinculada
                  </strong>

                  <span>
                    {minecraftUsername ?? 'No vinculada'}
                  </span>

                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={onLinkMinecraft}
                  >
                    {minecraftUsername ? 'Cambiar' : 'Vincular'}
                  </button>
                </div>

                <div className={styles.dropdownDivider} />

                {/* Email */}

                <div className={styles.accountItem}>
                  <strong>
                    <Mail size={16} />
                    Email
                  </strong>

                  <span>
                    {email ?? 'No configurado'}
                  </span>

                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => onLinkEmail?.()}
                  >
                    {email ? 'Cambiar' : 'Agregar'}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ===================================================
            CARRITO
        =================================================== */}

        {showCart && (
          <button
            type="button"
            className={styles.cartIcon}
            onClick={() => setCartExpanded(!cartExpanded)}
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={24} />

            {(cartItemsCount ?? 0) > 0 && (
              <span className={styles.cartBadge}>
                {cartItemsCount}
              </span>
            )}
          </button>
        )}

      </div>

      {/* =====================================================
          CARRITO MÓVIL
      ===================================================== */}

      {showCart && (
        <button
          type="button"
          className={styles.mobileCart}
          onClick={() => setCartExpanded(!cartExpanded)}
          aria-label="Abrir carrito"
        >
          <ShoppingCart size={24} />

          {(cartItemsCount ?? 0) > 0 && (
            <span className={styles.cartBadge}>
              {cartItemsCount}
            </span>
          )}
        </button>
      )}

      {/* =====================================================
          BOTÓN MENÚ MÓVIL
      ===================================================== */}

	<button
  type="button"
  className={styles.menuButton}
  onClick={() => setMenuOpen(prev => !prev)}
  aria-expanded={menuOpen}
  aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
>
  <MorphIcon
    icon={menuOpen ? X : Menu}
    size={30}
    color="currentColor"
    strokeWidth={2}
  />
</button>
    </nav>
  );
}
