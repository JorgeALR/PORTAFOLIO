// Las herramientas trabajan localmente en el navegador y no envían información a servidores.
(() => {
  const creativeForm = document.getElementById("creative-form");
  const canvas = document.getElementById("creative-canvas");
  const creativeStatus = document.getElementById("creative-status");
  const downloadButton = document.getElementById("creative-download");
  const paletteColors = {
    violet: ["#26104f", "#7059d9", "#ffbd69"],
    sunset: ["#712747", "#ec765c", "#ffe3a0"],
    forest: ["#123c38", "#4a9d79", "#ffe3a0"],
  };
  const formats = {
    square: [1080, 1080],
    landscape: [1200, 630],
    story: [1080, 1920],
  };

  // Dibuja cajas redondeadas con trazados compatibles con navegadores sin roundRect.
  function roundedBox(context, x, y, width, height, radius) {
    const corner = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + corner, y);
    context.lineTo(x + width - corner, y);
    context.quadraticCurveTo(x + width, y, x + width, y + corner);
    context.lineTo(x + width, y + height - corner);
    context.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
    context.lineTo(x + corner, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - corner);
    context.lineTo(x, y + corner);
    context.quadraticCurveTo(x, y, x + corner, y);
    context.closePath();
  }

  // Ajusta el texto al ancho disponible para que la creatividad no corte palabras.
  function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);

    lines.slice(0, maxLines).forEach((lineText, index) => {
      context.fillText(lineText, x, y + index * lineHeight);
    });
    return Math.min(lines.length, maxLines);
  }

  // Actualiza la vista previa usando únicamente textos introducidos en este navegador.
  function renderCreative() {
    if (!creativeForm || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) {
      if (creativeStatus) creativeStatus.textContent = "Este navegador no permite generar la vista previa.";
      return;
    }

    const fields = new FormData(creativeForm);
    const [width, height] = formats[fields.get("format")] || formats.square;
    const [darkColor, lightColor, accentColor] = paletteColors[fields.get("palette")] || paletteColors.violet;
    const business = (fields.get("business") || "").trim();
    const title = (fields.get("title") || "").trim();
    const copy = (fields.get("copy") || "").trim();
    const cta = (fields.get("cta") || "").trim();
    canvas.width = width;
    canvas.height = height;

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, darkColor);
    background.addColorStop(1, lightColor);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    // Formas vectoriales decorativas dan profundidad sin depender de fotos externas.
    context.globalAlpha = 0.14;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(width * 0.92, height * 0.16, width * 0.23, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(width * 0.08, height * 0.88, width * 0.28, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    const margin = width * 0.1;
    const scale = Math.min(width / 1080, height / 1080);
    const labelY = height * 0.2;
    const badgeWidth = Math.min(width * 0.56, Math.max(width * 0.28, (business.length + 8) * 15 * scale));
    roundedBox(context, margin, labelY - 48 * scale, badgeWidth, 64 * scale, 30 * scale);
    context.fillStyle = accentColor;
    context.fill();
    context.fillStyle = darkColor;
    context.font = `700 ${Math.max(18, 25 * scale)}px Arial, sans-serif`;
    context.textBaseline = "middle";
    context.fillText(business || "TU IMPRENTA", margin + 22 * scale, labelY - 16 * scale, badgeWidth - 40 * scale);

    context.fillStyle = "#ffffff";
    context.textBaseline = "alphabetic";
    const titleSize = Math.min(94 * scale, width * 0.09, height * 0.065);
    context.font = `700 ${Math.max(38, titleSize)}px Arial, sans-serif`;
    const titleY = height * 0.39;
    const titleLines = drawWrappedText(context, title, margin, titleY, width - margin * 2, titleSize * 1.14, 3);

    context.fillStyle = accentColor;
    context.fillRect(margin, titleY + titleLines * titleSize * 1.14 + 14 * scale, width * 0.18, 8 * scale);

    const copySize = Math.max(24, Math.min(36 * scale, width * 0.045));
    context.font = `400 ${copySize}px Arial, sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, 0.92)";
    drawWrappedText(context, copy, margin, titleY + titleLines * titleSize * 1.14 + 74 * scale, width - margin * 2, copySize * 1.45, 3);

    const buttonY = height * 0.79;
    const buttonWidth = Math.min(width * 0.72, Math.max(width * 0.42, (cta.length + 5) * 20 * scale));
    roundedBox(context, margin, buttonY, buttonWidth, 82 * scale, 41 * scale);
    context.fillStyle = "#ffffff";
    context.fill();
    context.fillStyle = darkColor;
    context.font = `700 ${Math.max(23, 31 * scale)}px Arial, sans-serif`;
    context.textBaseline = "middle";
    context.fillText(cta, margin + 28 * scale, buttonY + 41 * scale, buttonWidth - 56 * scale);

    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.font = `600 ${Math.max(17, 20 * scale)}px Arial, sans-serif`;
    context.textBaseline = "alphabetic";
    context.fillText("IMPRESOS PARA HACERTE NOTAR", margin, height * 0.91, width - margin * 2);
    canvas.setAttribute("aria-label", `Vista previa de publicación: ${title || "diseño de imprenta"}`);
    if (creativeStatus) creativeStatus.textContent = "";
  }

  if (creativeForm && canvas) {
    creativeForm.addEventListener("input", renderCreative);
    creativeForm.addEventListener("change", renderCreative);
    renderCreative();
  }

  // Descarga el lienzo como PNG sin subirlo a un servicio externo.
  if (downloadButton && canvas) {
    downloadButton.addEventListener("click", () => {
      renderCreative();
      canvas.toBlob((image) => {
        if (!image) {
          if (creativeStatus) creativeStatus.textContent = "No se pudo preparar el PNG. Intenta de nuevo.";
          return;
        }
        const imageUrl = URL.createObjectURL(image);
        const downloadLink = document.createElement("a");
        downloadLink.href = imageUrl;
        downloadLink.download = "publicacion-imprenta.png";
        downloadLink.click();
        window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
        if (creativeStatus) creativeStatus.textContent = "Diseño descargado. Revisa que el texto y la oferta sean correctos antes de publicar.";
      }, "image/png");
    });
  }

  // Solo mantiene estos resúmenes en memoria; al recargar la página se descartan.
  const insightsForm = document.getElementById("insights-form");
  const insightsResults = document.getElementById("insights-results");
  const insightsStatus = document.getElementById("insights-status");
  const audienceRecords = [];

  function appendCell(row, value, header = false) {
    const cell = document.createElement(header ? "th" : "td");
    if (header) cell.scope = "col";
    cell.textContent = value;
    row.appendChild(cell);
  }

  // Renderiza datos con textContent para no interpretar entradas como HTML.
  function renderAudienceRecords() {
    if (!insightsResults) return;
    insightsResults.replaceChildren();
    if (audienceRecords.length === 0) return;

    const table = document.createElement("table");
    table.className = "insights-table";
    const caption = document.createElement("caption");
    caption.textContent = "Comparación temporal de resultados agregados por público";
    table.appendChild(caption);

    const headings = ["Fecha del reporte", "Público", "Alcance", "Impresiones", "Clics", "Consultas", "Pedidos", "Clics / impresiones", "Pedidos / consultas", "Costo / consulta", "Costo / pedido"];
    const head = document.createElement("thead");
    const headingRow = document.createElement("tr");
    headings.forEach((heading) => appendCell(headingRow, heading, true));
    head.appendChild(headingRow);
    table.appendChild(head);

    const body = document.createElement("tbody");
    audienceRecords.forEach((record) => {
      const row = document.createElement("tr");
      const clickRate = record.impressions ? `${((record.clicks / record.impressions) * 100).toFixed(1)}%` : "—";
      const orderRate = record.leads ? `${((record.orders / record.leads) * 100).toFixed(1)}%` : "—";
      const costPerLead = record.spend !== null && record.leads ? record.spend / record.leads : null;
      const costPerOrder = record.spend !== null && record.orders ? record.spend / record.orders : null;
      [
        record.date,
        record.audience,
        record.reach.toLocaleString(),
        record.impressions.toLocaleString(),
        record.clicks.toLocaleString(),
        record.leads.toLocaleString(),
        record.orders.toLocaleString(),
        clickRate,
        orderRate,
        costPerLead === null ? "—" : costPerLead.toFixed(2),
        costPerOrder === null ? "—" : costPerOrder.toFixed(2),
      ].forEach((value) => appendCell(row, value));
      body.appendChild(row);
    });
    table.appendChild(body);
    insightsResults.appendChild(table);
  }

  // Comprueba que el embudo tenga valores coherentes antes de añadir un resumen.
  if (insightsForm) {
    insightsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = new FormData(insightsForm);
      const record = {
        date: fields.get("date"),
        audience: fields.get("audience"),
        reach: Number(fields.get("reach")),
        impressions: Number(fields.get("impressions")),
        clicks: Number(fields.get("clicks")),
        leads: Number(fields.get("leads")),
        orders: Number(fields.get("orders")),
        spend: fields.get("spend") === "" ? null : Number(fields.get("spend")),
      };

      if (record.impressions < record.reach) {
        insightsStatus.textContent = "Las impresiones no pueden ser menores que las personas alcanzadas.";
        return;
      }
      if (record.leads > record.clicks || record.orders > record.leads) {
        insightsStatus.textContent = "Revisa el embudo: las consultas no deben superar los clics y los pedidos no deben superar las consultas.";
        return;
      }

      audienceRecords.push(record);
      renderAudienceRecords();
      insightsStatus.textContent = `Resumen agregado de ${record.audience} añadido solo a esta sesión. Compara varios periodos antes de cambiar la segmentación.`;
      insightsForm.reset();
    });
  }
})();
