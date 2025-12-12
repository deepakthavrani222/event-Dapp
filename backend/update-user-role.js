const mongoose = require('mongoose');
require('dotenv').config();

async function updateUserRole() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n=== All Users ===');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name || 'No name'} (${u.email}) - Role: ${u.role}`);
    });

    // Get email from command line argument
    const email = process.argv[2];
    const newRole = process.argv[3];

    if (!email || !newRole) {
      console.log('\n\nUsage: node update-user-role.js <email> <role>');
      console.log('Available roles: BUYER, ORGANIZER, ARTIST, ADMIN, PROMOTER, VENUE_OWNER, INSPECTOR');
      console.log('\nExample: node update-user-role.js user@example.com ARTIST');
      await mongoose.disconnect();
      return;
    }

    // Update user role
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: email },
      { $set: { role: newRole.toUpperCase() } }
    );

    if (result.matchedCount > 0) {
      console.log(`\n✅ Updated ${email} to role: ${newRole.toUpperCase()}`);
    } else {
      console.log(`\n❌ User with email ${email} not found`);
    }

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserRole();
