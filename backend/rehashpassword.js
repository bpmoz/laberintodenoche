import bcrypt from "bcrypt";

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password:", hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    return null;
  }
}

// Replace 'your_admin_password' with the actual password from your .env file
hashPassword(process.argv[2]).then(() => {
  process.exit();
});
