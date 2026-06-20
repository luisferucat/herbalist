import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Carrito() {
  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { user, isLoadingAuth } = useAuth();

const checkoutDestination = user
  ? "/checkout"
  : "/continuar-compra";

  const total = cart.reduce(
    (acumulado, item) => acumulado + item.price * item.quantity,
    0
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px",
        backgroundColor: "#eef3e9",
      }}
    >
      <Link to="/catalogo">← Volver al catálogo</Link>

      <h1>Carrito de compras</h1>

      {cart.length === 0 ? (
        <p>Todavía no has agregado productos.</p>
      ) : (
        <>
          <div>
            {cart.map((item) => {
              const subtotal = item.price * item.quantity;

              return (
                <article
                  key={item.id}
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    backgroundColor: "white",
                    borderRadius: "10px",
                  }}
                >
                  <h2>{item.name}</h2>
                  <p>{item.category}</p>

                  <p>
                    Precio unitario: ₡
                    {item.price.toLocaleString("es-CR")}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      −
                    </button>

                    <strong>Cantidad: {item.quantity}</strong>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    Subtotal: ₡{subtotal.toLocaleString("es-CR")}
                  </strong>

                  <br />

                  <button
                    type="button"
                    style={{ marginTop: "15px" }}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Eliminar
                  </button>
                </article>
              );
            })}
          </div>

          <section
            style={{
              marginTop: "30px",
              padding: "25px",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
            }}
          >
            <h2>Total: ₡{total.toLocaleString("es-CR")}</h2>

            <button
              type="button"
              style={{ marginRight: "10px" }}
              onClick={clearCart}
            >
              Vaciar carrito
            </button>

            <button type="button">
             <Link
                to={checkoutDestination}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  backgroundColor: "#315d40",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  pointerEvents: isLoadingAuth ? "none" : "auto",
                  opacity: isLoadingAuth ? 0.6 : 1,
                }}
              >
                {isLoadingAuth
                  ? "Revisando sesión..."
                  : "Continuar con el pedido"}
              </Link>
            </button>
          </section>
        </>
      )}
    </main>
  );
}