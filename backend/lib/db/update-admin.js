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

async function updateAdminRole() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticketdatabase');
    console.log('Connected to MongoDB');

    // Update admin user
    const result = await User.updateOne(
      { email: 'admin@test.com' },
      { $set: { role: 'ADMIN' } }
    );

    console.log('Updated admin user:', result);

    // Show all users
    const users = await User.find({}, 'email role');
    console.log('\nAll users:');
    users.forEach(u => console.log(`  ${u.email}: ${u.role}`));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdminRole();
