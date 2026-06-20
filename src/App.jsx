import { Routes, Route, Link } from "react-router-dom";
import { useCart } from "./context/CartContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";

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

function Inicio() {
  return (
    <main style={homeStyle}>
      <section style={heroStyle}>
        <div>
          <p style={eyebrowStyle}>Tienda virtual de plantas</p>

          <h1 style={titleStyle}>Herbalist</h1>

          <p style={subtitleStyle}>
            Plantas para interiores, regalos verdes y espacios más naturales.
          </p>

          <div style={actionsStyle}>
            <Link to="/catalogo" style={primaryButtonStyle}>
              Explorar plantas
            </Link>

            <Link to="/carrito" style={secondaryButtonStyle}>
              Ver carrito
            </Link>
          </div>
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
  minHeight: "calc(100vh - 74px)",
  display: "flex",
  alignItems: "center",
  padding: "60px 40px",
  background:
    "linear-gradient(120deg, rgba(238,243,233,1) 0%, rgba(223,233,220,1) 100%)",
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
  fontSize: "4rem",
};

const subtitleStyle = {
  maxWidth: "560px",
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