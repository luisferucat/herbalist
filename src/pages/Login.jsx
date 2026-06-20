import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function Login() {
  const navigate = useNavigate();
    const location = useLocation();

    const destination =
    location.state?.from || "/";
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email").trim();
    const password = formData.get("password");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setIsError(true);

      if (error.message.toLowerCase().includes("invalid login credentials")) {
        setMessage("El correo o la contraseña son incorrectos.");
      } else if (
        error.message.toLowerCase().includes("email not confirmed")
      ) {
        setMessage(
          "Debes confirmar tu correo electrónico antes de iniciar sesión."
        );
      } else {
        setMessage(error.message);
      }

      return;
    }

    if (data.session) {
      setMessage("Inicio de sesión exitoso.");

      setTimeout(() => {
        navigate(destination, {
            replace: true,
            });
      }, 800);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px",
        backgroundColor: "#eef3e9",
      }}
    >
      <Link to="/continuar-compra">← Volver</Link>

      <section
        style={{
          maxWidth: "520px",
          margin: "40px auto 0",
          padding: "35px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1>Iniciar sesión</h1>

        <p>
          Accede a tu cuenta para consultar pedidos y utilizar tus datos
          guardados.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="email">Correo electrónico</label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={inputStyle}
            />
          </div>

          {message && (
            <p
              role="status"
              style={{
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: isError ? "#fde8e8" : "#e5f3e8",
                color: isError ? "#8a1c1c" : "#244d31",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#315d40",
              color: "white",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p style={{ marginTop: "25px", textAlign: "center" }}>
          ¿No tienes una cuenta?{" "}
          <Link to="/registro">Crear cuenta</Link>
        </p>

        <p style={{ textAlign: "center" }}>
          <Link to="/checkout">Continuar como invitado</Link>
        </p>
      </section>
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  padding: "12px",
};