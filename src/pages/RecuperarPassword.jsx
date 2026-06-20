import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSending) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage("Debes ingresar tu correo electrónico.");
      return;
    }

    setIsSending(true);
    setMessage("");
    setErrorMessage("");

    const redirectTo = "https://herbalist-theta.vercel.app/actualizar-password";

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    setIsSending(false);

    if (error) {
      setErrorMessage(`No se pudo enviar el correo: ${error.message}`);
      return;
    }

    setMessage(
      "Si el correo está registrado, recibirás un enlace para cambiar tu contraseña."
    );

    setEmail("");
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <Link to="/login">← Volver al inicio de sesión</Link>

        <h1>Recuperar contraseña</h1>

        <p>
          Ingresa el correo asociado a tu cuenta. Te enviaremos un enlace para
          crear una nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label htmlFor="email">Correo electrónico</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
          {message && <p style={successStyle}>{message}</p>}

          <button
            type="submit"
            disabled={isSending}
            style={{
              ...buttonStyle,
              opacity: isSending ? 0.7 : 1,
              cursor: isSending ? "not-allowed" : "pointer",
            }}
          >
            {isSending ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
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
  maxWidth: "520px",
  margin: "0 auto",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "10px",
};

const formStyle = {
  marginTop: "25px",
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

const successStyle = {
  padding: "12px",
  borderRadius: "6px",
  backgroundColor: "#e5f3e8",
  color: "#244d31",
};