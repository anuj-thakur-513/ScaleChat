const { PrismaClient } = require("@prisma/client");

const prismaClient = new PrismaClient({
  log: ["query", "error", "warn"],
});

module.exports = { prismaClient };
