import fetch from "node-fetch";

const AFROMESSAGE_API_URL = "https://api.afromessage.com/api/send";
const API_KEY = process.env.AFROMESSAGE_API_KEY;
const SENDER = process.env.AFROMESSAGE_SENDER || "BusStation";

export const sendSMS = async (to, message) => {
  try {
    const response = await fetch(AFROMESSAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to,
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SMS erguu dadhabe:", data);
      return { success: false, error: data };
    }

    console.log("SMS milkaa'inaan ergame:", to);
    return { success: true, data };
  } catch (error) {
    console.error("SMS Service Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendTicketConfirmationSMS = async (ticket) => {
  const message = `Bus Station System
 Ticket Confirmed!
Route: ${ticket.route}
Seat: ${ticket.seat}
Departure: ${ticket.departure}
Ticket Code: ${ticket.ticketCode}
Amount: ETB ${ticket.amount}`;

  return sendSMS(ticket.phone, message);
};