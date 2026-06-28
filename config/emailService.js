import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendTicketConfirmationEmail = async ({
  to,
  passengerName,
  ticketCode,
  origin,
  destination,
  busNumber,
  busType,
  seatNumber,
  departureTime,
  arrivalTime,
  price,
  paymentMethod,
  accountNumber,
  amountPaid,
}) => {
  const paymentMethodLabel = {
    telebirr: "TeleBirr",
    cbe: "CBE Birr",
    awash: "Awash Bank",
    amole: "Amole",
    coopay: "COOPay",
  }[paymentMethod] || paymentMethod;

  const mailOptions = {
    from: `"Bus Station System" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Ticket Confirmed — ${origin} → ${destination}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: #1d4ed8; padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .header p { color: #bfdbfe; margin: 6px 0 0; font-size: 14px; }
          .ticket-code { background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 12px; padding: 16px; text-align: center; margin: 24px; }
          .ticket-code p { color: #6b7280; font-size: 12px; margin: 0 0 4px; }
          .ticket-code h2 { color: #1d4ed8; font-size: 22px; font-family: monospace; margin: 0; letter-spacing: 2px; }
          .section { padding: 0 24px 20px; }
          .section h3 { color: #1e3a8a; font-size: 13px; font-weight: 700; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e0e7ff; padding-bottom: 6px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-box { background: #eff6ff; border-radius: 10px; padding: 12px; }
          .info-box label { display: block; font-size: 10px; color: #6b7280; font-weight: 600; margin-bottom: 3px; text-transform: uppercase; }
          .info-box span { font-size: 13px; color: #1e3a8a; font-weight: 700; }
          .route-box { text-align: center; padding: 16px 24px 8px; }
          .route-box h2 { font-size: 20px; color: #111827; font-weight: 900; margin: 0; }
          .route-box p { color: #6b7280; font-size: 13px; margin: 4px 0 0; }
          .price-box { background: #1d4ed8; border-radius: 12px; padding: 16px 24px; margin: 0 24px 16px; display: flex; justify-content: space-between; align-items: center; }
          .price-box span { color: #bfdbfe; font-size: 13px; }
          .price-box strong { color: white; font-size: 22px; font-weight: 900; }
          .payment-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin: 0 24px 20px; }
          .payment-box h3 { color: #166534; font-size: 13px; font-weight: 700; margin: 0 0 10px; text-transform: uppercase; }
          .payment-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
          .payment-row span { color: #6b7280; }
          .payment-row strong { color: #166534; font-weight: 700; }
          .footer { background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">

          <!-- Header -->
          <div class="header">
            <h1>🚌 Bus Station System</h1>
            <p>Ticket Confirmation — Kaffaltii Raawwatameera</p>
          </div>

          <!-- Greeting -->
          <div style="padding: 20px 24px 0;">
            <p style="color: #374151; font-size: 15px; margin:0;">Nagaatti <strong>${passengerName}</strong>! 👋</p>
            <p style="color: #6b7280; font-size: 13px; margin: 6px 0 0;">Ticket kee fi kaffaltiin dhugoomteera. Odeeffannoo guutuu armaan gadii ilaali.</p>
          </div>

          <!-- Ticket Code -->
          <div class="ticket-code">
            <p>Ticket Code Kee</p>
            <h2>${ticketCode}</h2>
          </div>

          <!-- Route -->
          <div class="route-box">
            <h2>${origin} → ${destination}</h2>
            <p>Bus: ${busNumber} (${busType}) | Seat No: <strong>${seatNumber}</strong></p>
          </div>

          <!-- Trip Info -->
          <div class="section">
            <h3>🗓️ Odeeffannoo Deemsa</h3>
            <div class="info-grid">
              <div class="info-box">
                <label>Departure</label>
                <span>${new Date(departureTime).toLocaleString()}</span>
              </div>
              <div class="info-box">
                <label>Arrival</label>
                <span>${new Date(arrivalTime).toLocaleString()}</span>
              </div>
              <div class="info-box">
                <label>Bus Number</label>
                <span>${busNumber}</span>
              </div>
              <div class="info-box">
                <label>Seat Number</label>
                <span>${seatNumber}</span>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="price-box">
            <span>Ticket Price</span>
            <strong>ETB ${price}</strong>
          </div>

          <!-- Payment Details -->
          <div class="payment-box">
            <h3>💳 Odeeffannoo Kaffaltii</h3>
            <div class="payment-row">
              <span>Karaa Kaffaltii</span>
              <strong>${paymentMethodLabel}</strong>
            </div>
            <div class="payment-row">
              <span>Account / Phone</span>
              <strong style="font-family: monospace;">${accountNumber}</strong>
            </div>
            <div class="payment-row">
              <span>Kaffalame</span>
              <strong>ETB ${amountPaid}</strong>
            </div>
            <div class="payment-row">
              <span>Status</span>
              <strong style="color: #16a34a;">✅ Raawwatameera</strong>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Bus Station System — Nekemte, Ethiopia</p>
            <p style="margin-top: 6px; color: #d1d5db;">Email kana irratti deebii hin ergina. Gaafii yoo qabatte admin quunnamaa.</p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
