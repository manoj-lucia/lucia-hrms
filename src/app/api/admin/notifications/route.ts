import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole, NotificationTargetType, NotificationPriority, NotificationStatus } from '@prisma/client';

// GET: Fetch notification campaigns (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    // Protect route - only Super Admin can access
    const authResult = await protectRoute(request, [UserRole.SUPER_ADMIN]);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') as NotificationStatus | null;

        // Build where clause
        const whereClause: any = {};
        if (status) {
          whereClause.status = status;
        }

        // Fetch campaigns with delivery statistics
        const campaigns = await prisma.notificationCampaign.findMany({
          where: whereClause,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            deliveries: {
              select: {
                id: true,
                isRead: true,
                readAt: true,
                deliveredAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        });

        // Calculate statistics for each campaign
        const campaignsWithStats = campaigns.map(campaign => ({
          id: campaign.id,
          title: campaign.title,
          message: campaign.message,
          priority: campaign.priority,
          status: campaign.status,
          targetType: campaign.targetType,
          targetValue: campaign.targetValue,
          scheduledAt: campaign.scheduledAt,
          sentAt: campaign.sentAt,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
          createdBy: campaign.createdBy,
          stats: {
            totalDeliveries: campaign.deliveries.length,
            readCount: campaign.deliveries.filter(d => d.isRead).length,
            unreadCount: campaign.deliveries.filter(d => !d.isRead).length,
            readRate: campaign.deliveries.length > 0 
              ? Math.round((campaign.deliveries.filter(d => d.isRead).length / campaign.deliveries.length) * 100)
              : 0
          }
        }));

        // Get total count for pagination
        const totalCount = await prisma.notificationCampaign.count({
          where: whereClause
        });

        return NextResponse.json({
          campaigns: campaignsWithStats,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount
          }
        });

      } catch (dbError: any) {
        console.error('Database error in admin notifications GET route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching notification campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create notification campaign (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    // Protect route - only Super Admin can create campaigns
    const authResult = await protectRoute(request, [UserRole.SUPER_ADMIN]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const data = await request.json();
        const { 
          title, 
          message, 
          priority = NotificationPriority.MEDIUM,
          targetType, 
          targetValue,
          scheduledAt 
        } = data;

        // Validate required fields
        if (!title || !message || !targetType) {
          return NextResponse.json(
            { error: 'Missing required fields: title, message, targetType' },
            { status: 400 }
          );
        }

        // Validate targetValue based on targetType
        if (targetType !== NotificationTargetType.ALL && !targetValue) {
          return NextResponse.json(
            { error: 'targetValue is required for non-ALL target types' },
            { status: 400 }
          );
        }

        // Create the campaign
        const campaign = await prisma.notificationCampaign.create({
          data: {
            title,
            message,
            priority,
            targetType,
            targetValue,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            status: scheduledAt ? NotificationStatus.SCHEDULED : NotificationStatus.DRAFT,
            createdById: authResult.id
          },
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });

        // If not scheduled, send immediately
        if (!scheduledAt) {
          // We'll implement the sending logic in the next step
          // For now, just mark as sent
          await prisma.notificationCampaign.update({
            where: { id: campaign.id },
            data: { 
              status: NotificationStatus.SENT,
              sentAt: new Date()
            }
          });
        }

        return NextResponse.json({
          message: 'Notification campaign created successfully',
          campaign
        });

      } catch (dbError: any) {
        console.error('Database error in admin notifications POST route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error creating notification campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
