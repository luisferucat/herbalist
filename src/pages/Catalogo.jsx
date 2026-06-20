import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { supabase } from "../lib/supabase.js";

export default function Catalogo() {
  const { cart, addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("Todas");
  const [sortOption, setSortOption] =
    useState("name-asc");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadProducts() {
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
        .eq("is_active", true)
        .order("name", {
          ascending: true,
        });

      if (error) {
        setErrorMessage(
          `No se pudo cargar el catálogo: ${error.message}`
        );
        setIsLoading(false);
        return;
      }

      const normalizedProducts = (data ?? []).map(
        (product) => ({
          ...product,
          price: Number(product.price),
          stock: Number(product.stock),
        })
      );

      setProducts(normalizedProducts);
      setIsLoading(false);
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return uniqueCategories.sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchText
      .trim()
      .toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        normalizedSearch === "" ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.description
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "Todas" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;

        case "price-desc":
          return b.price - a.price;

        case "stock-desc":
          return b.stock - a.stock;

        case "name-desc":
          return b.name.localeCompare(a.name, "es");

        case "name-asc":
        default:
          return a.name.localeCompare(b.name, "es");
      }
    });
  }, [
    products,
    searchText,
    selectedCategory,
    sortOption,
  ]);

  function getQuantityInCart(productId) {
    const cartItem = cart.find(
      (item) =>
        Number(item.id) === Number(productId)
    );

    return cartItem?.quantity ?? 0;
  }

  function handleAddToCart(product) {
    const quantityInCart =
      getQuantityInCart(product.id);

    if (product.stock <= 0) {
      alert(`${product.name} está agotada.`);
      return;
    }

    if (quantityInCart >= product.stock) {
      alert(
        `Ya agregaste todas las unidades disponibles de ${product.name}.`
      );
      return;
    }

    addToCart(product);

    alert(
      `${product.name} fue agregada al carrito.`
    );
  }

  function clearFilters() {
    setSearchText("");
    setSelectedCategory("Todas");
    setSortOption("name-asc");
  }

  return (
    <main style={pageStyle}>
      <div style={topBarStyle}>
        <Link to="/">← Volver al inicio</Link>

        <Link
          to="/carrito"
          style={cartButtonStyle}
        >
          Ir al carrito
        </Link>
      </div>

      <h1>Catálogo de plantas</h1>

      <p>Explora nuestra colección Herbalist.</p>

      <section style={filtersStyle}>
        <div style={filterFieldStyle}>
          <label htmlFor="productSearch">
            Buscar
          </label>

          <input
            id="productSearch"
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Nombre, categoría o descripción"
            style={inputStyle}
          />
        </div>

        <div style={filterFieldStyle}>
          <label htmlFor="categoryFilter">
            Categoría
          </label>

          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(
                event.target.value
              )
            }
            style={inputStyle}
          >
            <option value="Todas">
              Todas las categorías
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        <div style={filterFieldStyle}>
          <label htmlFor="sortProducts">
            Ordenar por
          </label>

          <select
            id="sortProducts"
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value)
            }
            style={inputStyle}
          >
            <option value="name-asc">
              Nombre: A–Z
            </option>

            <option value="name-desc">
              Nombre: Z–A
            </option>

            <option value="price-asc">
              Precio: menor a mayor
            </option>

            <option value="price-desc">
              Precio: mayor a menor
            </option>

            <option value="stock-desc">
              Mayor disponibilidad
            </option>
          </select>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          style={clearButtonStyle}
        >
          Limpiar filtros
        </button>
      </section>

      {isLoading && (
        <p style={messageStyle}>
          Cargando productos...
        </p>
      )}

      {errorMessage && (
        <p style={errorStyle}>
          {errorMessage}
        </p>
      )}

      {!isLoading &&
        !errorMessage &&
        products.length > 0 && (
          <p style={resultsStyle}>
            {filteredProducts.length} producto
            {filteredProducts.length === 1
              ? ""
              : "s"}{" "}
            encontrado
            {filteredProducts.length === 1
              ? ""
              : "s"}
          </p>
        )}

      {!isLoading &&
        !errorMessage &&
        products.length === 0 && (
          <section style={emptyStyle}>
            <h2>No hay productos disponibles</h2>

            <p>
              Actualmente no hay plantas activas
              en el catálogo.
            </p>
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        products.length > 0 &&
        filteredProducts.length === 0 && (
          <section style={emptyStyle}>
            <h2>No encontramos resultados</h2>

            <p>
              Cambia el texto de búsqueda o los
              filtros seleccionados.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              style={clearResultsButtonStyle}
            >
              Mostrar todos los productos
            </button>
          </section>
        )}

      <div style={productGridStyle}>
        {filteredProducts.map((product) => {
          const quantityInCart =
            getQuantityInCart(product.id);

          const isOutOfStock =
            product.stock <= 0;

          const reachedStockLimit =
            quantityInCart >= product.stock;

          const buttonDisabled =
            isOutOfStock ||
            reachedStockLimit;

          return (
            <article
              key={product.id}
              style={productCardStyle}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={productImageStyle}
                />
              ) : (
                <div
                  style={imagePlaceholderStyle}
                >
                  Fotografía de la planta
                </div>
              )}

              <p style={categoryStyle}>
                {product.category}
              </p>

              <h2>{product.name}</h2>

              {product.description && (
                <p style={descriptionStyle}>
                  {product.description}
                </p>
              )}

              <strong style={priceStyle}>
                ₡
                {product.price.toLocaleString(
                  "es-CR"
                )}
              </strong>

              <p
                style={{
                  ...stockStyle,
                  color: isOutOfStock
                    ? "#8a1c1c"
                    : "#315d40",
                }}
              >
                {isOutOfStock
                  ? "Agotado"
                  : `Disponibles: ${product.stock}`}
              </p>

              {quantityInCart > 0 && (
                <p style={cartQuantityStyle}>
                  En tu carrito:{" "}
                  {quantityInCart}
                </p>
              )}

              <Link
                to={`/producto/${product.id}`}
                style={detailsButtonStyle}
              >
                Ver detalles
              </Link>

              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() =>
                  handleAddToCart(product)
                }
                style={{
                  ...addButtonStyle,
                  backgroundColor:
                    buttonDisabled
                      ? "#9da79f"
                      : "#315d40",
                  cursor: buttonDisabled
                    ? "not-allowed"
                    : "pointer",
                  opacity: buttonDisabled
                    ? 0.75
                    : 1,
                }}
              >
                {isOutOfStock
                  ? "Agotado"
                  : reachedStockLimit
                    ? "Máximo disponible agregado"
                    : "Agregar al carrito"}
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px",
  backgroundColor: "#eef3e9",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  gap: "15px",
  flexWrap: "wrap",
};

const cartButtonStyle = {
  padding: "10px 16px",
  backgroundColor: "#315d40",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
};

const filtersStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "16px",
  marginTop: "30px",
  padding: "22px",
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow:
    "0 4px 12px rgba(0, 0, 0, 0.06)",
};

const filterFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  boxSizing: "border-box",
};

const clearButtonStyle = {
  alignSelf: "end",
  padding: "12px",
  border: "1px solid #315d40",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#315d40",
  fontWeight: "bold",
  cursor: "pointer",
};

const resultsStyle = {
  marginTop: "22px",
  color: "#59655c",
  fontWeight: "600",
};

const productGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const productCardStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow:
    "0 4px 12px rgba(0, 0, 0, 0.08)",
};

const imagePlaceholderStyle = {
  minHeight: "180px",
  display: "grid",
  placeItems: "center",
  marginBottom: "20px",
  backgroundColor: "#dfe8da",
  borderRadius: "8px",
  color: "#657368",
};

const productImageStyle = {
  width: "100%",
  height: "180px",
  marginBottom: "20px",
  borderRadius: "8px",
  objectFit: "cover",
};

const categoryStyle = {
  margin: 0,
  color: "#657368",
  fontWeight: "600",
};

const descriptionStyle = {
  flexGrow: 1,
  lineHeight: 1.5,
  color: "#4f5c52",
};

const priceStyle = {
  display: "block",
  marginTop: "10px",
  fontSize: "1.15rem",
};

const stockStyle = {
  margin: "12px 0 0",
  fontWeight: "bold",
};

const cartQuantityStyle = {
  margin: "6px 0 0",
  color: "#657368",
};

const detailsButtonStyle = {
  display: "block",
  marginTop: "15px",
  padding: "11px",
  border: "1px solid #315d40",
  borderRadius: "6px",
  color: "#315d40",
  textAlign: "center",
  textDecoration: "none",
  fontWeight: "bold",
};

const addButtonStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "12px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  fontWeight: "bold",
};

const messageStyle = {
  marginTop: "25px",
};

const errorStyle = {
  marginTop: "25px",
  padding: "14px",
  borderRadius: "6px",
  backgroundColor: "#fde8e8",
  color: "#8a1c1c",
};

const emptyStyle = {
  marginTop: "30px",
  padding: "35px",
  backgroundColor: "white",
  borderRadius: "10px",
  textAlign: "center",
};

const clearResultsButtonStyle = {
  padding: "11px 16px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#315d40",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};