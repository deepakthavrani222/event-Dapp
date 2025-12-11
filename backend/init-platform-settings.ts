import mongoose from 'mongoose';
import { config } from 'dotenv';
import { PlatformSettings, AdminUser } from './lib/db/models/PlatformSettings';
import { User } from './lib/db/models/User';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketchain';

async function initializePlatformSettings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create default platform settings
    const defaultSettings = [
      // Financial Settings
      {
        category: 'financial',
        key: 'platform.fee.percentage',
        value: 10,
        dataType: 'number',
        description: 'Platform fee percentage (default 10%)',
        isPublic: true
      },
      {
        category: 'financial',
        key: 'artist.royalty.default',
        value: 15,
        dataType: 'number',
        description: 'Default artist royalty percentage',
        isPublic: true
      },
      {
        category: 'financial',
        key: 'artist.royalty.max',
        value: 25,
        dataType: 'number',
        description: 'Maximum artist royalty percentage',
        isPublic: true
      },
      {
        category: 'financial',
        key: 'withdrawal.minimum',
        value: 50,
        dataType: 'number',
        description: 'Minimum withdrawal amount in rupees',
        isPublic: true
      },
      {
        category: 'financial',
        key: 'golden_ticket.royalty_bonus.max',
        value: 10,
        dataType: 'number',
        description: 'Maximum additional royalty bonus for golden tickets (%)',
        isPublic: true
      },

      // Feature Settings
      {
        category: 'features',
        key: 'features.golden_tickets.enabled',
        value: true,
        dataType: 'boolean',
        description: 'Enable golden NFT tickets for verified artists',
        isPublic: true
      },
      {
        category: 'features',
        key: 'features.soulbound_tickets.enabled',
        value: true,
        dataType: 'boolean',
        description: 'Enable non-transferable soulbound tickets',
        isPublic: true
      },
      {
        category: 'features',
        key: 'features.fan_messaging.enabled',
        value: true,
        dataType: 'boolean',
        description: 'Enable direct artist-to-fan messaging',
        isPublic: true
      },
      {
        category: 'features',
        key: 'features.resale_marketplace.enabled',
        value: true,
        dataType: 'boolean',
        description: 'Enable ticket resale marketplace',
        isPublic: true
      },
      {
        category: 'features',
        key: 'features.auto_approve_small_events',
        value: true,
        dataType: 'boolean',
        description: 'Auto-approve events with less than 100 tickets',
        isPublic: false
      },

      // General Settings
      {
        category: 'general',
        key: 'platform.name',
        value: 'TicketChain',
        dataType: 'string',
        description: 'Platform name',
        isPublic: true
      },
      {
        category: 'general',
        key: 'platform.currency',
        value: 'INR',
        dataType: 'string',
        description: 'Platform currency',
        isPublic: true
      },
      {
        category: 'general',
        key: 'events.auto_approve_threshold',
        value: 100,
        dataType: 'number',
        description: 'Auto-approve events with tickets below this number',
        isPublic: false
      },
      {
        category: 'general',
        key: 'artist.verification.fast_track_followers',
        value: 50000,
        dataType: 'number',
        description: 'Follower count for fast-track artist verification',
        isPublic: false
      },

      // Security Settings
      {
        category: 'security',
        key: 'security.max_login_attempts',
        value: 5,
        dataType: 'number',
        description: 'Maximum login attempts before account lockout',
        isPublic: false
      },
      {
        category: 'security',
        key: 'security.session_timeout',
        value: 24,
        dataType: 'number',
        description: 'Session timeout in hours',
        isPublic: false
      },
      {
        category: 'security',
        key: 'security.require_2fa_for_admins',
        value: true,
        dataType: 'boolean',
        description: 'Require 2FA for admin accounts',
        isPublic: false
      },

      // Notification Settings
      {
        category: 'notifications',
        key: 'notifications.email.enabled',
        value: true,
        dataType: 'boolean',
        description: 'Enable email notifications',
        isPublic: true
      },
      {
        category: 'notifications',
        key: 'notifications.push.enabled',
        value: true,
        dataType: 'boolean',
        description: 'Enable push notifications',
        isPublic: true
      },
      {
        category: 'notifications',
        key: 'notifications.daily_revenue_celebration_threshold',
        value: 100000,
        dataType: 'number',
        description: 'Daily revenue threshold for celebration (₹1L)',
        isPublic: false
      }
    ];

    // Create super admin user if it doesn't exist
    let superAdminUser = await User.findOne({ email: 'admin@ticketchain.com' });
    if (!superAdminUser) {
      superAdminUser = await User.create({
        email: 'admin@ticketchain.com',
        name: 'Super Admin',
        role: 'ADMIN',
        walletAddress: '0x0000000000000000000000000000000000000001'
      });
      console.log('Created super admin user');
    }

    // Create admin user record
    const existingAdminUser = await AdminUser.findOne({ userId: superAdminUser._id });
    if (!existingAdminUser) {
      await AdminUser.create({
        userId: superAdminUser._id,
        email: superAdminUser.email,
        walletAddress: superAdminUser.walletAddress,
        role: 'super_admin',
        permissions: ['*'], // All permissions
        addedBy: superAdminUser._id
      });
      console.log('Created admin user record');
    }

    // Insert default settings
    for (const setting of defaultSettings) {
      const existingSetting = await PlatformSettings.findOne({ key: setting.key });
      if (!existingSetting) {
        await PlatformSettings.create({
          ...setting,
          lastModifiedBy: superAdminUser._id
        });
        console.log(`Created setting: ${setting.key}`);
      } else {
        console.log(`Setting already exists: ${setting.key}`);
      }
    }

    console.log('Platform settings initialization completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error initializing platform settings:', error);
    process.exit(1);
  }
}

initializePlatformSettings();