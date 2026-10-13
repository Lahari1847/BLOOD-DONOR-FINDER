// Notification Service: In-App Delivery + Resend Email Fallback
// LifeLink – Smart Blood Donor Network

import { prisma } from '../db/client';
import { config } from '../config/env';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'MATCH_ALERT' | 'EMERGENCY' | 'STATUS_UPDATE' | 'REMINDER' | 'INFO';
  data?: Record<string, any>;
  recipientEmail?: string;
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    // 1. Create In-App Notification in DB
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        dataJson: payload.data ? JSON.stringify(payload.data) : null,
      },
    });

    let emailDispatched = false;

    // 2. Real email dispatch via Resend if credentials provided, else safe fallback
    if (config.resendApiKey && payload.recipientEmail) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.resendApiKey}`,
          },
          body: JSON.stringify({
            from: config.emailFrom,
            to: payload.recipientEmail,
            subject: `[LifeLink Alert] ${payload.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
                <h2 style="color: #b91c1c;">LifeLink – Smart Blood Donor Network</h2>
                <div style="padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; margin: 16px 0;">
                  <h3 style="margin: 0 0 8px 0; color: #991b1b;">${payload.title}</h3>
                  <p style="margin: 0; color: #374151; font-size: 15px;">${payload.message}</p>
                </div>
                <p style="color: #6b7280; font-size: 12px;">This is an automated healthcare coordination alert. Do not reply directly.</p>
              </div>
            `,
          }),
        });

        if (response.ok) {
          emailDispatched = true;
          console.log(`[LifeLink Notifications] Email sent to ${payload.recipientEmail} via Resend.`);
        } else {
          console.warn(`[LifeLink Notifications] Resend email rejected: ${response.statusText}`);
        }
      } catch (err) {
        console.error('[LifeLink Notifications] Failed to dispatch via Resend API:', err);
      }
    } else {
      console.log(
        `[LifeLink Notifications] In-app notification recorded for user ${payload.userId} (Email integration: inactive/unconfigured).`
      );
    }

    return {
      success: true,
      notificationId: notification.id,
      emailDispatched,
      channel: emailDispatched ? 'EMAIL_AND_IN_APP' : 'IN_APP',
    };
  } catch (error) {
    console.error('[LifeLink Notifications] Error creating notification:', error);
    return {
      success: false,
      error: 'Failed to create notification',
    };
  }
}
