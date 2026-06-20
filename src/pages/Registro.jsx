import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function Registro() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const phone = formData.get("phone").trim();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
            name,
            phone,
            },
     },
    });

    setIsLoading(false);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    if (data.session) {
      setMessage("La cuenta se creó correctamente.");

      setTimeout(() => {
        navigate("/checkout");
      }, 1200);

      return;
    }

    setMessage(
      "La cuenta fue creada. Revisa tu correo para confirmar el registro antes de iniciar sesión."
    );

    event.currentTarget.reset();
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
          maxWidth: "600px",
          margin: "40px auto 0",
          padding: "35px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1>Crear una cuenta</h1>

        <p>
          Regístrate para guardar tus datos y consultar tus pedidos de
          Herbalist.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="name">Nombre completo</label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              style={inputStyle}
            />
          </div>

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
            <label htmlFor="phone">Teléfono</label>

            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
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
              autoComplete="new-password"
              minLength={8}
              required
              style={inputStyle}
            />

            <small>Debe contener al menos 8 caracteres.</small>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="confirmPassword">
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
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
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p style={{ marginTop: "25px", textAlign: "center" }}>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">Iniciar sesión</Link>
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