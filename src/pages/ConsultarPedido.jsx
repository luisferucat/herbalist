import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function ConsultarPedido() {
  const [orderNumber, setOrderNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [order, setOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSearching) {
      return;
    }

    setIsSearching(true);
    setErrorMessage("");
    setOrder(null);

    const cleanOrderNumber = orderNumber.trim();
    const cleanAccessCode = accessCode.trim();

    try {
      const { data, error } = await supabase.rpc(
        "get_guest_order",
        {
          order_number_input: cleanOrderNumber,
          access_code_input: cleanAccessCode,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      setOrder(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo consultar el pedido."
      );
    } finally {
      setIsSearching(false);
    }
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString("es-CR", {
      style: "currency",
      currency: "CRC",
      maximumFractionDigits: 0,
    });
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("es-CR");
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Link to="/">← Volver al inicio</Link>

        <section style={cardStyle}>
          <h1>Consultar pedido</h1>

          <p>
            Ingresa el número de pedido y el código de consulta
            recibido al confirmar la compra.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label htmlFor="orderNumber">
                Número de pedido
              </label>

              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(event) =>
                  setOrderNumber(event.target.value)
                }
                placeholder="HER-2026..."
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="accessCode">
                Código de consulta
              </label>

              <input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(event) =>
                  setAccessCode(
                    event.target.value.toUpperCase()
                  )
                }
                maxLength={8}
                required
                style={{
                  ...inputStyle,
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                }}
              />
            </div>

            {errorMessage && (
              <p style={errorStyle}>
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSearching}
              style={{
                ...buttonStyle,
                opacity: isSearching ? 0.7 : 1,
                cursor: isSearching
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {isSearching
                ? "Consultando..."
                : "Consultar pedido"}
            </button>
          </form>
        </section>

        {order && (
          <section style={cardStyle}>
            <div style={headerStyle}>
              <div>
                <h2 style={{ marginBottom: "8px" }}>
                  Pedido {order.order_number}
                </h2>

                <p style={secondaryTextStyle}>
                  {formatDate(order.created_at)}
                </p>
              </div>

              <span style={statusStyle}>
                {order.status}
              </span>
            </div>

            <div style={summaryGridStyle}>
              <div>
                <strong>Cliente</strong>
                <p>{order.customer_name}</p>
              </div>

              <div>
                <strong>Total</strong>
                <p>{formatCurrency(order.total)}</p>
              </div>

              <div>
                <strong>Provincia</strong>
                <p>{order.province}</p>
              </div>

              <div>
                <strong>Método de pago</strong>
                <p>{order.payment_method}</p>
              </div>
            </div>

            <section style={detailsStyle}>
              <h3>Productos</h3>

              {order.items?.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    style={productRowStyle}
                  >
                    <div>
                      <strong>
                        {item.product_name}
                      </strong>

                      {item.category && (
                        <p style={secondaryTextStyle}>
                          {item.category}
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p>
                        {item.quantity} ×{" "}
                        {formatCurrency(item.unit_price)}
                      </p>

                      <strong>
                        {formatCurrency(item.subtotal)}
                      </strong>
                    </div>
                  </div>
                ))
              ) : (
                <p>
                  Este pedido no tiene productos registrados.
                </p>
              )}

              <hr style={dividerStyle} />

              <h3>Información de entrega</h3>

              <p>
                <strong>Correo:</strong>{" "}
                {order.customer_email}
              </p>

              <p>
                <strong>Teléfono:</strong>{" "}
                {order.customer_phone}
              </p>

              <p>
                <strong>Dirección:</strong>{" "}
                {order.address}, {order.province}
              </p>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 20px",
  backgroundColor: "#eef3e9",
};

const containerStyle = {
  maxWidth: "800px",
  margin: "0 auto",
};

const cardStyle = {
  marginTop: "30px",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
};

const fieldStyle = {
  marginBottom: "20px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  padding: "12px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#315d40",
  color: "white",
  fontWeight: "bold",
};

const errorStyle = {
  padding: "12px",
  borderRadius: "6px",
  backgroundColor: "#fde8e8",
  color: "#8a1c1c",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "flex-start",
};

const statusStyle = {
  padding: "8px 12px",
  borderRadius: "999px",
  backgroundColor: "#e5f3e8",
  color: "#244d31",
  fontWeight: "bold",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "20px",
  marginTop: "24px",
};

const detailsStyle = {
  marginTop: "24px",
  padding: "20px",
  backgroundColor: "#f5f7f2",
  borderRadius: "8px",
};

const productRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  padding: "15px 0",
  borderBottom: "1px solid #d7dfd4",
};

const secondaryTextStyle = {
  margin: 0,
  color: "#667066",
};

const dividerStyle = {
  margin: "25px 0",
  border: "none",
  borderTop: "1px solid #ccd5c8",
};