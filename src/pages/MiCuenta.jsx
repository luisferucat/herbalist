import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MiCuenta() {
  const navigate = useNavigate();
  const { user, signOut, isLoadingAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profileError, setProfileError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [isLoadingProfile, setIsLoadingProfile] =
    useState(true);
  const [isSavingProfile, setIsSavingProfile] =
    useState(false);
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (error) {
        setProfileError(true);
        setProfileMessage(
          `No se pudo cargar el perfil: ${error.message}`
        );
        setIsLoadingProfile(false);
        return;
      }

      setFullName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
      setIsLoadingProfile(false);
    }

    loadProfile();
  }, [user]);

  async function handleProfileSubmit(event) {
    event.preventDefault();

    if (!user) return;

    setProfileMessage("");
    setProfileError(false);
    setIsSavingProfile(true);

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: cleanName,
        phone: cleanPhone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setIsSavingProfile(false);
      setProfileError(true);
      setProfileMessage(
        `No se pudo actualizar el perfil: ${error.message}`
      );
      return;
    }

    const { error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          name: cleanName,
          phone: cleanPhone,
        },
      });

    setIsSavingProfile(false);

    if (metadataError) {
      setProfileError(true);
      setProfileMessage(
        `El perfil se guardó, pero no se actualizaron los metadatos: ${metadataError.message}`
      );
      return;
    }

    setProfileMessage("Perfil actualizado correctamente.");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError(false);

    if (newPassword.length < 8) {
      setPasswordError(true);
      setPasswordMessage(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    setIsChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsChangingPassword(false);

    if (error) {
      setPasswordError(true);
      setPasswordMessage(
        `No se pudo actualizar la contraseña: ${error.message}`
      );
      return;
    }

    setNewPassword("");
    setPasswordMessage(
      "Contraseña actualizada correctamente."
    );
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      alert(
        `No se pudo cerrar la sesión: ${error.message}`
      );
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
        <h1>Debes iniciar sesión</h1>

        <p>
          Esta sección solo está disponible para usuarios
          autenticados.
        </p>

        <Link to="/login">Ir a iniciar sesión</Link>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <Link to="/">← Volver al inicio</Link>

      <section style={sectionStyle}>
        <h1>Mi cuenta</h1>

        <p>
          Administra tus datos personales y la seguridad de
          tu cuenta.
        </p>

        {isLoadingProfile ? (
          <p>Cargando perfil...</p>
        ) : (
          <form onSubmit={handleProfileSubmit}>
            <div style={fieldStyle}>
              <label htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={user.email ?? ""}
                disabled
                style={{
                  ...inputStyle,
                  backgroundColor: "#f1f1f1",
                  cursor: "not-allowed",
                }}
              />

              <small>
                El correo no puede modificarse desde
                Herbalist.
              </small>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="fullName">
                Nombre completo
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="phone">Teléfono</label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                required
                style={inputStyle}
              />
            </div>

            {profileMessage && (
              <p
                style={{
                  ...messageStyle,
                  backgroundColor: profileError
                    ? "#fde8e8"
                    : "#e5f3e8",
                  color: profileError
                    ? "#8a1c1c"
                    : "#244d31",
                }}
              >
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              style={{
                ...primaryButtonStyle,
                opacity: isSavingProfile ? 0.7 : 1,
                cursor: isSavingProfile
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {isSavingProfile
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </form>
        )}
      </section>

      <section style={sectionStyle}>
        <h2>Cambiar contraseña</h2>

        <form onSubmit={handlePasswordSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="newPassword">
              Nueva contraseña
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              minLength={8}
              autoComplete="new-password"
              required
              style={inputStyle}
            />

            <small>
              Debe contener al menos 8 caracteres.
            </small>
          </div>

          {passwordMessage && (
            <p
              style={{
                ...messageStyle,
                backgroundColor: passwordError
                  ? "#fde8e8"
                  : "#e5f3e8",
                color: passwordError
                  ? "#8a1c1c"
                  : "#244d31",
              }}
            >
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isChangingPassword}
            style={{
              ...primaryButtonStyle,
              opacity: isChangingPassword ? 0.7 : 1,
              cursor: isChangingPassword
                ? "not-allowed"
                : "pointer",
            }}
          >
            {isChangingPassword
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </button>
        </form>
      </section>

      <section style={sectionStyle}>
        <h2>Sesión</h2>

        <button
          type="button"
          onClick={handleSignOut}
          style={{
            ...primaryButtonStyle,
            backgroundColor: "#7a2f2f",
          }}
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px",
  backgroundColor: "#eef3e9",
};

const sectionStyle = {
  maxWidth: "700px",
  margin: "30px auto",
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
};

const messageStyle = {
  padding: "12px",
  borderRadius: "6px",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#315d40",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};