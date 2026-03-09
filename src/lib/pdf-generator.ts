import jsPDF from "jspdf";

const LOGO_URL = "/images/seven-trip-logo.png";
let cachedLogoBase64: string | null = null;

async function loadLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = LOGO_URL;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    cachedLogoBase64 = canvas.toDataURL("image/png");
    return cachedLogoBase64;
  } catch {
    return null;
  }
}

async function loadImageBase64(url: string): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function addLogo(doc: jsPDF, logo: string | null, x: number, y: number, h: number) {
  if (!logo) return;
  try {
    const w = h * 4;
    doc.addImage(logo, "PNG", x, y, w, h);
  } catch { /* fallback */ }
}

/* ════════════════════════════════════════════════════════════════════
   INVOICE PDF
   ════════════════════════════════════════════════════════════════════ */

interface InvoiceData {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  subtotal: number;
  tax: number;
  discount: number;
  amount: number;
  status: string;
  serviceType?: string;
}

export async function generateInvoicePDF(inv: InvoiceData) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const logo = await loadLogoBase64();

  addLogo(doc, logo, 20, 12, 10);
  const textStartY = logo ? 28 : 25;

  doc.setFontSize(logo ? 10 : 22);
  doc.setFont("helvetica", "bold");
  if (!logo) doc.text("Seven Trip", 20, 25);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Seven Trip Bangladesh Ltd", 20, textStartY + 4);
  doc.text("Dhaka, Bangladesh | support@seventrip.com.bd", 20, textStartY + 9);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(inv.invoiceNo, w - 20, 25, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Date: ${inv.date}`, w - 20, 32, { align: "right" });
  doc.text(`Status: ${inv.status}`, w - 20, 37, { align: "right" });

  doc.setDrawColor(200);
  doc.line(20, 44, w - 20, 44);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("BILL TO", 20, 54);
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(inv.customerName, 20, 61);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(inv.customerEmail, 20, 67);

  doc.setTextColor(100);
  doc.text("BOOKING REFERENCE", w / 2, 54);
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(inv.bookingRef, w / 2, 61);
  if (inv.serviceType) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(inv.serviceType.charAt(0).toUpperCase() + inv.serviceType.slice(1), w / 2, 67);
  }

  const tableY = 82;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, tableY - 5, w - 40, 10, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80);
  doc.text("Description", 25, tableY + 1);
  doc.text("Amount", w - 25, tableY + 1, { align: "right" });

  let y = tableY + 14;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(10);

  doc.text("Subtotal", 25, y);
  doc.text(`BDT ${inv.subtotal?.toLocaleString()}`, w - 25, y, { align: "right" });
  y += 10;

  if (inv.tax > 0) {
    doc.text("Tax (5%)", 25, y);
    doc.text(`BDT ${inv.tax?.toLocaleString()}`, w - 25, y, { align: "right" });
    y += 10;
  }

  if (inv.discount > 0) {
    doc.setTextColor(0, 150, 0);
    doc.text("Discount", 25, y);
    doc.text(`-BDT ${inv.discount?.toLocaleString()}`, w - 25, y, { align: "right" });
    doc.setTextColor(0);
    y += 10;
  }

  doc.setDrawColor(200);
  doc.line(20, y, w - 20, y);
  y += 8;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Total", 25, y);
  doc.text(`BDT ${inv.amount?.toLocaleString()}`, w - 25, y, { align: "right" });

  y += 25;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Thank you for choosing Seven Trip. For queries, contact support@seventrip.com.bd", w / 2, y, { align: "center" });
  doc.text("This is a computer-generated invoice and does not require a signature.", w / 2, y + 6, { align: "center" });

  doc.save(`${inv.invoiceNo}.pdf`);
}

export async function printInvoicePDF(inv: InvoiceData) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const logo = await loadLogoBase64();

  addLogo(doc, logo, 20, 12, 10);
  const textStartY = logo ? 28 : 25;

  doc.setFontSize(logo ? 10 : 22);
  doc.setFont("helvetica", "bold");
  if (!logo) doc.text("Seven Trip", 20, 25);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Seven Trip Bangladesh Ltd", 20, textStartY + 4);
  doc.text("Dhaka, Bangladesh | support@seventrip.com.bd", 20, textStartY + 9);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(inv.invoiceNo, w - 20, 25, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Date: ${inv.date}`, w - 20, 32, { align: "right" });
  doc.text(`Status: ${inv.status}`, w - 20, 37, { align: "right" });

  doc.setDrawColor(200);
  doc.line(20, 44, w - 20, 44);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("BILL TO", 20, 54);
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(inv.customerName, 20, 61);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(inv.customerEmail, 20, 67);

  doc.setTextColor(100);
  doc.text("BOOKING REFERENCE", w / 2, 54);
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(inv.bookingRef, w / 2, 61);

  const tableY = 82;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, tableY - 5, w - 40, 10, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80);
  doc.text("Description", 25, tableY + 1);
  doc.text("Amount", w - 25, tableY + 1, { align: "right" });

  let y = tableY + 14;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text("Subtotal", 25, y);
  doc.text(`BDT ${inv.subtotal?.toLocaleString()}`, w - 25, y, { align: "right" });
  y += 10;
  if (inv.tax > 0) {
    doc.text("Tax (5%)", 25, y);
    doc.text(`BDT ${inv.tax?.toLocaleString()}`, w - 25, y, { align: "right" });
    y += 10;
  }
  if (inv.discount > 0) {
    doc.setTextColor(0, 150, 0);
    doc.text("Discount", 25, y);
    doc.text(`-BDT ${inv.discount?.toLocaleString()}`, w - 25, y, { align: "right" });
    doc.setTextColor(0);
    y += 10;
  }
  doc.setDrawColor(200);
  doc.line(20, y, w - 20, y);
  y += 8;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Total", 25, y);
  doc.text(`BDT ${inv.amount?.toLocaleString()}`, w - 25, y, { align: "right" });

  y += 25;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Thank you for choosing Seven Trip.", w / 2, y, { align: "center" });

  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => { printWindow.print(); };
  }
}

/* ════════════════════════════════════════════════════════════════════
   ENTERPRISE E-TICKET / TRAVEL ITINERARY PDF
   Based on professional airline ticket format (like the sample)
   ════════════════════════════════════════════════════════════════════ */

interface FlightSegment {
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  originCity?: string;
  destination: string;
  destinationCity?: string;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  cabinClass?: string;
  aircraft?: string;
  terminal?: string;
  arrivalTerminal?: string;
  stops?: number;
  baggage?: string;
  status?: string;
  meal?: string;
}

interface PassengerInfo {
  title?: string;
  firstName: string;
  lastName: string;
  passport?: string;
  seat?: string;
  ticketNumber?: string;
}

interface TicketData {
  // Legacy compat
  id?: string;
  airline?: string;
  flightNo?: string;
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  passenger?: string;
  pnr?: string;
  seat?: string;
  class?: string;
  // Enterprise fields
  bookingRef?: string;
  airlineReservationCode?: string;
  isRoundTrip?: boolean;
  outbound?: FlightSegment[];
  returnSegments?: FlightSegment[];
  passengers?: PassengerInfo[];
  meal?: string;
  extraBaggage?: string[];
  totalFare?: number;
  currency?: string;
}

function drawBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h);
}

function drawFilledBox(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, g: number, b: number) {
  doc.setFillColor(r, g, b);
  doc.rect(x, y, w, h, "F");
}

async function drawFlightSegment(
  doc: jsPDF,
  seg: FlightSegment,
  y: number,
  pageW: number,
  airlineLogo: string | null,
  direction: string,
): Promise<number> {
  const lm = 15; // left margin
  const boxW = pageW - 30;

  // Direction header
  drawFilledBox(doc, lm, y, boxW, 8, 50, 50, 50);
  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`DEPARTURE: ${direction.toUpperCase()}`, lm + 4, y + 5.5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Please verify flight times prior to departure", lm + 80, y + 5.5);
  y += 12;

  // Main segment box
  const segBoxH = 55;
  drawBox(doc, lm, y, boxW, segBoxH);

  // Airline column (left ~40%)
  const col1W = 50;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  // Airline logo
  if (airlineLogo) {
    try { doc.addImage(airlineLogo, "PNG", lm + 3, y + 3, 12, 12); } catch { /* skip */ }
  }

  doc.text(seg.airline.toUpperCase(), lm + (airlineLogo ? 17 : 4), y + 9);
  doc.setFontSize(12);
  doc.text(seg.flightNumber, lm + 4, y + 18);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  let infoY = y + 25;
  doc.text(`Duration:`, lm + 4, infoY);
  doc.text(seg.duration || "—", lm + 28, infoY);
  infoY += 5;
  doc.text(`Cabin:`, lm + 4, infoY);
  doc.text(`${seg.cabinClass || "Economy"}`, lm + 28, infoY);
  infoY += 5;
  doc.text(`Status:`, lm + 4, infoY);
  doc.setTextColor(0, 130, 0);
  doc.setFont("helvetica", "bold");
  doc.text(seg.status || "Confirmed", lm + 28, infoY);
  doc.setTextColor(80);
  doc.setFont("helvetica", "normal");

  // Origin column (middle left ~25%)
  const col2X = lm + col1W + 2;
  doc.setDrawColor(200);
  doc.line(col2X - 2, y + 1, col2X - 2, y + segBoxH - 1);

  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(seg.origin, col2X + 4, y + 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(seg.originCity?.toUpperCase() || "", col2X + 4, y + 17);

  // Arrow
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text("▶", col2X + 35, y + 12);

  doc.setFontSize(8);
  doc.setTextColor(80);
  doc.text("Departing At:", col2X + 4, y + 26);
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(seg.departureTime ? new Date(seg.departureTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—", col2X + 4, y + 34);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  if (seg.terminal) {
    doc.text(`Terminal:`, col2X + 4, y + 41);
    doc.text(seg.terminal, col2X + 4, y + 46);
  }

  // Destination column (middle right ~25%)
  const col3X = col2X + 48;
  doc.setDrawColor(200);
  doc.line(col3X - 2, y + 1, col3X - 2, y + segBoxH - 1);

  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(seg.destination, col3X + 4, y + 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(seg.destinationCity?.toUpperCase() || "", col3X + 4, y + 17);

  doc.setFontSize(8);
  doc.text("Arriving At:", col3X + 4, y + 26);
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(seg.arrivalTime ? new Date(seg.arrivalTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—", col3X + 4, y + 34);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  if (seg.arrivalTerminal) {
    doc.text(`Terminal:`, col3X + 4, y + 41);
    doc.text(seg.arrivalTerminal, col3X + 4, y + 46);
  }

  // Details column (right ~15%)
  const col4X = col3X + 48;
  doc.setDrawColor(200);
  doc.line(col4X - 2, y + 1, col4X - 2, y + segBoxH - 1);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  let detY = y + 8;
  doc.text("Aircraft:", col4X + 2, detY);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(seg.aircraft || "—", col4X + 2, detY + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  detY += 14;
  doc.text("Meals:", col4X + 2, detY);
  doc.text(seg.meal || "Meals", col4X + 2, detY + 5);
  detY += 14;
  doc.text("Baggage:", col4X + 2, detY);
  doc.text(seg.baggage || "20kg", col4X + 2, detY + 5);

  y += segBoxH + 2;

  return y;
}

export async function generateTicketPDF(ticket: TicketData) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const logo = await loadLogoBase64();
  const lm = 15;

  // ─── Build segments from ticket data ───
  const outboundSegments: FlightSegment[] = ticket.outbound || [];
  const returnSegments: FlightSegment[] = ticket.returnSegments || [];

  // Legacy single-flight fallback
  if (outboundSegments.length === 0 && ticket.from) {
    outboundSegments.push({
      airline: ticket.airline || "Seven Trip",
      airlineCode: (ticket as any).airlineCode || "",
      flightNumber: ticket.flightNo || "",
      origin: ticket.from || "",
      destination: ticket.to || "",
      departureTime: ticket.time || ticket.date || "",
      arrivalTime: "",
      duration: "",
      cabinClass: ticket.class || "Economy",
      baggage: "20kg",
      status: "Confirmed",
    });
  }

  const passengers: PassengerInfo[] = ticket.passengers || [
    { firstName: ticket.passenger || "Traveller", lastName: "", seat: ticket.seat, ticketNumber: ticket.id },
  ];

  const bookingRef = ticket.bookingRef || ticket.pnr || ticket.id || "";
  const departDate = ticket.date || (outboundSegments[0]?.departureTime ? new Date(outboundSegments[0].departureTime).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "");
  const destCity = outboundSegments[outboundSegments.length - 1]?.destinationCity || outboundSegments[outboundSegments.length - 1]?.destination || ticket.to || "";

  // ─── HEADER BAR ───
  drawFilledBox(doc, 0, 0, w, 22, 30, 30, 30);

  // Logo
  if (logo) {
    try { doc.addImage(logo, "PNG", lm, 3, 40, 10); } catch { /* skip */ }
  } else {
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Seven Trip", lm, 14);
  }

  // Title
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`${departDate}  ▸  TRIP TO ${destCity.toUpperCase()}`, lm + (logo ? 45 : 52), 9);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Seven Trip Bangladesh Ltd | www.seventrip.com.bd | +880 1234-567890", lm + (logo ? 45 : 52), 16);

  let y = 28;

  // ─── PREPARED FOR + RESERVATION CODE ───
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.text("PREPARED FOR", lm, y);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  y += 6;
  passengers.forEach((p) => {
    doc.text(`${p.lastName ? `${p.lastName.toUpperCase()}/${p.firstName.toUpperCase()}` : p.firstName.toUpperCase()} ${p.title?.toUpperCase() || ""}`.trim(), lm, y);
    y += 6;
  });

  // Reservation codes (right side)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("RESERVATION CODE", w - 60, 28);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(bookingRef, w - 60, 35);

  if (ticket.airlineReservationCode) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("AIRLINE RESERVATION CODE", w - 60, 41);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(ticket.airlineReservationCode, w - 60, 47);
  }

  y += 4;
  doc.setDrawColor(180);
  doc.line(lm, y, w - lm, y);
  y += 6;

  // ─── FLIGHT SEGMENTS ───
  // Load airline logo
  const firstCode = outboundSegments[0]?.airlineCode || "";
  let airlineLogo: string | null = null;
  if (firstCode) {
    airlineLogo = await loadImageBase64(`https://images.kiwi.com/airlines/64/${firstCode}.png`);
  }

  // Outbound segments
  const outDate = outboundSegments[0]?.departureTime
    ? new Date(outboundSegments[0].departureTime).toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "short" }).toUpperCase()
    : departDate.toUpperCase();

  for (const seg of outboundSegments) {
    y = await drawFlightSegment(doc, seg, y, w, airlineLogo, outDate);

    // Passenger box after each segment
    drawFilledBox(doc, lm, y, w - 30, 6, 230, 230, 230);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);
    doc.text("Passenger Name:", lm + 3, y + 4);
    doc.text("Seats:", w - 50, y + 4);
    y += 7;

    passengers.forEach((p) => {
      doc.setTextColor(0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const name = `» ${p.lastName ? `${p.lastName.toUpperCase()}/${p.firstName.toUpperCase()}` : p.firstName.toUpperCase()} ${p.title?.toUpperCase() || ""}`.trim();
      doc.text(name, lm + 3, y + 3);
      doc.text(p.seat || "Check-In Required", w - 50, y + 3);
      y += 6;
    });

    y += 4;
  }

  // Return segments
  if (returnSegments.length > 0) {
    const retDate = returnSegments[0]?.departureTime
      ? new Date(returnSegments[0].departureTime).toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "short" }).toUpperCase()
      : "";

    // Load return airline logo if different
    const retCode = returnSegments[0]?.airlineCode || firstCode;
    let retLogo = airlineLogo;
    if (retCode && retCode !== firstCode) {
      retLogo = await loadImageBase64(`https://images.kiwi.com/airlines/64/${retCode}.png`);
    }

    for (const seg of returnSegments) {
      // Check if we need a new page
      if (y > 240) {
        doc.addPage();
        y = 15;
      }

      y = await drawFlightSegment(doc, seg, y, w, retLogo, retDate);

      drawFilledBox(doc, lm, y, w - 30, 6, 230, 230, 230);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60);
      doc.text("Passenger Name:", lm + 3, y + 4);
      doc.text("Seats:", w - 50, y + 4);
      y += 7;

      passengers.forEach((p) => {
        doc.setTextColor(0);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const name = `» ${p.lastName ? `${p.lastName.toUpperCase()}/${p.firstName.toUpperCase()}` : p.firstName.toUpperCase()} ${p.title?.toUpperCase() || ""}`.trim();
        doc.text(name, lm + 3, y + 3);
        doc.text(p.seat || "Check-In Required", w - 50, y + 3);
        y += 6;
      });

      y += 4;
    }
  }

  // ─── FOOTER ───
  if (y > 260) { doc.addPage(); y = 15; }
  y += 4;
  drawFilledBox(doc, lm, y, w - 30, 18, 240, 240, 240);
  doc.setTextColor(60);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVEL CONSULTANT", lm + 4, y + 6);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Seven Trip Bangladesh Ltd", lm + 4, y + 11);
  doc.text("support@seventrip.com.bd | +880 1234-567890", lm + 4, y + 15);

  doc.setTextColor(100);
  doc.setFontSize(6);
  doc.text("This is a computer-generated travel itinerary. Please arrive at the airport at least 2 hours before departure for domestic and 3 hours for international flights.", w / 2, y + 24, { align: "center" });
  doc.text("Powered by Seven Trip — www.seventrip.com.bd", w / 2, y + 28, { align: "center" });

  doc.save(`E-Ticket-${bookingRef}.pdf`);
}

export async function printTicketPDF(ticket: TicketData) {
  // Reuse generateTicketPDF logic but output to print
  const doc = new jsPDF();
  // Same generation as generateTicketPDF but output as blob for printing
  // For simplicity, generate and open in new window
  const w = doc.internal.pageSize.getWidth();
  const logo = await loadLogoBase64();
  const lm = 15;

  const outboundSegments: FlightSegment[] = ticket.outbound || [];
  const returnSegments: FlightSegment[] = ticket.returnSegments || [];

  if (outboundSegments.length === 0 && ticket.from) {
    outboundSegments.push({
      airline: ticket.airline || "Seven Trip",
      airlineCode: (ticket as any).airlineCode || "",
      flightNumber: ticket.flightNo || "",
      origin: ticket.from || "",
      destination: ticket.to || "",
      departureTime: ticket.time || ticket.date || "",
      arrivalTime: "",
      cabinClass: ticket.class || "Economy",
      baggage: "20kg",
      status: "Confirmed",
    });
  }

  const passengers: PassengerInfo[] = ticket.passengers || [
    { firstName: ticket.passenger || "Traveller", lastName: "", seat: ticket.seat },
  ];

  const bookingRef = ticket.bookingRef || ticket.pnr || ticket.id || "";

  drawFilledBox(doc, 0, 0, w, 22, 30, 30, 30);
  if (logo) {
    try { doc.addImage(logo, "PNG", lm, 3, 40, 10); } catch { /* */ }
  }
  doc.setTextColor(255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVEL ITINERARY", w - lm, 12, { align: "right" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Seven Trip Bangladesh Ltd", w - lm, 18, { align: "right" });

  let y = 30;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  passengers.forEach((p) => {
    doc.text(`${p.lastName ? `${p.lastName.toUpperCase()}/${p.firstName.toUpperCase()}` : p.firstName.toUpperCase()}`, lm, y);
    y += 6;
  });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Reservation: ${bookingRef}`, lm, y);
  y += 8;

  const firstCode = outboundSegments[0]?.airlineCode || "";
  let airlineLogo: string | null = null;
  if (firstCode) {
    airlineLogo = await loadImageBase64(`https://images.kiwi.com/airlines/64/${firstCode}.png`);
  }

  for (const seg of outboundSegments) {
    y = await drawFlightSegment(doc, seg, y, w, airlineLogo, "OUTBOUND");
    y += 2;
  }

  for (const seg of returnSegments) {
    if (y > 240) { doc.addPage(); y = 15; }
    const retCode = seg.airlineCode || firstCode;
    let retLogo = airlineLogo;
    if (retCode !== firstCode) {
      retLogo = await loadImageBase64(`https://images.kiwi.com/airlines/64/${retCode}.png`);
    }
    y = await drawFlightSegment(doc, seg, y, w, retLogo, "RETURN");
    y += 2;
  }

  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => { printWindow.print(); };
  }
}
