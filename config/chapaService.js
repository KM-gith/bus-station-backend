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
  const response = await axios.post(
    `${CHAPA_BASE_URL}/transaction/initialize`,
    {
      amount,
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      description,
    },
    {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Payment verify godhi
export const verifyPayment = async (txRef) => {
  const response = await axios.get(
    `${CHAPA_BASE_URL}/transaction/verify/${txRef}`,
    {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      },
    }
  );
  return response.data;
};
