import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { PlatformSettings, logAuditEvent } from '@/lib/db/models/PlatformSettings';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get platform settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const publicOnly = searchParams.get('public') === 'true';

    // Build query
    const query: any = {};
    if (category) {
      query.category = category;
    }
    if (publicOnly) {
      query.isPublic = true;
    }

    // Get settings
    const settings = await PlatformSettings.find(query)
      .populate('lastModifiedBy', 'name email')
      .sort({ category: 1, key: 1 });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        id: setting._id,
        key: setting.key,
        value: setting.value,
        dataType: setting.dataType,
        description: setting.description,
        isPublic: setting.isPublic,
        lastModifiedBy: setting.lastModifiedBy,
        lastModifiedAt: setting.lastModifiedAt,
        version: setting.version
      });
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      settings: groupedSettings,
      categories: ['general', 'financial', 'features', 'security', 'notifications']
    });

  } catch (error) {
    console.error('Get platform settings error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch settings' 
    }, { status: 500 });
  }
}

// POST - Create or update platform setting
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const {
      category,
      key,
      value,
      dataType,
      description,
      isPublic = false
    } = await request.json();

    // Validate required fields
    if (!category || !key || value === undefined || !dataType || !description) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Check if setting exists
    const existingSetting = await PlatformSettings.findOne({ key });
    
    if (existingSetting) {
      // Update existing setting
      const oldValue = existingSetting.value;
      
      existingSetting.value = value;
      existingSetting.dataType = dataType;
      existingSetting.description = description;
      existingSetting.isPublic = isPublic;
      existingSetting.lastModifiedBy = user._id;
      existingSetting.lastModifiedAt = new Date();
      existingSetting.version += 1;
      
      await existingSetting.save();

      // Log audit event
      await logAuditEvent(
        'UPDATE_SETTING',
        'settings',
        'PlatformSettings',
        user._id.toString(),
        user.email || '',
        user.role,
        {
          before: { key, value: oldValue },
          after: { key, value },
          metadata: { category, dataType }
        },
        existingSetting._id.toString(),
        'medium'
      );

      return NextResponse.json({
        success: true,
        message: 'Setting updated successfully',
        setting: {
          id: existingSetting._id,
          key: existingSetting.key,
          value: existingSetting.value,
          version: existingSetting.version
        }
      });
    } else {
      // Create new setting
      const newSetting = await PlatformSettings.create({
        category,
        key,
        value,
        dataType,
        description,
        isPublic,
        lastModifiedBy: user._id
      });

      // Log audit event
      await logAuditEvent(
        'CREATE_SETTING',
        'settings',
        'PlatformSettings',
        user._id.toString(),
        user.email || '',
        user.role,
        {
          after: { key, value, category, dataType }
        },
        newSetting._id.toString(),
        'medium'
      );

      return NextResponse.json({
        success: true,
        message: 'Setting created successfully',
        setting: {
          id: newSetting._id,
          key: newSetting.key,
          value: newSetting.value,
          version: newSetting.version
        }
      });
    }

  } catch (error) {
    console.error('Create/update platform setting error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save setting' 
    }, { status: 500 });
  }
}