import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useCart } from "./context/CartContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { supabase } from "./lib/supabase.js";

import Catalogo from "./pages/Catalogo.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Carrito from "./pages/Carrito.jsx";
import ContinuarCompra from "./pages/ContinuarCompra.jsx";
import Checkout from "./pages/Checkout.jsx";
import CheckoutInvitado from "./pages/CheckoutInvitado.jsx";
import Confirmacion from "./pages/Confirmacion.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import MiCuenta from "./pages/MiCuenta.jsx";
import MisPedidos from "./pages/MisPedidos.jsx";
import ConsultarPedido from "./pages/ConsultarPedido.jsx";
import Admin from "./pages/Admin.jsx";
import RecuperarPassword from "./pages/RecuperarPassword.jsx";
import ActualizarPassword from "./pages/ActualizarPassword.jsx";

import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  });
}

function Inicio() {
  const { user, profile } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  async function loadFeaturedProducts() {
    setIsLoadingFeatured(true);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, price, stock, image_url, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);

    setIsLoadingFeatured(false);

    if (error) {
      console.error("No se pudieron cargar productos destacados:", error);
      return;
    }

    setFeaturedProducts(data ?? []);
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <main style={homeStyle}>
      <section style={heroStyle}>
        <div style={heroContentStyle}>
          <p style={eyebrowStyle}>Tienda virtual de plantas</p>

          <h1 style={titleStyle}>Herbalist</h1>

          {user ? (
            <p style={welcomeStyle}>Hola, {displayName}. Bienvenido de nuevo.</p>
          ) : (
            <p style={welcomeStyle}>Bienvenido a Herbalist.</p>
          )}

          <p style={subtitleStyle}>
            Plantas para interiores, regalos verdes y espacios más naturales.
            Encuentra opciones fáciles de cuidar y registra tus pedidos en línea.
          </p>

          <div style={actionsStyle}>
            <Link to="/catalogo" style={primaryButtonStyle}>
              Explorar plantas
            </Link>

            <Link to="/carrito" style={secondaryButtonStyle}>
              Ver carrito
            </Link>

            {user && (
              <Link to="/mis-pedidos" style={secondaryButtonStyle}>
                Mis pedidos
              </Link>
            )}
          </div>
        </div>

        <div style={heroPanelStyle}>
          <div style={heroImageCardStyle}>
            <span style={heroIconStyle}>🌿</span>
            <h2 style={{ margin: "10px 0 8px" }}>Plantas seleccionadas</h2>
            <p style={{ margin: 0, color: "#4d5c4f" }}>
              Catálogo con stock, carrito, pedidos y administración.
            </p>
          </div>
        </div>
      </section>

      <section style={featuredSectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <p style={eyebrowStyle}>Catálogo</p>
            <h2 style={sectionTitleStyle}>Plantas destacadas</h2>
          </div>

          <Link to="/catalogo" style={smallLinkButtonStyle}>
            Ver todo el catálogo
          </Link>
        </div>

        {isLoadingFeatured ? (
          <p>Cargando plantas destacadas...</p>
        ) : featuredProducts.length === 0 ? (
          <p>No hay productos destacados disponibles.</p>
        ) : (
          <div style={featuredGridStyle}>
            {featuredProducts.map((product) => (
              <article key={product.id} style={productCardStyle}>
                <div style={imageWrapperStyle}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={productImageStyle}
                    />
                  ) : (
                    <div style={placeholderImageStyle}>🌱</div>
                  )}
                </div>

                <div style={productInfoStyle}>
                  <p style={categoryStyle}>{product.category}</p>

                  <h3 style={productTitleStyle}>{product.name}</h3>

                  <p style={priceStyle}>{formatCurrency(product.price)}</p>

                  <p style={stockStyle}>
                    {product.stock > 0
                      ? `Disponible: ${product.stock}`
                      : "Agotado"}
                  </p>

                  <Link
                    to={`/producto/${product.id}`}
                    style={productButtonStyle}
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={infoSectionStyle}>
        <div style={infoCardStyle}>
          <h3>Compra como invitado</h3>
          <p>
            Puedes hacer pedidos sin crear cuenta y consultar el estado con tu
            número de pedido y código.
          </p>
        </div>

        <div style={infoCardStyle}>
          <h3>Pago por SINPE</h3>
          <p>
            Los pedidos quedan pendientes hasta que el pago sea revisado por el
            administrador.
          </p>
        </div>

        <div style={infoCardStyle}>
          <h3>Seguimiento de pedidos</h3>
          <p>
            Los usuarios registrados pueden revisar sus pedidos desde su cuenta.
          </p>
        </div>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>Página no encontrada</h1>

        <p>La ruta que intentaste abrir no existe en Herbalist.</p>

        <Link to="/" style={primaryButtonStyle}>
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}

export default function App() {
  const { cart } = useCart();
  const { user, profile, signOut } = useAuth();

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  async function handleSignOut() {
    await signOut();
  }

  return (
    <>
      <header style={headerStyle}>
        <Link to="/" style={logoStyle}>
          Herbalist
        </Link>

        <nav style={navStyle}>
          <Link to="/catalogo" style={navLinkStyle}>
            Catálogo
          </Link>

          <Link to="/carrito" style={navLinkStyle}>
            Carrito ({totalItems})
          </Link>

          {user && (
            <>
              <Link to="/mi-cuenta" style={navLinkStyle}>
                Mi cuenta
              </Link>

              <Link to="/mis-pedidos" style={navLinkStyle}>
                Mis pedidos
              </Link>
            </>
          )}

          {profile?.role === "admin" && (
            <Link to="/admin" style={adminLinkStyle}>
              Admin
            </Link>
          )}

          {!user ? (
            <>
              <Link to="/login" style={navLinkStyle}>
                Iniciar sesión
              </Link>

              <Link to="/registro" style={registerLinkStyle}>
                Crear cuenta
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              style={logoutButtonStyle}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Inicio />} />

        <Route path="/catalogo" element={<Catalogo />} />

        <Route path="/producto/:id" element={<ProductoDetalle />} />

        <Route path="/carrito" element={<Carrito />} />

        <Route path="/continuar-compra" element={<ContinuarCompra />} />

        <Route path="/checkout-invitado" element={<CheckoutInvitado />} />

        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />

        <Route path="/confirmacion" element={<Confirmacion />} />

        <Route path="/login" element={<Login />} />

        <Route path="/registro" element={<Registro />} />

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

        <Route path="/consultar-pedido" element={<ConsultarPedido />} />

        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        <Route path="/actualizar-password" element={<ActualizarPassword />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  padding: "18px 40px",
  backgroundColor: "white",
  borderBottom: "1px solid #d9e0d5",
  position: "sticky",
  top: 0,
  zIndex: 10,
  flexWrap: "wrap",
};

const logoStyle = {
  color: "#315d40",
  fontSize: "1.5rem",
  fontWeight: "bold",
  textDecoration: "none",
};

const navStyle = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  flexWrap: "wrap",
};

const navLinkStyle = {
  color: "#315d40",
  textDecoration: "none",
  fontWeight: "bold",
};

const registerLinkStyle = {
  padding: "9px 13px",
  backgroundColor: "#315d40",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};

const adminLinkStyle = {
  padding: "9px 13px",
  backgroundColor: "#d4aa28",
  color: "#2f2a16",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};

const logoutButtonStyle = {
  padding: "9px 13px",
  border: "1px solid #315d40",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#315d40",
  fontWeight: "bold",
  cursor: "pointer",
};

const homeStyle = {
  minHeight: "calc(100vh - 74px)",
  backgroundColor: "#eef3e9",
};

const heroStyle = {
  minHeight: "520px",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
  gap: "36px",
  alignItems: "center",
  padding: "70px 40px",
  background:
    "linear-gradient(120deg, rgba(238,243,233,1) 0%, rgba(223,233,220,1) 100%)",
};

const heroContentStyle = {
  maxWidth: "680px",
};

const eyebrowStyle = {
  margin: "0 0 12px",
  color: "#315d40",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: 0,
  color: "#244d31",
  fontSize: "4.5rem",
  lineHeight: 1,
};

const welcomeStyle = {
  margin: "18px 0 0",
  color: "#315d40",
  fontSize: "1.15rem",
  fontWeight: "bold",
};

const subtitleStyle = {
  maxWidth: "620px",
  color: "#4d5c4f",
  fontSize: "1.25rem",
  lineHeight: 1.5,
};

const actionsStyle = {
  display: "flex",
  gap: "14px",
  marginTop: "28px",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  display: "inline-block",
  padding: "13px 18px",
  backgroundColor: "#315d40",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  display: "inline-block",
  padding: "13px 18px",
  backgroundColor: "white",
  color: "#315d40",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  border: "1px solid #315d40",
};

const heroPanelStyle = {
  display: "flex",
  justifyContent: "center",
};

const heroImageCardStyle = {
  width: "100%",
  maxWidth: "360px",
  minHeight: "260px",
  padding: "32px",
  borderRadius: "24px",
  backgroundColor: "white",
  boxShadow: "0 18px 45px rgba(49, 93, 64, 0.18)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
};

const heroIconStyle = {
  fontSize: "4rem",
};

const featuredSectionStyle = {
  padding: "55px 40px",
  backgroundColor: "white",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "24px",
  flexWrap: "wrap",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#244d31",
  fontSize: "2rem",
};

const smallLinkButtonStyle = {
  padding: "10px 14px",
  borderRadius: "6px",
  backgroundColor: "#eef3e9",
  color: "#315d40",
  textDecoration: "none",
  fontWeight: "bold",
};

const featuredGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "22px",
};

const productCardStyle = {
  overflow: "hidden",
  borderRadius: "14px",
  border: "1px solid #d9e0d5",
  backgroundColor: "#fbfcf9",
};

const imageWrapperStyle = {
  width: "100%",
  height: "210px",
  backgroundColor: "#eef3e9",
};

const productImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const placeholderImageStyle = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  fontSize: "3rem",
};

const productInfoStyle = {
  padding: "18px",
};

const categoryStyle = {
  margin: "0 0 6px",
  color: "#6a766b",
  fontSize: "0.9rem",
  fontWeight: "bold",
};

const productTitleStyle = {
  margin: "0 0 10px",
  color: "#244d31",
};

const priceStyle = {
  margin: "0 0 6px",
  fontWeight: "bold",
  color: "#315d40",
};

const stockStyle = {
  margin: "0 0 14px",
  color: "#4d5c4f",
};

const productButtonStyle = {
  display: "inline-block",
  padding: "10px 13px",
  backgroundColor: "#315d40",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};

const infoSectionStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  padding: "45px 40px",
};

const infoCardStyle = {
  padding: "22px",
  backgroundColor: "white",
  borderRadius: "12px",
  border: "1px solid #d9e0d5",
};

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 20px",
  backgroundColor: "#eef3e9",
};

const cardStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "10px",
};
