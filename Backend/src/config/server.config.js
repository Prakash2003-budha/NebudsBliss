const parsePort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : 9005;
};

export const SERVER_CONFIG = {
  host: process.env.HOST || "0.0.0.0",
  port: parsePort(process.env.PORT),
};
