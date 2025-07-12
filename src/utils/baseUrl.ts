const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

export default baseUrl;
