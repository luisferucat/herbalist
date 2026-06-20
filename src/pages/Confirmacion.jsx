import { Link, useLocation } from "react-router-dom";

const SINPE_PHONE = "8736-0393";
const PAYMENT_RECEIPT_EMAIL = "herbalistplants@gmail.com";

function getOrderLastFour(orderNumber) {
  if (!orderNumber) return "0000";

  const cleanValue = String(orderNumber).replace(/\s+/g, "");
  return cleanValue.slice(-4);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  });
}

export default function Confirmacion() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <main style={pageStyle}>
        <section style={cardStyle}>
          <h1>No hay un pedido para mostrar</h1>

          <p>
            La información del pedido no está disponible o la página fue
            recargada.
          </p>

          <Link to="/">Volver al inicio</Link>
        </section>
      </main>
    );
  }

  const orderLastFour = getOrderLastFour(order.number);
  const sinpeDetail = `${order.name} - Pedido ${orderLastFour}`;

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>Pedido registrado</h1>

        <p>
          Tu pedido fue registrado correctamente. Para continuar con el proceso,
          realizá el pago por SINPE Móvil.
        </p>

        <div style={orderNumberStyle}>
          <p style={{ margin: 0 }}>
            <strong>Número de pedido:</strong>
          </p>

          <p style={importantValueStyle}>{order.number}</p>
        </div>

        <section style={sinpeBoxStyle}>
          <h2 style={{ marginTop: 0 }}>Instrucciones de pago por SINPE</h2>

          <p style={sinpeTotalStyle}>
            <strong>Total del pedido:</strong> {formatCurrency(order.total)}
          </p>

          <p>
            <strong>Número de pago SINPE:</strong> {SINPE_PHONE}
          </p>

          <p>
            <strong>Detalle del SINPE:</strong> {sinpeDetail}
          </p>

          <p>
            <strong>Enviar comprobante a:</strong> {PAYMENT_RECEIPT_EMAIL}
          </p>

          <p style={sinpeNoticeStyle}>
            El pedido quedará en estado <strong>Pendiente</strong> hasta que el
            pago sea revisado y aprobado.
          </p>
        </section>

        {order.isGuest && order.accessCode && (
          <section style={guestCodeStyle}>
            <h2 style={{ marginTop: 0 }}>Código de consulta</h2>

            <p>
              Guarda este código junto con tu número de pedido. Los necesitarás
              para consultar el estado de la compra.
            </p>

            <p style={accessCodeStyle}>{order.accessCode}</p>

            <p style={{ marginBottom: 0 }}>
              Por seguridad, este código no volverá a mostrarse al recargar esta
              página.
            </p>
          </section>
        )}

        <div style={informationStyle}>
          <p>
            <strong>Fecha:</strong> {order.date}
          </p>

          <p>
            <strong>Cliente:</strong> {order.name}
          </p>

          <p>
            <strong>Correo:</strong> {order.email}
          </p>

          <p>
            <strong>Teléfono:</strong> {order.phone}
          </p>

          <p>
            <strong>Provincia:</strong> {order.province}
          </p>

          <p>
            <strong>Dirección de entrega:</strong> {order.address}
          </p>

          <p>
            <strong>Método de pago:</strong> SINPE
          </p>

          <p>
            <strong>Estado:</strong> {order.status}
          </p>
        </div>

        <h2>Productos</h2>

        {order.products.map((product) => (
          <div key={product.id} style={productStyle}>
            <strong>{product.name}</strong>

            <p style={{ margin: "5px 0" }}>Cantidad: {product.quantity}</p>

            <p style={{ margin: "5px 0" }}>
              Subtotal: {formatCurrency(product.price * product.quantity)}
            </p>
          </div>
        ))}

        <h2>Total: {formatCurrency(order.total)}</h2>

        <p style={simulationNoticeStyle}>
          Este es un pedido académico simulado. No se realizó ningún cobro real.
        </p>

        <div style={actionsStyle}>
          {order.isGuest && (
            <Link to="/consultar-pedido" style={secondaryButtonStyle}>
              Consultar pedido
            </Link>
          )}

          {!order.isGuest && (
            <Link to="/mis-pedidos" style={secondaryButtonStyle}>
              Ver mis pedidos
            </Link>
          )}

          <Link to="/" style={primaryButtonStyle}>
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 20px",
  backgroundColor: "#eef3e9",
};

const cardStyle = {
  maxWidth: "700px",
  margin: "0 auto",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "10px",
};

const orderNumberStyle = {
  marginTop: "25px",
  padding: "18px",
  backgroundColor: "#eef3e9",
  borderRadius: "8px",
};

const importantValueStyle = {
  margin: "8px 0 0",
  fontSize: "1.35rem",
  fontWeight: "bold",
  wordBreak: "break-word",
};

const sinpeBoxStyle = {
  marginTop: "22px",
  padding: "22px",
  backgroundColor: "#eaf4ec",
  border: "2px solid #315d40",
  borderRadius: "8px",
};

const sinpeTotalStyle = {
  fontSize: "1.2rem",
};

const sinpeNoticeStyle = {
  marginBottom: 0,
  padding: "12px",
  backgroundColor: "white",
  borderRadius: "6px",
};

const guestCodeStyle = {
  marginTop: "22px",
  padding: "22px",
  backgroundColor: "#fff4cf",
  border: "2px solid #d4aa28",
  borderRadius: "8px",
};

const accessCodeStyle = {
  margin: "18px 0",
  padding: "14px",
  backgroundColor: "white",
  borderRadius: "6px",
  fontSize: "1.6rem",
  fontWeight: "bold",
  letterSpacing: "4px",
  textAlign: "center",
};

const informationStyle = {
  marginTop: "25px",
};

const productStyle = {
  marginBottom: "10px",
  paddingBottom: "10px",
  borderBottom: "1px solid #dddddd",
};

const simulationNoticeStyle = {
  marginTop: "20px",
  padding: "15px",
  backgroundColor: "#eef3e9",
  borderRadius: "8px",
};

const actionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "20px",
};

const primaryButtonStyle = {
  display: "inline-block",
  padding: "12px 18px",
  backgroundColor: "#315d40",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  display: "inline-block",
  padding: "12px 18px",
  backgroundColor: "#dfe9dc",
  color: "#244d31",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};