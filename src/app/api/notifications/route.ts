import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';

// GET: Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    // Protect route - authenticated users can access their notifications
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        // Build where clause
        const whereClause: any = {
          userId: authResult.id
        };

        if (unreadOnly) {
          whereClause.isRead = false;
        }

        // Fetch user's notification deliveries
        const notifications = await prisma.notificationDelivery.findMany({
          where: whereClause,
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                message: true,
                priority: true,
                createdAt: true,
                createdBy: {
                  select: {
                    firstName: true,
                    lastName: true,
                    role: true
                  }
                }
              }
            }
          },
          orderBy: {
            deliveredAt: 'desc'
          },
          take: limit,
          skip: offset
        });

        // Format notifications for frontend
        const formattedNotifications = notifications.map(notification => ({
          id: notification.id,
          title: notification.campaign.title,
          message: notification.campaign.message,
          priority: notification.campaign.priority,
          isRead: notification.isRead,
          readAt: notification.readAt,
          deliveredAt: notification.deliveredAt,
          createdAt: notification.campaign.createdAt,
          sender: {
            name: `${notification.campaign.createdBy.firstName} ${notification.campaign.createdBy.lastName}`,
            role: notification.campaign.createdBy.role
          }
        }));

        // Get total count for pagination
        const totalCount = await prisma.notificationDelivery.count({
          where: whereClause
        });

        // Get unread count
        const unreadCount = await prisma.notificationDelivery.count({
          where: {
            userId: authResult.id,
            isRead: false
          }
        });

        return NextResponse.json({
          notifications: formattedNotifications,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount
          },
          unreadCount
        });

      } catch (dbError: any) {
        console.error('Database error in notifications GET route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    // Protect route - authenticated users can mark their notifications as read
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { notificationId, markAllAsRead } = await request.json();

        if (markAllAsRead) {
          // Mark all user's notifications as read
          await prisma.notificationDelivery.updateMany({
            where: {
              userId: authResult.id,
              isRead: false
            },
            data: {
              isRead: true,
              readAt: new Date()
            }
          });

          return NextResponse.json({
            message: 'All notifications marked as read'
          });
        } else {
          // Mark specific notification as read
          if (!notificationId) {
            return NextResponse.json(
              { error: 'Notification ID is required' },
              { status: 400 }
            );
          }

          // Verify the notification belongs to the user
          const notification = await prisma.notificationDelivery.findFirst({
            where: {
              id: notificationId,
              userId: authResult.id
            }
          });

          if (!notification) {
            return NextResponse.json(
              { error: 'Notification not found' },
              { status: 404 }
            );
          }

          // Mark as read
          await prisma.notificationDelivery.update({
            where: { id: notificationId },
            data: {
              isRead: true,
              readAt: new Date()
            }
          });

          return NextResponse.json({
            message: 'Notification marked as read'
          });
        }

      } catch (dbError: any) {
        console.error('Database error in notifications PATCH route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
