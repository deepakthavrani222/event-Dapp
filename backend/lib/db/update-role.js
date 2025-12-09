const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  phone: String,
  name: String,
  walletAddress: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
});

const User = mongoose.model('User', userSchema);

async function updateUserRole(email, newRole) {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticketdatabase');
    console.log('Connected to MongoDB');

    const result = await User.updateOne(
      { email },
      { $set: { role: newRole } }
    );

    console.log(`Updated ${email} to ${newRole}:`, result);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email and role from command line
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.log('Usage: node update-role.js <email> <role>');
  console.log('Example: node update-role.js organizer@test.com ORGANIZER');
  process.exit(1);
}

updateUserRole(email, role);
