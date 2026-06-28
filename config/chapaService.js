import axios from "axios";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_BASE_URL = "https://api.chapa.co/v1";

export const initializePayment = async ({
  amount,
  currency = "ETB",
  email,
  firstName,
  lastName,
  txRef,
  callbackUrl,
  returnUrl,
  description,
}) => {
  try {
    // ✅ tx_ref 50 characters hin caalu — short godhi
    const shortTxRef = `BUS-${Date.now()}`.slice(0, 50);

    // ✅ description special characters haqii
    const cleanDescription = description
      .replace(/[^a-zA-Z0-9\-_ .]/g, "")
      .slice(0, 100);

    const payload = {
      amount: String(amount),
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: shortTxRef,
      return_url: returnUrl,
      customization: {
        title: "Bus Station",
        description: "Bus ticket",
      },
    };

    console.log("CHAPA PAYLOAD:", JSON.stringify(payload));

    const response = await axios.post(
      `${CHAPA_BASE_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("CHAPA RESPONSE:", JSON.stringify(response.data));

    // ✅ shortTxRef return godhi — verify irratti barbaachisa
    return { ...response.data, txRef: shortTxRef };

  } catch (err) {
    console.error("CHAPA FULL ERROR:", JSON.stringify(err.response?.data));
    throw new Error(JSON.stringify(err.response?.data) || err.message);
  }
};

export const verifyPayment = async (txRef) => {
  try {
    const response = await axios.get(
      `${CHAPA_BASE_URL}/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("CHAPA VERIFY ERROR:", JSON.stringify(err.response?.data));
    throw new Error(JSON.stringify(err.response?.data) || err.message);
  }
};
