const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin123@gmail.com";
  const rawPass = "admin123";
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(rawPass, salt);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      name: "Super Admin",
    },
    create: {
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      name: "Super Admin",
    },
  });

  console.log("SUPER_ADMIN user ready:", admin.email, "Role:", admin.role, "ID:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
