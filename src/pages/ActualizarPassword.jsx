import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function ActualizarPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function prepareRecoverySession() {
      setIsCheckingSession(true);
      setErrorMessage("");

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setErrorMessage(
            `No se pudo validar el enlace de recuperación: ${error.message}`
          );
          setIsCheckingSession(false);
          return;
        }

        window.history.replaceState({}, document.title, "/actualizar-password");
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setErrorMessage(
          "El enlace de recuperación no es válido, ya expiró o ya fue utilizado. Solicita un nuevo enlace."
        );
      }

      setIsCheckingSession(false);
    }

    prepareRecoverySession();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isUpdating) return;

    setMessage("");
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsUpdating(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsUpdating(false);

    if (error) {
      setErrorMessage(`No se pudo actualizar la contraseña: ${error.message}`);
      return;
    }

    setMessage("Contraseña actualizada correctamente. Redirigiendo al login...");

    await supabase.auth.signOut();

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1200);
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>Crear nueva contraseña</h1>

        <p>Ingresa tu nueva contraseña para recuperar el acceso a Herbalist.</p>

        {isCheckingSession ? (
          <p>Validando enlace de recuperación...</p>
        ) : (
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={fieldStyle}>
              <label htmlFor="password">Nueva contraseña</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength="6"
                style={inputStyle}
                disabled={Boolean(errorMessage)}
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="confirmPassword">Confirmar contraseña</label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength="6"
                style={inputStyle}
                disabled={Boolean(errorMessage)}
              />
            </div>

            {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
            {message && <p style={successStyle}>{message}</p>}

            <button
              type="submit"
              disabled={isUpdating || Boolean(errorMessage)}
              style={{
                ...buttonStyle,
                opacity: isUpdating || Boolean(errorMessage) ? 0.7 : 1,
                cursor:
                  isUpdating || Boolean(errorMessage)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isUpdating ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}

        <div style={{ marginTop: "20px" }}>
          <Link to="/recuperar-password">Solicitar nuevo enlace</Link>
          {" · "}
          <Link to="/login">Volver al login</Link>
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