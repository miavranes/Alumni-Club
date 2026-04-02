import { registerUser } from "../services/auth.service";

async function createAdminUser() {
  console.log("👑 Creating Admin User...\n");

  const adminUser = {
    username: "zana.knezevic", // ili 'superadmin' - izaberite jedinstven username
    email: "fit.alumni.club@gmail.com", // promenite na vaš email
    password: "admin123", // promenite na jaku šifru
    firstName: "Zana",
    lastName: "Knezevic",
    enrollmentYear: 2025, // ili godina kada ste diplomirali
    role: "admin", // eksplicitno postavljamo admin role
    occupation: "",
  };

  try {
    console.log("Creating admin user with following data:");
    console.log("📧 Email:", adminUser.email);
    console.log("👤 Username:", adminUser.username);
    console.log("🎓 Enrollment Year:", adminUser.enrollmentYear);
    console.log("🔑 Role:", adminUser.role);
    console.log("");

    // Kreiranje admin usera
    const admin = await registerUser(adminUser);

    console.log("✅ ADMIN USER CREATED SUCCESSFULLY!");
    console.log("====================================");
    console.log("👑 User ID:", admin.id);
    console.log("📧 Email:", admin.email);
    console.log("👤 Username:", admin.username);
    console.log("🔑 Role:", admin.role);
    console.log("🆔 Status:", admin.is_active ? "Active" : "Inactive");
    console.log("📅 Created:", admin.created_at);
    console.log("");
    console.log("💡 IMPORTANT: Save these credentials securely!");
    console.log("🔐 Password:", adminUser.password);
    console.log("");
    console.log("🚀 You can now use this admin account to manage the system.");
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ Admin user already exists!");
      console.error(
        "   Either change the email/username or delete the existing user.",
      );
    } else {
      console.error("❌ Error creating admin user:", error.message);
    }
    process.exit(1);
  }
}

// Pokreni skriptu
if (require.main === module) {
  createAdminUser();
}

export { createAdminUser };
