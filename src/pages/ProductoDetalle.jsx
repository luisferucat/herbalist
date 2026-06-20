
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductoDetalle() {
  const { id } = useParams();
  const { cart, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category,
          description,
          care_instructions,
          price,
          stock,
          image_url,
          is_active
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) {
        setErrorMessage(
          "No se encontró el producto solicitado."
        );
        setIsLoading(false);
        return;
      }

      setProduct({
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
      });

      setIsLoading(false);
    }

    loadProduct();
  }, [id]);

  const quantityInCart =
    cart.find(
      (item) => Number(item.id) === Number(product?.id)
    )?.quantity ?? 0;

  const isOutOfStock =
    product ? product.stock <= 0 : true;

  const reachedStockLimit =
    product
      ? quantityInCart >= product.stock
      : true;

  function handleAddToCart() {
    if (!product) {
      return;
    }

    if (isOutOfStock) {
      alert(`${product.name} está agotada.`);
      return;
    }

    if (reachedStockLimit) {
      alert(
        `Ya agregaste todas las unidades disponibles de ${product.name}.`
      );
      return;
    }

    addToCart(product);

    alert(`${product.name} fue agregada al carrito.`);
  }

  if (isLoading) {
    return (
      <main style={pageStyle}>
        <p>Cargando producto...</p>
      </main>
    );
  }

  if (errorMessage || !product) {
    return (
      <main style={pageStyle}>
        <section style={cardStyle}>
          <h1>Producto no disponible</h1>

          <p>
            {errorMessage ||
              "El producto no existe o ya no está activo."}
          </p>

          <Link to="/catalogo">
            Volver al catálogo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={topBarStyle}>
        <Link to="/catalogo">
          ← Volver al catálogo
        </Link>

        <Link
          to="/carrito"
          style={cartButtonStyle}
        >
          Ir al carrito ({quantityInCart})
        </Link>
      </div>

      <section style={productLayoutStyle}>
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              style={imageStyle}
            />
          ) : (
            <div style={imagePlaceholderStyle}>
              Fotografía de la planta
            </div>
          )}
        </div>

        <div style={informationStyle}>
          <p style={categoryStyle}>
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p style={descriptionStyle}>
            {product.description ||
              "Este producto todavía no tiene descripción."}
          </p>

          <p style={priceStyle}>
            ₡
            {product.price.toLocaleString("es-CR")}
          </p>

          <p
            style={{
              fontWeight: "bold",
              color: isOutOfStock
                ? "#8a1c1c"
                : "#315d40",
            }}
          >
            {isOutOfStock
              ? "Producto agotado"
              : `Disponibles: ${product.stock}`}
          </p>

          {quantityInCart > 0 && (
            <p>
              En tu carrito: {quantityInCart}
            </p>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              isOutOfStock || reachedStockLimit
            }
            style={{
              ...buttonStyle,
              backgroundColor:
                isOutOfStock || reachedStockLimit
                  ? "#9da79f"
                  : "#315d40",
              cursor:
                isOutOfStock || reachedStockLimit
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isOutOfStock
              ? "Agotado"
              : reachedStockLimit
                ? "Máximo disponible agregado"
                : "Agregar al carrito"}
          </button>

          <section style={careStyle}>
            <h2>Cuidados</h2>

            <p>
              {product.care_instructions ||
                "Todavía no hay instrucciones de cuidado disponibles."}
            </p>
          </section>
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

const topBarStyle = {
  maxWidth: "1000px",
  margin: "0 auto 30px",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "center",
  flexWrap: "wrap",
};

const productLayoutStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "35px",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
};

const imageStyle = {
  width: "100%",
  height: "420px",
  objectFit: "cover",
  borderRadius: "10px",
};

const imagePlaceholderStyle = {
  minHeight: "420px",
  display: "grid",
  placeItems: "center",
  backgroundColor: "#dfe8da",
  borderRadius: "10px",
  color: "#657368",
};

const informationStyle = {
  display: "flex",
  flexDirection: "column",
};

const categoryStyle = {
  color: "#657368",
  fontWeight: "bold",
};

const descriptionStyle = {
  lineHeight: 1.6,
  color: "#4f5c52",
};

const priceStyle = {
  fontSize: "1.6rem",
  fontWeight: "bold",
};

const buttonStyle = {
  width: "100%",
  marginTop: "15px",
  padding: "14px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  fontWeight: "bold",
};

const careStyle = {
  marginTop: "30px",
  padding: "20px",
  backgroundColor: "#eef3e9",
  borderRadius: "8px",
};

const cartButtonStyle = {
  padding: "10px 16px",
  backgroundColor: "#315d40",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};

const cardStyle = {
  maxWidth: "650px",
  margin: "0 auto",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "12px",
};
