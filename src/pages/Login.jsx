import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const redirectTo = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsLoggingIn(false);

    if (error) {
      setErrorMessage(`No se pudo iniciar sesión: ${error.message}`);
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>Iniciar sesión</h1>

        <p>
          Accede a tu cuenta para consultar pedidos y utilizar tus datos
          guardados.
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

          <div style={fieldStyle}>
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {errorMessage && <p style={errorStyle}>{errorMessage}</p>}

          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              ...buttonStyle,
              opacity: isLoggingIn ? 0.7 : 1,
              cursor: isLoggingIn ? "not-allowed" : "pointer",
            }}
          >
            {isLoggingIn ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p style={forgotPasswordStyle}>
          <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
        </p>

        <p style={centerTextStyle}>
          ¿No tienes una cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>

        <p style={centerTextStyle}>
          <Link to="/checkout-invitado">Continuar como invitado</Link>
        </p>
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
  maxWidth: "620px",
  margin: "0 auto",
  padding: "45px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
};

const formStyle = {
  marginTop: "25px",
};

const fieldStyle = {
  marginBottom: "22px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  padding: "13px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "14px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#315d40",
  color: "white",
  fontWeight: "bold",
};

const forgotPasswordStyle = {
  marginTop: "18px",
  textAlign: "center",
};

const centerTextStyle = {
  textAlign: "center",
};

const errorStyle = {
  padding: "12px",
  borderRadius: "6px",
  backgroundColor: "#fde8e8",
  color: "#8a1c1c",
};