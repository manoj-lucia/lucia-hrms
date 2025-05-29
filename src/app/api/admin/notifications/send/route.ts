import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole, NotificationTargetType, NotificationStatus } from '@prisma/client';

// POST: Send notification campaign (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    // Protect route - only Super Admin can send campaigns
    const authResult = await protectRoute(request, [UserRole.SUPER_ADMIN]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { campaignId } = await request.json();

        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID is required' },
            { status: 400 }
          );
        }

        // Get the campaign
        const campaign = await prisma.notificationCampaign.findUnique({
          where: { id: campaignId },
          include: {
            deliveries: true
          }
        });

        if (!campaign) {
          return NextResponse.json(
            { error: 'Campaign not found' },
            { status: 404 }
          );
        }

        // Check if campaign is already sent
        if (campaign.status === NotificationStatus.SENT) {
          return NextResponse.json(
            { error: 'Campaign has already been sent' },
            { status: 400 }
          );
        }

        // Get target users based on targetType
        let targetUsers: { id: string }[] = [];

        switch (campaign.targetType) {
          case NotificationTargetType.INDIVIDUAL:
            // Send to specific user by ID
            const user = await prisma.user.findUnique({
              where: { id: campaign.targetValue! },
              select: { id: true }
            });
            if (user) {
              targetUsers = [user];
            }
            break;

          case NotificationTargetType.BRANCH:
            // Send to all users in a branch
            const branchUsers = await prisma.user.findMany({
              where: {
                OR: [
                  {
                    employee: {
                      branch: {
                        OR: [
                          { id: campaign.targetValue! },
                          { name: campaign.targetValue! }
                        ]
                      }
                    }
                  },
                  {
                    branchAdmin: {
                      branch: {
                        OR: [
                          { id: campaign.targetValue! },
                          { name: campaign.targetValue! }
                        ]
                      }
                    }
                  },
                  {
                    branchManager: {
                      branch: {
                        OR: [
                          { id: campaign.targetValue! },
                          { name: campaign.targetValue! }
                        ]
                      }
                    }
                  }
                ]
              },
              select: { id: true }
            });
            targetUsers = branchUsers;
            break;

          case NotificationTargetType.TEAM:
            // Send to all users in a team
            const teamUsers = await prisma.user.findMany({
              where: {
                OR: [
                  {
                    employee: {
                      team: {
                        OR: [
                          { id: campaign.targetValue! },
                          { name: campaign.targetValue! }
                        ]
                      }
                    }
                  },
                  {
                    teamLeader: {
                      teams: {
                        some: {
                          OR: [
                            { id: campaign.targetValue! },
                            { name: campaign.targetValue! }
                          ]
                        }
                      }
                    }
                  }
                ]
              },
              select: { id: true }
            });
            targetUsers = teamUsers;
            break;

          case NotificationTargetType.ROLE:
            // Send to all users with specific role
            const roleUsers = await prisma.user.findMany({
              where: {
                role: campaign.targetValue as UserRole
              },
              select: { id: true }
            });
            targetUsers = roleUsers;
            break;

          case NotificationTargetType.ALL:
            // Send to all users
            const allUsers = await prisma.user.findMany({
              select: { id: true }
            });
            targetUsers = allUsers;
            break;

          default:
            return NextResponse.json(
              { error: 'Invalid target type' },
              { status: 400 }
            );
        }

        if (targetUsers.length === 0) {
          return NextResponse.json(
            { error: 'No target users found' },
            { status: 400 }
          );
        }

        // Create deliveries for all target users
        const deliveryData = targetUsers.map(user => ({
          campaignId: campaign.id,
          userId: user.id,
          isRead: false,
          deliveredAt: new Date()
        }));

        // Use transaction to ensure consistency
        await prisma.$transaction(async (tx) => {
          // Create all deliveries
          await tx.notificationDelivery.createMany({
            data: deliveryData
          });

          // Update campaign status
          await tx.notificationCampaign.update({
            where: { id: campaign.id },
            data: {
              status: NotificationStatus.SENT,
              sentAt: new Date()
            }
          });
        });

        return NextResponse.json({
          message: 'Notification campaign sent successfully',
          stats: {
            targetUsers: targetUsers.length,
            deliveriesCreated: deliveryData.length
          }
        });

      } catch (dbError: any) {
        console.error('Database error in send notifications route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error sending notification campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
