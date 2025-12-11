import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { DataExport, AuditLog, logAuditEvent } from '@/lib/db/models/PlatformSettings';
import { User } from '@/lib/db/models/User';
import { Event } from '@/lib/db/models/Event';
import { Transaction } from '@/lib/db/models/Transaction';
import { Artist } from '@/lib/db/models/Artist';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get export history
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

    // Get export history
    const exports = await DataExport.find({ requestedBy: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      exports: exports.map(exp => ({
        id: exp._id,
        type: exp.type,
        format: exp.format,
        status: exp.status,
        fileName: exp.fileName,
        fileSize: exp.fileSize,
        recordCount: exp.recordCount,
        requestedAt: exp.requestedAt,
        completedAt: exp.completedAt,
        fileUrl: exp.fileUrl,
        errorMessage: exp.errorMessage,
        expiresAt: exp.expiresAt
      }))
    });

  } catch (error) {
    console.error('Get export history error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch export history' 
    }, { status: 500 });
  }
}

// POST - Create new data export
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
      type,
      format = 'csv',
      filters = {},
      includeDeleted = false
    } = await request.json();

    // Validate required fields
    if (!type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Export type is required' 
      }, { status: 400 });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${type}_export_${timestamp}.${format}`;

    // Create export record
    const exportRecord = await DataExport.create({
      type,
      format,
      filters,
      fileName,
      requestedBy: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Start export process (in real app, this would be queued)
    processExport(exportRecord._id.toString(), type, format, filters, includeDeleted);

    // Log audit event
    await logAuditEvent(
      'REQUEST_DATA_EXPORT',
      'admin',
      'DataExport',
      user._id.toString(),
      user.email || '',
      user.role,
      {
        metadata: { type, format, filters }
      },
      exportRecord._id.toString(),
      'medium'
    );

    return NextResponse.json({
      success: true,
      message: 'Export request created successfully',
      exportId: exportRecord._id,
      fileName: exportRecord.fileName,
      status: exportRecord.status
    });

  } catch (error) {
    console.error('Create data export error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create export request' 
    }, { status: 500 });
  }
}

// Helper function to process export (would be moved to background job in production)
async function processExport(
  exportId: string, 
  type: string, 
  format: string, 
  filters: any, 
  includeDeleted: boolean
) {
  try {
    // Update status to processing
    await DataExport.findByIdAndUpdate(exportId, { status: 'processing' });

    let data: any[] = [];
    let recordCount = 0;

    // Fetch data based on type
    switch (type) {
      case 'users':
        data = await User.find(filters).lean();
        break;
      case 'events':
        data = await Event.find(filters).populate('organizerId', 'name email').lean();
        break;
      case 'transactions':
        data = await Transaction.find(filters).populate('buyerId', 'name email').lean();
        break;
      case 'artists':
        data = await Artist.find(filters).populate('userId', 'name email').lean();
        break;
      case 'audit_logs':
        data = await AuditLog.find(filters).lean();
        break;
      case 'all':
        // Export all data types
        const [users, events, transactions, artists, auditLogs] = await Promise.all([
          User.find().lean(),
          Event.find().populate('organizerId', 'name email').lean(),
          Transaction.find().populate('buyerId', 'name email').lean(),
          Artist.find().populate('userId', 'name email').lean(),
          AuditLog.find().lean()
        ]);
        data = { users, events, transactions, artists, auditLogs };
        break;
    }

    recordCount = Array.isArray(data) ? data.length : Object.values(data).reduce((sum, arr) => sum + (arr as any[]).length, 0);

    // In a real application, you would:
    // 1. Convert data to requested format (CSV, JSON, XLSX)
    // 2. Upload file to cloud storage (S3, GCS, etc.)
    // 3. Generate download URL
    
    // For demo, we'll simulate this
    const mockFileUrl = `https://exports.ticketchain.com/${exportId}.${format}`;
    const mockFileSize = recordCount * 100; // Rough estimate

    // Update export record
    await DataExport.findByIdAndUpdate(exportId, {
      status: 'completed',
      fileUrl: mockFileUrl,
      fileSize: mockFileSize,
      recordCount,
      completedAt: new Date()
    });

    console.log(`Export ${exportId} completed: ${recordCount} records`);

  } catch (error) {
    console.error(`Export ${exportId} failed:`, error);
    
    // Update export record with error
    await DataExport.findByIdAndUpdate(exportId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}