import axios from "axios";

const AFROMESSAGE_API_KEY = process.env.AFROMESSAGE_API_KEY;
const AFROMESSAGE_IDENTIFIER = process.env.AFROMESSAGE_IDENTIFIER;

export const sendTicketSMS = async ({
  phone,
  passengerName,
  ticketCode,
  origin,
  destination,
  seatNumber,
  departureTime,
  price,
}) => {
  // Phone number format — Ethiopia: 09xxxxxxxx → +2519xxxxxxxx
  const formatPhone = (num) => {
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "+251" + cleaned.slice(1);
    if (cleaned.startsWith("251")) return "+" + cleaned;
    return "+" + cleaned;
  };

  const formattedPhone = formatPhone(phone);

  const message =
    `Bus Station System\n` +
    `✅ Ticket Confirmed!\n` +
    `Passenger: ${passengerName}\n` +
    `Route: ${origin} → ${destination}\n` +
    `Seat: ${seatNumber}\n` +
    `Departure: ${new Date(departureTime).toLocaleString()}\n` +
    `Ticket: ${ticketCode}\n` +
    `Amount: ETB ${price}`;

  const response = await axios.get(
    "https://api.afromessage.com/api/send",
    {
      params: {
        from: AFROMESSAGE_IDENTIFIER,
        to: formattedPhone,
        message,
      },
      headers: {
        Authorization: `Bearer ${AFROMESSAGE_API_KEY}`,
      },
    }
  );

  console.log("SMS sent:", response.data);
  return response.data;
};
