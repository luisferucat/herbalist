import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  care_instructions: "",
  price: "",
  stock: "",
  image_url: "",
  is_active: true,
};

const orderStatuses = [
  "Pendiente",
  "Confirmado",
  "En preparación",
  "Enviado",
  "Entregado",
  "Cancelado",
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productMessage, setProductMessage] = useState("");
  const [productError, setProductError] = useState("");

  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("Todos");
  const [orderSearch, setOrderSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("Todos");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadProducts();
      loadOrders();
      loadUsers();
    }

    if (activeTab === "products") {
      loadProducts();
    }

    if (activeTab === "orders") {
      loadOrders();
    }

    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  async function loadProducts() {
    setIsLoadingProducts(true);
    setProductError("");

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, category, description, care_instructions, price, stock, image_url, is_active, created_at"
      )
      .order("created_at", { ascending: false });

    setIsLoadingProducts(false);

    if (error) {
      setProductError(`No se pudieron cargar los productos: ${error.message}`);
      return;
    }

    setProducts(
      (data ?? []).map((product) => ({
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      }))
    );
  }

  async function loadOrders() {
    setIsLoadingOrders(true);
    setOrderError("");
    setOrderMessage("");

    const { data, error } = await supabase.rpc("admin_get_orders");

    setIsLoadingOrders(false);

    if (error) {
      console.error("Error cargando pedidos:", error);
      setOrderError(`No se pudieron cargar los pedidos: ${error.message}`);
      return;
    }

    setOrders(
      (data ?? []).map((order) => ({
        ...order,
        total: Number(order.total),
        order_items: order.order_items ?? [],
      }))
    );
  }

  async function loadUsers() {
    setIsLoadingUsers(true);
    setUserError("");

    const { data, error } = await supabase.rpc("admin_get_users");

    setIsLoadingUsers(false);

    if (error) {
      console.error("Error cargando usuarios:", error);
      setUserError(`No se pudieron cargar los usuarios: ${error.message}`);
      return;
    }

    setUsers(
      (data ?? []).map((user) => ({
        ...user,
        total_orders: Number(user.total_orders || 0),
        total_spent: Number(user.total_spent || 0),
      }))
    );
  }

  function handleProductChange(event) {
    const { name, value, type, checked } = event.target;

    setProductForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEditProduct(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      care_instructions: product.care_instructions,
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url ?? "",
      is_active: product.is_active,
    });
    setProductMessage("");
    setProductError("");
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm(emptyProduct);
    setProductMessage("");
    setProductError("");
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    setProductMessage("");
    setProductError("");

    const cleanProduct = {
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      description: productForm.description.trim(),
      care_instructions: productForm.care_instructions.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      image_url: productForm.image_url.trim() || null,
      is_active: productForm.is_active,
      updated_at: new Date().toISOString(),
    };

    if (!cleanProduct.name || !cleanProduct.category) {
      setProductError("El nombre y la categoría son obligatorios.");
      return;
    }

    if (Number.isNaN(cleanProduct.price) || cleanProduct.price < 0) {
      setProductError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (
      Number.isNaN(cleanProduct.stock) ||
      cleanProduct.stock < 0 ||
      !Number.isInteger(cleanProduct.stock)
    ) {
      setProductError("El inventario debe ser un número entero mayor o igual a 0.");
      return;
    }

    if (editingProductId) {
      const { error } = await supabase
        .from("products")
        .update(cleanProduct)
        .eq("id", editingProductId);

      if (error) {
        setProductError(`No se pudo actualizar el producto: ${error.message}`);
        return;
      }

      setProductMessage("Producto actualizado correctamente.");
    } else {
      const { error } = await supabase.from("products").insert(cleanProduct);

      if (error) {
        setProductError(`No se pudo crear el producto: ${error.message}`);
        return;
      }

      setProductMessage("Producto creado correctamente.");
    }

    resetProductForm();
    await loadProducts();
  }

  async function toggleProductStatus(product) {
    setProductError("");

    const { error } = await supabase.rpc("admin_toggle_product_status", {
      product_id_input: product.id,
    });

    if (error) {
      setProductError(`No se pudo cambiar el estado: ${error.message}`);
      return;
    }

    await loadProducts();
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    setOrderError("");
    setOrderMessage("");

    const { error } = await supabase.rpc("admin_update_order_status", {
      order_id_input: orderId,
      new_status_input: newStatus,
    });

    if (error) {
      setOrderError(`No se pudo actualizar el estado del pedido: ${error.message}`);
      return;
    }

    setOrderMessage("Estado del pedido actualizado correctamente.");
    await loadOrders();
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("es-CR", {
      style: "currency",
      currency: "CRC",
      maximumFractionDigits: 0,
    });
  }

  function formatDate(value) {
    if (!value) return "Sin fecha";

    return new Date(value).toLocaleString("es-CR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const filteredOrders = orders.filter((order) => {
    const searchText = orderSearch.trim().toLowerCase();

    const matchesStatus =
      orderStatusFilter === "Todos" || order.status === orderStatusFilter;

    const matchesSearch =
      !searchText ||
      order.order_number?.toLowerCase().includes(searchText) ||
      order.customer_name?.toLowerCase().includes(searchText) ||
      order.customer_email?.toLowerCase().includes(searchText) ||
      order.customer_phone?.toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  const filteredUsers = users.filter((user) => {
    const searchText = userSearch.trim().toLowerCase();

    const matchesRole =
      userRoleFilter === "Todos" || user.role === userRoleFilter;

    const matchesSearch =
      !searchText ||
      user.email?.toLowerCase().includes(searchText) ||
      user.full_name?.toLowerCase().includes(searchText) ||
      user.phone?.toLowerCase().includes(searchText) ||
      user.role?.toLowerCase().includes(searchText);

    return matchesRole && matchesSearch;
  });

  const dashboardStats = {
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.is_active).length,
    inactiveProducts: products.filter((product) => !product.is_active).length,
    outOfStockProducts: products.filter((product) => product.stock === 0).length,

    totalOrders: orders.length,
    guestOrders: orders.filter((order) => order.is_guest).length,
    registeredOrders: orders.filter((order) => !order.is_guest).length,

    pendingOrders: orders.filter((order) => order.status === "Pendiente").length,
    confirmedOrders: orders.filter((order) => order.status === "Confirmado").length,
    preparingOrders: orders.filter((order) => order.status === "En preparación").length,
    shippedOrders: orders.filter((order) => order.status === "Enviado").length,
    deliveredOrders: orders.filter((order) => order.status === "Entregado").length,
    cancelledOrders: orders.filter((order) => order.status === "Cancelado").length,

    totalSales: orders
      .filter((order) => order.status !== "Cancelado")
      .reduce((sum, order) => sum + Number(order.total || 0), 0),

    latestOrders: orders.slice(0, 5),

    totalUsers: users.length,
    adminUsers: users.filter((user) => user.role === "admin").length,
    customerUsers: users.filter((user) => user.role === "customer").length,
  };

  return (
    <main style={pageStyle}>
      <Link to="/">← Volver al inicio</Link>

      <h1>Panel Administrativo</h1>
      <p>Administración general de Herbalist.</p>

      <div style={tabsStyle}>
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          style={tabStyle(activeTab === "dashboard")}
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          style={tabStyle(activeTab === "products")}
        >
          Productos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          style={tabStyle(activeTab === "orders")}
        >
          Pedidos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          style={tabStyle(activeTab === "users")}
        >
          Usuarios
        </button>
      </div>

      {activeTab === "dashboard" && (
        <section style={cardStyle}>
          <h2>Dashboard</h2>
          <p>Métricas generales del sistema Herbalist.</p>

          {(isLoadingProducts || isLoadingOrders || isLoadingUsers) && (
            <p>Cargando métricas...</p>
          )}

          {productError && <p style={errorStyle}>{productError}</p>}
          {orderError && <p style={errorStyle}>{orderError}</p>}
          {userError && <p style={errorStyle}>{userError}</p>}

          <h3>Inventario</h3>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <strong>{dashboardStats.totalProducts}</strong>
              <span>Total productos</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.activeProducts}</strong>
              <span>Productos activos</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.inactiveProducts}</strong>
              <span>Productos inactivos</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.outOfStockProducts}</strong>
              <span>Productos agotados</span>
            </div>
          </div>

          <h3 style={{ marginTop: "28px" }}>Pedidos</h3>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <strong>{dashboardStats.totalOrders}</strong>
              <span>Total pedidos</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.guestOrders}</strong>
              <span>Pedidos invitados</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.registeredOrders}</strong>
              <span>Pedidos registrados</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.pendingOrders}</strong>
              <span>Pendientes</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.confirmedOrders}</strong>
              <span>Confirmados</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.preparingOrders}</strong>
              <span>En preparación</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.shippedOrders}</strong>
              <span>Enviados</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.deliveredOrders}</strong>
              <span>Entregados</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.cancelledOrders}</strong>
              <span>Cancelados</span>
            </div>
          </div>

          <h3 style={{ marginTop: "28px" }}>Usuarios</h3>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <strong>{dashboardStats.totalUsers}</strong>
              <span>Total usuarios</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.customerUsers}</strong>
              <span>Clientes</span>
            </div>

            <div style={statCardStyle}>
              <strong>{dashboardStats.adminUsers}</strong>
              <span>Administradores</span>
            </div>
          </div>

          <h3 style={{ marginTop: "28px" }}>Ventas simuladas</h3>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <strong>{formatCurrency(dashboardStats.totalSales)}</strong>
              <span>Total acumulado sin cancelados</span>
            </div>
          </div>

          <h3 style={{ marginTop: "28px" }}>Últimos pedidos</h3>

          {dashboardStats.latestOrders.length === 0 ? (
            <p>No hay pedidos registrados todavía.</p>
          ) : (
            <div style={listStyle}>
              {dashboardStats.latestOrders.map((order) => (
                <article key={order.id} style={miniOrderRowStyle}>
                  <div>
                    <strong>Pedido #{order.order_number}</strong>
                    <p style={{ margin: "4px 0" }}>
                      {order.customer_name || "Sin nombre"} ·{" "}
                      {order.is_guest ? "Invitado" : "Usuario registrado"}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div style={miniOrderRightStyle}>
                    <strong>{formatCurrency(order.total)}</strong>
                    <span style={statusBadgeStyle(order.status)}>
                      {order.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "products" && (
        <section style={cardStyle}>
          <h2>Productos</h2>

          <form onSubmit={handleProductSubmit} style={formStyle}>
            <h3>{editingProductId ? "Editar producto" : "Crear producto"}</h3>

            <div style={gridStyle}>
              <div>
                <label>Nombre</label>
                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Categoría</label>
                <input
                  name="category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Precio</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={handleProductChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Inventario</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.stock}
                  onChange={handleProductChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label>URL de imagen</label>
              <input
                name="image_url"
                value={productForm.image_url}
                onChange={handleProductChange}
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label>Descripción</label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleProductChange}
                rows="3"
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label>Cuidados</label>
              <textarea
                name="care_instructions"
                value={productForm.care_instructions}
                onChange={handleProductChange}
                rows="3"
                style={inputStyle}
              />
            </div>

            <label style={{ display: "block", marginBottom: "20px" }}>
              <input
                name="is_active"
                type="checkbox"
                checked={productForm.is_active}
                onChange={handleProductChange}
              />{" "}
              Producto activo
            </label>

            {productError && <p style={errorStyle}>{productError}</p>}
            {productMessage && <p style={successStyle}>{productMessage}</p>}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button type="submit" style={primaryButtonStyle}>
                {editingProductId ? "Guardar cambios" : "Crear producto"}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  style={secondaryButtonStyle}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <h3>Catálogo actual</h3>

          {isLoadingProducts ? (
            <p>Cargando productos...</p>
          ) : (
            <div style={listStyle}>
              {products.map((product) => (
                <article key={product.id} style={productRowStyle}>
                  <div>
                    <h4 style={{ margin: "0 0 6px" }}>{product.name}</h4>
                    <p style={{ margin: 0 }}>{product.category}</p>
                    <p style={{ margin: "6px 0" }}>
                      {formatCurrency(product.price)} · Stock: {product.stock}
                    </p>
                    <strong
                      style={{
                        color: product.is_active ? "#315d40" : "#8a1c1c",
                      }}
                    >
                      {product.is_active ? "Activo" : "Inactivo"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => startEditProduct(product)}
                      style={secondaryButtonStyle}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleProductStatus(product)}
                      style={secondaryButtonStyle}
                    >
                      {product.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "orders" && (
        <section style={cardStyle}>
          <h2>Pedidos</h2>
          <p>Administración de pedidos registrados e invitados.</p>

          <div style={orderFiltersStyle}>
            <div>
              <label>Buscar pedido, cliente, correo o teléfono</label>
              <input
                type="text"
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Ej: HERB-001, María, correo..."
                style={inputStyle}
              />
            </div>

            <div>
              <label>Filtrar por estado</label>
              <select
                value={orderStatusFilter}
                onChange={(event) => setOrderStatusFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="Todos">Todos</option>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {orderError && <p style={errorStyle}>{orderError}</p>}
          {orderMessage && <p style={successStyle}>{orderMessage}</p>}

          {isLoadingOrders ? (
            <p>Cargando pedidos...</p>
          ) : filteredOrders.length === 0 ? (
            <p>No hay pedidos que coincidan con la búsqueda.</p>
          ) : (
            <div style={listStyle}>
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <article key={order.id} style={orderRowStyle}>
                    <div style={orderHeaderStyle}>
                      <div>
                        <h3 style={{ margin: "0 0 6px" }}>
                          Pedido #{order.order_number}
                        </h3>

                        <p style={{ margin: "4px 0" }}>
                          <strong>Cliente:</strong>{" "}
                          {order.customer_name || "Sin nombre"}
                        </p>

                        <p style={{ margin: "4px 0" }}>
                          <strong>Correo:</strong>{" "}
                          {order.customer_email || "Sin correo"}
                        </p>

                        <p style={{ margin: "4px 0" }}>
                          <strong>Teléfono:</strong>{" "}
                          {order.customer_phone || "No indicado"}
                        </p>

                        <p style={{ margin: "4px 0" }}>
                          <strong>Tipo:</strong>{" "}
                          {order.is_guest ? "Invitado" : "Usuario registrado"}
                        </p>

                        <p style={{ margin: "4px 0" }}>
                          <strong>Fecha:</strong> {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div style={orderSummaryStyle}>
                        <strong>{formatCurrency(order.total)}</strong>

                        <span style={statusBadgeStyle(order.status)}>
                          {order.status}
                        </span>

                        <select
                          value={order.status}
                          onChange={(event) =>
                            handleUpdateOrderStatus(order.id, event.target.value)
                          }
                          style={inputStyle}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderId(isExpanded ? null : order.id)
                          }
                          style={secondaryButtonStyle}
                        >
                          {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={orderDetailStyle}>
                        <h4>Detalle del pedido</h4>

                        <div style={itemsTableWrapperStyle}>
                          <table style={tableStyle}>
                            <thead>
                              <tr>
                                <th style={thStyle}>Producto</th>
                                <th style={thStyle}>Categoría</th>
                                <th style={thStyle}>Cantidad</th>
                                <th style={thStyle}>Precio unitario</th>
                                <th style={thStyle}>Subtotal</th>
                              </tr>
                            </thead>

                            <tbody>
                              {order.order_items.map((item) => (
                                <tr key={item.id}>
                                  <td style={tdStyle}>{item.product_name}</td>
                                  <td style={tdStyle}>{item.category}</td>
                                  <td style={tdStyle}>{item.quantity}</td>
                                  <td style={tdStyle}>
                                    {formatCurrency(item.unit_price)}
                                  </td>
                                  <td style={tdStyle}>
                                    {formatCurrency(item.subtotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={deliveryGridStyle}>
                          <p>
                            <strong>Provincia:</strong>{" "}
                            {order.province || "No indicada"}
                          </p>

                          <p>
                            <strong>Dirección:</strong>{" "}
                            {order.address || "No indicada"}
                          </p>

                          <p>
                            <strong>Método de pago:</strong>{" "}
                            {order.payment_method || "No indicado"}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "users" && (
        <section style={cardStyle}>
          <h2>Usuarios</h2>
          <p>Usuarios registrados en Herbalist.</p>

          <div style={orderFiltersStyle}>
            <div>
              <label>Buscar usuario</label>
              <input
                type="text"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Nombre, correo, teléfono o rol..."
                style={inputStyle}
              />
            </div>

            <div>
              <label>Filtrar por rol</label>
              <select
                value={userRoleFilter}
                onChange={(event) => setUserRoleFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="Todos">Todos</option>
                <option value="customer">Clientes</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>

          {userError && <p style={errorStyle}>{userError}</p>}

          {isLoadingUsers ? (
            <p>Cargando usuarios...</p>
          ) : filteredUsers.length === 0 ? (
            <p>No hay usuarios que coincidan con la búsqueda.</p>
          ) : (
            <div style={itemsTableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Correo</th>
                    <th style={thStyle}>Teléfono</th>
                    <th style={thStyle}>Rol</th>
                    <th style={thStyle}>Pedidos</th>
                    <th style={thStyle}>Total comprado</th>
                    <th style={thStyle}>Fecha registro</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td style={tdStyle}>{user.full_name || "Sin nombre"}</td>
                      <td style={tdStyle}>{user.email || "Sin correo"}</td>
                      <td style={tdStyle}>{user.phone || "No indicado"}</td>
                      <td style={tdStyle}>
                        <span style={roleBadgeStyle(user.role)}>
                          {user.role || "Sin rol"}
                        </span>
                      </td>
                      <td style={tdStyle}>{user.total_orders}</td>
                      <td style={tdStyle}>{formatCurrency(user.total_spent)}</td>
                      <td style={tdStyle}>{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "40px",
  backgroundColor: "#eef3e9",
};

const tabsStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "25px",
  marginBottom: "25px",
  flexWrap: "wrap",
};

function tabStyle(active) {
  return {
    padding: "10px 14px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: active ? "#315d40" : "white",
    color: active ? "white" : "#315d40",
    fontWeight: "bold",
    cursor: "pointer",
  };
}

const cardStyle = {
  padding: "28px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
};

const formStyle = {
  marginTop: "20px",
  marginBottom: "35px",
  padding: "22px",
  backgroundColor: "#f5f7f2",
  borderRadius: "10px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "16px",
};

const fieldStyle = {
  marginBottom: "16px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  padding: "11px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  padding: "12px 16px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#315d40",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 14px",
  border: "1px solid #315d40",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#315d40",
  fontWeight: "bold",
  cursor: "pointer",
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

const listStyle = {
  display: "grid",
  gap: "14px",
};

const productRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  padding: "16px",
  border: "1px solid #d9e0d5",
  borderRadius: "8px",
  flexWrap: "wrap",
};

const orderFiltersStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "16px",
  marginTop: "20px",
  marginBottom: "24px",
};

const orderRowStyle = {
  padding: "18px",
  border: "1px solid #d9e0d5",
  borderRadius: "10px",
  backgroundColor: "#fbfcf9",
};

const orderHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
};

const orderSummaryStyle = {
  display: "grid",
  gap: "10px",
  minWidth: "220px",
  alignContent: "start",
};

function statusBadgeStyle(status) {
  const colors = {
    Pendiente: {
      backgroundColor: "#fff3cd",
      color: "#7a5b00",
    },
    Confirmado: {
      backgroundColor: "#dbeafe",
      color: "#1e3a8a",
    },
    "En preparación": {
      backgroundColor: "#ede9fe",
      color: "#4c1d95",
    },
    Enviado: {
      backgroundColor: "#cffafe",
      color: "#155e75",
    },
    Entregado: {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    Cancelado: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
  };

  return {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    textAlign: "center",
    ...colors[status],
  };
}

function roleBadgeStyle(role) {
  const colors = {
    admin: {
      backgroundColor: "#ede9fe",
      color: "#4c1d95",
    },
    customer: {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
  };

  return {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    textAlign: "center",
    ...(colors[role] || {
      backgroundColor: "#e5e7eb",
      color: "#374151",
    }),
  };
}

const orderDetailStyle = {
  marginTop: "18px",
  paddingTop: "16px",
  borderTop: "1px solid #d9e0d5",
};

const itemsTableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #d9e0d5",
  backgroundColor: "#eef3e9",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #edf0ea",
};

const deliveryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
  marginTop: "14px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "14px",
  marginTop: "20px",
};

const statCardStyle = {
  display: "grid",
  gap: "6px",
  padding: "18px",
  borderRadius: "10px",
  backgroundColor: "#f5f7f2",
  border: "1px solid #d9e0d5",
};

const miniOrderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  padding: "14px",
  border: "1px solid #d9e0d5",
  borderRadius: "8px",
  backgroundColor: "#fbfcf9",
  flexWrap: "wrap",
};

const miniOrderRightStyle = {
  display: "grid",
  gap: "8px",
  minWidth: "160px",
  alignContent: "center",
};