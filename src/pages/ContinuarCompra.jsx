import { Link } from "react-router-dom";

export default function ContinuarCompra() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px",
        backgroundColor: "#eef3e9",
      }}
    >
      <Link to="/carrito">← Volver al carrito</Link>

      <section
        style={{
          maxWidth: "900px",
          margin: "40px auto 0",
          padding: "35px",
          backgroundColor: "white",
          borderRadius: "12px",
        }}
      >
        <h1>¿Cómo deseas continuar?</h1>

        <p>
          Puedes iniciar sesión, crear una cuenta o completar el pedido como
          invitado.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <article
            style={{
              padding: "25px",
              border: "1px solid #d8ded5",
              borderRadius: "10px",
            }}
          >
            <h2>Iniciar sesión</h2>

            <p>
              Accede a tu cuenta para usar tus datos guardados y consultar tus
              pedidos.
            </p>

                            <Link
                to="/login"
                state={{ from: "/checkout" }}
                style={{
                    display: "inline-block",
                    marginTop: "15px",
                    padding: "12px 18px",
                    backgroundColor: "#315d40",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                }}
                >
                Iniciar sesión
                </Link>
          </article>

          <article
            style={{
              padding: "25px",
              border: "1px solid #d8ded5",
              borderRadius: "10px",
            }}
          >
            <h2>Crear una cuenta</h2>

            <p>
              Regístrate para guardar tus datos y consultar tu historial de
              pedidos.
            </p>

            <Link
              to="/registro"
              style={{
                display: "inline-block",
                marginTop: "15px",
                padding: "12px 18px",
                backgroundColor: "#315d40",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Crear cuenta
            </Link>
          </article>

          <article
            style={{
              padding: "25px",
              border: "1px solid #d8ded5",
              borderRadius: "10px",
            }}
          >
            <h2>Comprar como invitado</h2>

            <p>
              Completa tu pedido sin crear una cuenta. Podrás consultarlo con
              tu número de pedido.
            </p>

            <Link
              to="/checkout-invitado"
              style={{
                display: "inline-block",
                marginTop: "15px",
                padding: "12px 18px",
                backgroundColor: "#315d40",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Continuar como invitado
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}