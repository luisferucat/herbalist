import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  });
}

function getOrderLastFour(orderNumber) {
  if (!orderNumber) return "0000";
  return String(orderNumber).replace(/\s+/g, "").slice(-4);
}

function buildItemsHtml(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return "<p>No se recibieron productos en el detalle.</p>";
  }

  return `
    <table style="width:100%; border-collapse:collapse; margin-top:12px;">
      <thead>
        <tr>
          <th style="text-align:left; padding:8px; border-bottom:1px solid #d9e0d5;">Producto</th>
          <th style="text-align:center; padding:8px; border-bottom:1px solid #d9e0d5;">Cantidad</th>
          <th style="text-align:right; padding:8px; border-bottom:1px solid #d9e0d5;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((item) => {
            const name = item.name || item.product_name || "Producto";
            const quantity = Number(item.quantity || 0);
            const price = Number(item.price || item.unit_price || 0);
            const subtotal = Number(item.subtotal || price * quantity);

            return `
              <tr>
                <td style="padding:8px; border-bottom:1px solid #edf0ea;">${name}</td>
                <td style="text-align:center; padding:8px; border-bottom:1px solid #edf0ea;">${quantity}</td>
                <td style="text-align:right; padding:8px; border-bottom:1px solid #edf0ea;">${formatCurrency(subtotal)}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Método no permitido",
    });
  }

  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return response.status(500).json({
        error: "Faltan variables de entorno de Gmail en Vercel.",
      });
    }

    const order = request.body?.order;

    if (!order?.email || !order?.number) {
      return response.status(400).json({
        error: "Faltan datos obligatorios del pedido.",
      });
    }

    const orderLastFour = getOrderLastFour(order.number);
    const sinpeDetail = `${order.name || "Cliente"} - Pedido ${orderLastFour}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const html = `
      <div style="font-family:Arial, sans-serif; color:#243528; line-height:1.5;">
        <h1 style="color:#315d40;">Herbalist</h1>

        <h2>Pedido recibido</h2>

        <p>Hola ${order.name || "cliente"},</p>

        <p>
          Recibimos tu pedido correctamente. El estado actual es
          <strong>${order.status || "Pendiente"}</strong>.
        </p>

        <div style="padding:16px; background:#eef3e9; border-radius:8px; margin:18px 0;">
          <p><strong>Número de pedido:</strong> ${order.number}</p>
          <p><strong>Total del pedido:</strong> ${formatCurrency(order.total)}</p>
          <p><strong>Método de pago:</strong> SINPE</p>
          <p><strong>Número SINPE:</strong> 8736-0393</p>
          <p><strong>Detalle del SINPE:</strong> ${sinpeDetail}</p>
          <p><strong>Enviar comprobante a:</strong> herbalistplants@gmail.com</p>
        </div>

        ${
          order.accessCode
            ? `
              <div style="padding:16px; background:#fff4cf; border-radius:8px; margin:18px 0;">
                <p><strong>Código de consulta:</strong></p>
                <p style="font-size:22px; letter-spacing:3px; font-weight:bold;">${order.accessCode}</p>
                <p>Guarda este código junto con tu número de pedido para consultar el estado de la compra.</p>
              </div>
            `
            : ""
        }

        <h3>Dirección de entrega</h3>
        <p>
          <strong>Provincia:</strong> ${order.province || "No indicada"}<br />
          <strong>Dirección:</strong> ${order.address || "No indicada"}
        </p>

        <h3>Productos</h3>
        ${buildItemsHtml(order.products)}

        <p style="margin-top:22px;">
          El pedido quedará pendiente hasta que el pago sea revisado y aprobado.
        </p>

        <p style="color:#6a766b; font-size:13px;">
          Este correo corresponde a un proyecto académico simulado.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Herbalist" <${GMAIL_USER}>`,
      to: order.email,
      subject: `Pedido recibido - ${order.number}`,
      html,
    });

    return response.status(200).json({
      ok: true,
      message: "Correo de pedido enviado correctamente.",
    });
  } catch (error) {
    console.error("Error enviando correo de pedido:", error);

    return response.status(500).json({
      error: error instanceof Error ? error.message : "Error enviando correo.",
    });
  }
}