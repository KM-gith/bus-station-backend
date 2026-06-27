import axios from "axios";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_BASE_URL = "https://api.chapa.co/v1";

// Payment initialize godhi
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
    const payload = {
      amount: String(amount),
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: "Bus Station System",
        description,
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
    return response.data;

  } catch (err) {
    console.error("CHAPA FULL ERROR:", JSON.stringify(err.response?.data));
    throw new Error(JSON.stringify(err.response?.data) || err.message);
  }
};

// Payment verify godhi
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
