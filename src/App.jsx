import { useEffect, useState } from "react";
import "./App.css";

import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "./lib/supabase.js";

import Catalogo from "./pages/Catalogo.jsx";
import Carrito from "./pages/Carrito.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmacion from "./pages/Confirmacion.jsx";
import ContinuarCompra from "./pages/ContinuarCompra.jsx";
import Registro from "./pages/Registro.jsx";
import Login from "./pages/Login.jsx";
import MiCuenta from "./pages/MiCuenta.jsx";
import MisPedidos from "./pages/MisPedidos.jsx";
import CheckoutInvitado from "./pages/CheckoutInvitado.jsx";
import ConsultarPedido from "./pages/ConsultarPedido.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Admin from "./pages/Admin.jsx";

import { useCart } from "./context/CartContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function Inicio() {
  const { user, profile, signOut, isLoadingAuth } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  const userName =
    user?.user_metadata?.name || user?.email || "Usuario";

  const cartItemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    async function loadFeaturedProducts() {
      setIsLoadingProducts(true);
      setProductsError("");

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category,
          description,
          price,
          stock,
          image_url
        `)
        .eq("is_active", true)
        .gt("stock", 0)
        .order("created_at", { ascending: true })
        .limit(3);

      if (error) {
        setProductsError(
          `No se pudieron cargar las plantas destacadas: ${error.message}`
        );
        setIsLoadingProducts(false);
        return;
      }

      setFeaturedProducts(
        (data ?? []).map((product) => ({
          ...product,
          price: Number(product.price),
          stock: Number(product.stock),
        }))
      );

      setIsLoadingProducts(false);
    }

    loadFeaturedProducts();
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      alert(`No se pudo cerrar la sesión: ${error.message}`);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          Herbalist
        </Link>

        <nav className="navigation">
          <a href="#inicio">Inicio</a>
          <Link to="/catalogo">Plantas</Link>
          <a href="#cuidados">Cuidados</a>
          <Link to="/consultar-pedido">Consultar pedido</Link>

          {isLoadingAuth ? (
            <span>Revisando sesión...</span>
          ) : user ? (
            <>
              <Link to="/mi-cuenta">Hola, {userName}</Link>
              <Link to="/mis-pedidos">Mis pedidos</Link>

              {profile?.role === "admin" && (
                <Link to="/admin">Admin</Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  padding: 0,
                  border: "none",
                  background: "none",
                  color: "#34453a",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login">Iniciar sesión</Link>
          )}

          {user && cartItemCount > 0 && (
            <Link to="/checkout">Finalizar compra</Link>
          )}

          <Link to="/carrito">Carrito ({cartItemCount})</Link>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <p className="eyebrow">Naturaleza para cada espacio</p>
            <h1>Encuentra la planta ideal para tu hogar</h1>

            <p className="hero-description">
              Explora plantas de interior, suculentas y accesorios para llenar
              tus espacios de vida.
            </p>

            <Link to="/catalogo" className="primary-button">
              Explorar plantas
            </Link>
          </div>
        </section>

        <section className="products-section" id="plantas">
          <div className="section-heading">
            <p>Nuestra selección</p>
            <h2>Plantas destacadas</h2>
          </div>

          <div className="product-grid">
            {isLoadingProducts && <p>Cargando plantas destacadas...</p>}

            {productsError && (
              <p
                style={{
                  padding: "14px",
                  borderRadius: "6px",
                  backgroundColor: "#fde8e8",
                  color: "#8a1c1c",
                }}
              >
                {productsError}
              </p>
            )}

            {!isLoadingProducts &&
              !productsError &&
              featuredProducts.length === 0 && (
                <p>Actualmente no hay plantas destacadas disponibles.</p>
              )}

            {featuredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <div className="product-image">
                    <span>Fotografía de la planta</span>
                  </div>
                )}

                <div className="product-information">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>

                  {product.description && (
                    <p style={{ color: "#59655c", lineHeight: 1.5 }}>
                      {product.description}
                    </p>
                  )}

                  <p className="product-price">
                    ₡{product.price.toLocaleString("es-CR")}
                  </p>

                  <p style={{ color: "#315d40", fontWeight: "bold" }}>
                    Disponibles: {product.stock}
                  </p>

                  <Link
                    to="/catalogo"
                    style={{
                      display: "inline-block",
                      width: "100%",
                      padding: "12px",
                      boxSizing: "border-box",
                      borderRadius: "6px",
                      backgroundColor: "#315d40",
                      color: "white",
                      textAlign: "center",
                      textDecoration: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Ver en el catálogo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="care-section" id="cuidados">
          <div>
            <p className="eyebrow">Aprende con Herbalist</p>
            <h2>Cuida mejor tus plantas</h2>

            <p>
              Encuentra recomendaciones de iluminación, riego y mantenimiento
              para mantener tus plantas saludables.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <h2>Herbalist</h2>
        <p>Proyecto académico de comercio electrónico.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/producto/:id" element={<ProductoDetalle />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/continuar-compra" element={<ContinuarCompra />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/checkout-invitado" element={<CheckoutInvitado />} />

      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />

      <Route
        path="/mi-cuenta"
        element={
          <PrivateRoute>
            <MiCuenta />
          </PrivateRoute>
        }
      />

      <Route
        path="/mis-pedidos"
        element={
          <PrivateRoute>
            <MisPedidos />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route path="/confirmacion" element={<Confirmacion />} />
      <Route path="/consultar-pedido" element={<ConsultarPedido />} />
    </Routes>
  );
}

export default App;