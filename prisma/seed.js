import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin already exists
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@lapidar.com.br" },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Henriquearena1@", 10);

      const admin = await prisma.user.create({
        data: {
          name: "Henrique Torres",
          email: "admin@lapidar.com.br",
          password: hashedPassword,
          role: "admin",
        },
      });

      console.log("✓ Admin user created successfully");
      console.log(`  Email: admin@lapidar.com.br`);
      console.log(`  Password: Henriquearena1@`);
      console.log(`  ⚠️  Change this password after first login!`);
    } else {
      console.log("✓ Admin user already exists");
    }

    // Seed health plans
    const defaultPlans = [
      "Ipasgo",
      "Iamesc",
      "Saúde Caixa",
      "Casembrapa",
      "Geap Saúde",
    ];

    for (const planName of defaultPlans) {
      const exists = await prisma.healthPlan.findUnique({
        where: { name: planName },
      });

      if (!exists) {
        await prisma.healthPlan.create({
          data: { name: planName },
        });
        console.log(`✓ Health plan created: ${planName}`);
      } else {
        console.log(`✓ Health plan already exists: ${planName}`);
      }
    }
  } catch (e) {
    console.error("Error seeding database:", e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main();
