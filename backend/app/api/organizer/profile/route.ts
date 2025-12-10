import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import mongoose from 'mongoose';

// Organizer Profile Schema
const OrganizerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  displayName: { type: String, required: true },
  organizationName: { type: String, required: true },
  bio: { type: String },
  profileImage: { type: String },
  socialLinks: {
    instagram: { type: String },
    twitter: { type: String },
    website: { type: String },
  },
  payoutPreferences: {
    method: { type: String, enum: ['bank', 'upi', 'crypto'], default: 'upi' },
    bankAccount: {
      accountNumber: { type: String },
      ifscCode: { type: String },
    },
    upiId: { type: String },
    cryptoWallet: { type: String },
  },
  verification: {
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    socialVerified: { type: Boolean, default: false },
    idVerified: { type: Boolean, default: false },
  },
  onboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OrganizerProfile = mongoose.models.OrganizerProfile || mongoose.model('OrganizerProfile', OrganizerProfileSchema);

/**
 * GET /api/organizer/profile
 * Get organizer profile
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ORGANIZER', 'ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse('Organizer access required');
  }

  try {
    await connectDB();

    const profile = await OrganizerProfile.findOne({ userId: auth.user!.id });

    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: null,
        onboardingRequired: true,
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        displayName: profile.displayName,
        organizationName: profile.organizationName,
        bio: profile.bio,
        profileImage: profile.profileImage,
        socialLinks: profile.socialLinks,
        payoutPreferences: {
          method: profile.payoutPreferences?.method,
          // Don't expose full account details
          hasBank: !!profile.payoutPreferences?.bankAccount?.accountNumber,
          hasUpi: !!profile.payoutPreferences?.upiId,
          hasCrypto: !!profile.payoutPreferences?.cryptoWallet,
        },
        verification: profile.verification,
        onboardingCompleted: profile.onboardingCompleted,
      },
      onboardingRequired: !profile.onboardingCompleted,
    });

  } catch (error: any) {
    console.error('Fetch profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizer/profile
 * Create or update organizer profile
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ORGANIZER', 'ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse('Organizer access required');
  }

  try {
    await connectDB();

    const body = await request.json();
    const {
      displayName,
      organizationName,
      bio,
      profileImage,
      socialLinks,
      payoutPreferences,
      onboardingCompleted,
    } = body;

    // Validate required fields
    if (!displayName || !organizationName) {
      return NextResponse.json(
        { error: 'Display name and organization name are required' },
        { status: 400 }
      );
    }

    // Check if profile exists
    let profile = await OrganizerProfile.findOne({ userId: auth.user!.id });

    if (profile) {
      // Update existing profile
      profile.displayName = displayName;
      profile.organizationName = organizationName;
      profile.bio = bio || profile.bio;
      profile.profileImage = profileImage || profile.profileImage;
      profile.socialLinks = socialLinks || profile.socialLinks;
      profile.payoutPreferences = payoutPreferences || profile.payoutPreferences;
      profile.onboardingCompleted = onboardingCompleted ?? profile.onboardingCompleted;
      profile.updatedAt = new Date();

      // Update verification status based on social links
      if (socialLinks?.instagram || socialLinks?.twitter || socialLinks?.website) {
        profile.verification.socialVerified = true;
      }

      await profile.save();
    } else {
      // Create new profile
      profile = await OrganizerProfile.create({
        userId: auth.user!.id,
        displayName,
        organizationName,
        bio,
        profileImage,
        socialLinks,
        payoutPreferences,
        onboardingCompleted: onboardingCompleted ?? false,
        verification: {
          status: 'pending',
          socialVerified: !!(socialLinks?.instagram || socialLinks?.twitter || socialLinks?.website),
          idVerified: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      profile: {
        displayName: profile.displayName,
        organizationName: profile.organizationName,
        onboardingCompleted: profile.onboardingCompleted,
      },
    });

  } catch (error: any) {
    console.error('Save profile error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', details: error.message },
      { status: 500 }
    );
  }
}
