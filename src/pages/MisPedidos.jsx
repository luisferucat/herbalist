import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MisPedidos() {
  const { user, isLoadingAuth } = useAuth();

  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] =
    useState(null);
  const [isLoadingOrders, setIsLoadingOrders] =
    useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setIsLoadingOrders(false);
        return;
      }

      setIsLoadingOrders(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          province,
          address,
          payment_method,
          status,
          total,
          created_at,
          order_items (
            id,
            product_id,
            product_name,
            category,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        setErrorMessage(
          `No se pudieron cargar los pedidos: ${error.message}`
        );
        setIsLoadingOrders(false);
        return;
      }

      setOrders(data ?? []);
      setIsLoadingOrders(false);
    }

    loadOrders();
  }, [user]);

  function toggleOrder(orderId) {
    setExpandedOrderId((currentId) =>
      currentId === orderId ? null : orderId
    );
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

  if (isLoadingAuth) {
    return (
      <main style={pageStyle}>
        <p>Revisando sesión...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={pageStyle}>
        <h1>Debes iniciar sesión</h1>

        <p>
          Solo los usuarios autenticados pueden consultar sus
          pedidos.
        </p>

        <Link
          to="/login"
          state={{ from: "/mis-pedidos" }}
        >
          Ir a iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Link to="/">← Volver al inicio</Link>

        <h1>Mis pedidos</h1>

        <p>
          Consulta el historial y el detalle de tus compras.
        </p>

        {isLoadingOrders && (
          <p>Cargando pedidos...</p>
        )}

        {errorMessage && (
          <p style={errorStyle}>
            {errorMessage}
          </p>
        )}

        {!isLoadingOrders &&
          !errorMessage &&
          orders.length === 0 && (
            <section style={emptyStyle}>
              <h2>Aún no tienes pedidos</h2>

              <p>
                Cuando realices una compra, aparecerá en esta
                sección.
              </p>

              <Link to="/catalogo">
                Ir al catálogo
              </Link>
            </section>
          )}

        <div style={ordersListStyle}>
          {orders.map((order) => {
            const isExpanded =
              expandedOrderId === order.id;

            return (
              <article
                key={order.id}
                style={orderCardStyle}
              >
                <div style={orderHeaderStyle}>
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
                    <strong>Total</strong>
                    <p>
                      {formatCurrency(order.total)}
                    </p>
                  </div>

                  <div>
                    <strong>Provincia</strong>
                    <p>{order.province}</p>
                  </div>

                  <div>
                    <strong>Método de pago</strong>
                    <p>{order.payment_method}</p>
                  </div>

                  <div>
                    <strong>Productos</strong>
                    <p>
                      {order.order_items?.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      ) ?? 0}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleOrder(order.id)
                  }
                  style={detailsButtonStyle}
                >
                  {isExpanded
                    ? "Ocultar detalle"
                    : "Ver detalle"}
                </button>

                {isExpanded && (
                  <section style={detailsStyle}>
                    <h3>Productos</h3>

                    {order.order_items?.length > 0 ? (
                      order.order_items.map((item) => (
                        <div
                          key={item.id}
                          style={productRowStyle}
                        >
                          <div>
                            <strong>
                              {item.product_name}
                            </strong>

                            {item.category && (
                              <p
                                style={
                                  secondaryTextStyle
                                }
                              >
                                {item.category}
                              </p>
                            )}
                          </div>

                          <div
                            style={{
                              textAlign: "right",
                            }}
                          >
                            <p>
                              {item.quantity} ×{" "}
                              {formatCurrency(
                                item.unit_price
                              )}
                            </p>

                            <strong>
                              {formatCurrency(
                                item.subtotal
                              )}
                            </strong>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>
                        Este pedido no tiene productos
                        registrados.
                      </p>
                    )}

                    <hr style={dividerStyle} />

                    <h3>Información de entrega</h3>

                    <p>
                      <strong>Nombre:</strong>{" "}
                      {order.customer_name}
                    </p>

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
                      {order.address},{" "}
                      {order.province}
                    </p>
                  </section>
                )}
              </article>
            );
          })}
        </div>
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
  maxWidth: "900px",
  margin: "0 auto",
};

const ordersListStyle = {
  display: "grid",
  gap: "22px",
  marginTop: "30px",
};

const orderCardStyle = {
  padding: "28px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
};

const orderHeaderStyle = {
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

const detailsButtonStyle = {
  width: "100%",
  marginTop: "22px",
  padding: "12px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#315d40",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
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

const errorStyle = {
  marginTop: "25px",
  padding: "14px",
  borderRadius: "6px",
  backgroundColor: "#fde8e8",
  color: "#8a1c1c",
};

const emptyStyle = {
  marginTop: "30px",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "12px",
  textAlign: "center",
};
