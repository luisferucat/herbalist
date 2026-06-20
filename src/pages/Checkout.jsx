
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const savedName =
    user?.user_metadata?.name || "";

  const savedPhone =
    user?.user_metadata?.phone || "";

  const savedEmail = user?.email || "";

  const estimatedTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) * Number(item.quantity),
    0
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (isProcessing) {
      return;
    }

    if (!user) {
      navigate("/continuar-compra");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage(
        "Debes agregar al menos un producto antes de confirmar el pedido."
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    const formData = new FormData(
      event.currentTarget
    );

    const customerName = String(
      formData.get("name") || ""
    ).trim();

    const customerEmail = String(
      formData.get("email") || ""
    ).trim();

    const customerPhone = String(
      formData.get("phone") || ""
    ).trim();

    const province = String(
      formData.get("province") || ""
    ).trim();

    const address = String(
      formData.get("address") || ""
    ).trim();

    const paymentMethod = String(
      formData.get("paymentMethod") || ""
    ).trim();

    const requestedItems = cart.map((item) => ({
      product_id: Number(item.id),
      quantity: Number(item.quantity),
    }));

    try {
      const { data, error } = await supabase.rpc(
        "create_authenticated_order",
        {
          customer_name_input: customerName,
          customer_email_input: customerEmail,
          customer_phone_input: customerPhone,
          province_input: province,
          address_input: address,
          payment_method_input: paymentMethod,
          items_input: requestedItems,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.id || !data?.order_number) {
        throw new Error(
          "Supabase no devolvió la información completa del pedido."
        );
      }

      const confirmedProducts = (
        data.items ?? []
      ).map((item) => ({
        id: item.product_id,
        name: item.product_name,
        category: item.category,
        quantity: Number(item.quantity),
        price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
      }));

      const order = {
        id: data.id,
        number: data.order_number,
        name: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone,
        province: data.province,
        address: data.address,
        paymentMethod: data.payment_method,
        total: Number(data.total),
        products: confirmedProducts,
        status: data.status,
        date: new Date(
          data.created_at
        ).toLocaleString("es-CR"),
        isGuest: false,
      };

      clearCart();

      navigate("/confirmacion", {
        replace: true,
        state: {
          order,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar el pedido."
      );

      setIsProcessing(false);
    }
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
        <h1>Selecciona cómo continuar</h1>

        <p>
          Debes iniciar sesión, crear una cuenta o
          continuar como invitado.
        </p>

        <Link to="/continuar-compra">
          Ver opciones para continuar
        </Link>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main style={pageStyle}>
        <h1>No hay productos para procesar</h1>

        <p>
          Debes agregar al menos una planta antes de
          realizar un pedido.
        </p>

        <Link to="/catalogo">
          Ir al catálogo
        </Link>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <Link to="/carrito">
        ← Volver al carrito
      </Link>

      <h1>Finalizar pedido</h1>

      <p>
        Completa tus datos para registrar el pedido.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >
        <div style={fieldStyle}>
          <label htmlFor="name">
            Nombre completo
          </label>

          <input
            id="name"
            name="name"
            type="text"
            defaultValue={savedName}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="email">
            Correo electrónico
          </label>

          <input
            id="email"
            name="email"
            type="email"
            defaultValue={savedEmail}
            readOnly
            required
            style={{
              ...inputStyle,
              backgroundColor: "#f1f1f1",
              cursor: "not-allowed",
            }}
          />

          <small>
            Se utilizará el correo asociado con tu
            cuenta.
          </small>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="phone">
            Teléfono
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={savedPhone}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="province">
            Provincia
          </label>

          <select
            id="province"
            name="province"
            required
            defaultValue=""
            style={inputStyle}
          >
            <option value="" disabled>
              Selecciona una provincia
            </option>

            <option value="San José">
              San José
            </option>

            <option value="Alajuela">
              Alajuela
            </option>

            <option value="Cartago">
              Cartago
            </option>

            <option value="Heredia">
              Heredia
            </option>

            <option value="Guanacaste">
              Guanacaste
            </option>

            <option value="Puntarenas">
              Puntarenas
            </option>

            <option value="Limón">
              Limón
            </option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="address">
            Dirección exacta
          </label>

          <textarea
            id="address"
            name="address"
            rows="4"
            required
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="paymentMethod">
            Método de pago
          </label>

          <select
            id="paymentMethod"
            name="paymentMethod"
            required
            defaultValue=""
            style={inputStyle}
          >
            <option value="" disabled>
              Selecciona un método
            </option>

            <option value="SINPE Móvil simulado">
              SINPE Móvil simulado
            </option>

            <option value="Transferencia simulada">
              Transferencia simulada
            </option>

            <option value="Pago contra entrega">
              Pago contra entrega
            </option>
          </select>
        </div>

        <section style={summaryStyle}>
          <h2>Resumen del pedido</h2>

          {cart.map((item) => (
            <p key={item.id}>
              {item.name} × {item.quantity} — ₡
              {(
                Number(item.price) *
                Number(item.quantity)
              ).toLocaleString("es-CR")}
            </p>
          ))}

          <strong>
            Total estimado: ₡
            {estimatedTotal.toLocaleString(
              "es-CR"
            )}
          </strong>

          <p style={verificationNoticeStyle}>
            El precio final y la disponibilidad se
            verificarán en Supabase al confirmar el
            pedido.
          </p>
        </section>

        {errorMessage && (
          <p style={errorStyle}>
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          style={{
            ...submitButtonStyle,
            cursor: isProcessing
              ? "not-allowed"
              : "pointer",
            opacity: isProcessing ? 0.7 : 1,
          }}
        >
          {isProcessing
            ? "Verificando y guardando..."
            : "Confirmar pedido"}
        </button>
      </form>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px",
  backgroundColor: "#eef3e9",
};

const formStyle = {
  maxWidth: "650px",
  marginTop: "30px",
  padding: "30px",
  backgroundColor: "white",
  borderRadius: "10px",
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

const summaryStyle = {
  marginTop: "30px",
  padding: "20px",
  backgroundColor: "#eef3e9",
  borderRadius: "8px",
};

const verificationNoticeStyle = {
  marginBottom: 0,
  color: "#59655c",
  fontSize: "0.9rem",
};

const errorStyle = {
  marginTop: "20px",
  padding: "12px",
  borderRadius: "6px",
  backgroundColor: "#fde8e8",
  color: "#8a1c1c",
};

const submitButtonStyle = {
  width: "100%",
  marginTop: "25px",
  padding: "14px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#315d40",
  color: "white",
  fontWeight: "bold",
};
