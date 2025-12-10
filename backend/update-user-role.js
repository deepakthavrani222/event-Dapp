const { MongoClient } = require('mongodb');

async function updateUserToAdmin() {
  const client = new MongoClient('mongodb://localhost:27017/ticketdatabase');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ticketdatabase');
    const users = db.collection('users');
    
    // Find the organizer user (assuming it's the most recent one)
    const organizerUser = await users.findOne({ 
      role: 'ORGANIZER' 
    }, { sort: { createdAt: -1 } });
    
    if (organizerUser) {
      console.log('Found organizer user:', organizerUser.email);
      
      // Update to admin role
      const result = await users.updateOne(
        { _id: organizerUser._id },
        { $set: { role: 'ADMIN' } }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ Successfully updated user to ADMIN role');
        console.log('User email:', organizerUser.email);
        console.log('User ID:', organizerUser._id);
      } else {
        console.log('❌ Failed to update user');
      }
    } else {
      console.log('❌ No organizer user found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateUserToAdmin();