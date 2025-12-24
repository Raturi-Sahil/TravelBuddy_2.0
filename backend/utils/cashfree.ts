export const getCashfreeConfig = () => {
  const CF_APP_ID = process.env.CASHFREE_APP_ID!;
  const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
  const CF_ENV = process.env.CASHFREE_ENV || "TEST"; // TEST | PROD

  const BASE_URL =
    CF_ENV === "PROD"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

  return {
    CF_APP_ID,
    CF_SECRET_KEY,
    BASE_URL,
  };
};
