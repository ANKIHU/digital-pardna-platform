import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/db';

// Schema for communication requests
const whatsappMessageSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone number required'),
  messageType: z.enum(['text', 'template', 'media']),
  content: z.string(),
  templateName: z.string().optional(),
  templateVariables: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional()
});

const smsSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  message: z.string().max(160),
  sender: z.string().optional()
});

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  content: z.string(),
  isHtml: z.boolean().default(false),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional()
});

const notificationSchema = z.object({
  userId: z.string(),
  type: z.enum(['payment_due', 'payment_received', 'round_started', 'payout_ready', 'kyc_required', 'compliance_alert']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  channels: z.array(z.enum(['whatsapp', 'sms', 'email', 'push'])),
  data: z.record(z.any()).optional()
});

const communicationRoutes: FastifyPluginAsync = async (app) => {

  // WhatsApp Business API Integration
  app.register(async function(app) {
    const WHATSAPP_API_BASE = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com/v18.0';
    const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    // Send WhatsApp Message
    app.post('/communication/whatsapp/send', async (req, reply) => {
      try {
        const { to, messageType, content, templateName, templateVariables, mediaUrl } = 
          whatsappMessageSchema.parse(req.body);

        let messageData: any = {
          messaging_product: 'whatsapp',
          to: to.replace(/\+/, ''), // Remove + prefix
          type: messageType
        };

        switch (messageType) {
          case 'text':
            messageData.text = { body: content };
            break;
          
          case 'template':
            if (!templateName) {
              throw new Error('Template name required for template messages');
            }
            messageData.template = {
              name: templateName,
              language: { code: 'en' },
              components: templateVariables ? [{
                type: 'body',
                parameters: templateVariables.map(variable => ({
                  type: 'text',
                  text: variable
                }))
              }] : []
            };
            break;
          
          case 'media':
            if (!mediaUrl) {
              throw new Error('Media URL required for media messages');
            }
            messageData.image = { link: mediaUrl };
            break;
        }

        const response = await fetch(`${WHATSAPP_API_BASE}/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`WhatsApp send failed: ${errorData.error?.message || response.statusText}`);
        }

        const responseData = await response.json();

        // Store message record
        const messageRecord = await prisma.communicationLog.create({
          data: {
            channel: 'whatsapp',
            recipient: to,
            message_type: messageType,
            content,
            status: 'sent',
            external_id: responseData.messages[0].id,
            sent_at: new Date(),
            created_at: new Date()
          }
        });

        return {
          success: true,
          messageId: messageRecord.id,
          whatsappId: responseData.messages[0].id,
          to,
          messageType,
          status: 'sent'
        };

      } catch (error) {
        app.log.error('WhatsApp send failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'WhatsApp send failed'
        });
      }
    });

    // WhatsApp Webhook for delivery status
    app.post('/communication/whatsapp/webhook', async (req, reply) => {
      try {
        const { entry } = req.body;

        for (const change of entry?.[0]?.changes || []) {
          if (change.field === 'messages') {
            const { statuses, messages } = change.value;

            // Handle delivery status updates
            if (statuses) {
              for (const status of statuses) {
                await prisma.communicationLog.updateMany({
                  where: { external_id: status.id },
                  data: {
                    status: status.status,
                    updated_at: new Date()
                  }
                });
              }
            }

            // Handle incoming messages
            if (messages) {
              for (const message of messages) {
                // Store incoming message
                await prisma.communicationLog.create({
                  data: {
                    channel: 'whatsapp',
                    direction: 'inbound',
                    sender: message.from,
                    message_type: message.type,
                    content: message.text?.body || message.caption || '',
                    external_id: message.id,
                    received_at: new Date(),
                    created_at: new Date()
                  }
                });

                // Auto-respond with help message
                await sendWhatsAppAutoReply(message.from, message.text?.body);
              }
            }
          }
        }

        return { success: true };

      } catch (error) {
        app.log.error('WhatsApp webhook processing failed:', error);
        return reply.status(500).send({ success: false });
      }
    });

    // WhatsApp webhook verification
    app.get('/communication/whatsapp/webhook', async (req, reply) => {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        return reply.send(challenge);
      } else {
        return reply.status(403).send('Forbidden');
      }
    });

    // Auto-reply helper
    async function sendWhatsAppAutoReply(phoneNumber: string, incomingMessage: string) {
      const lowerMessage = incomingMessage?.toLowerCase() || '';
      let replyMessage = '';

      if (lowerMessage.includes('balance')) {
        replyMessage = 'To check your balance, please log into the Digital Pardna app or visit our website.';
      } else if (lowerMessage.includes('payment')) {
        replyMessage = 'For payment assistance, please contact our support team or use the app payment feature.';
      } else if (lowerMessage.includes('help')) {
        replyMessage = 'Welcome to Digital Pardna! 🏦\n\nI can help you with:\n• Account balance inquiries\n• Payment information\n• Circle updates\n\nType your question or visit our app for full features.';
      } else {
        replyMessage = 'Thank you for contacting Digital Pardna! Our team will respond shortly. For immediate assistance, please use our mobile app.';
      }

      try {
        await fetch(`${WHATSAPP_API_BASE}/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: { body: replyMessage }
          })
        });
      } catch (error) {
        app.log.error('WhatsApp auto-reply failed:', error);
      }
    }

  }, { prefix: '/whatsapp' });

  // SMS Integration (using Twilio)
  app.register(async function(app) {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

    // Send SMS
    app.post('/communication/sms/send', async (req, reply) => {
      try {
        const { to, message, sender } = smsSchema.parse(req.body);

        const smsData = new URLSearchParams({
          To: to,
          From: sender || TWILIO_PHONE_NUMBER || '',
          Body: message
        });

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: smsData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`SMS send failed: ${errorData.message || response.statusText}`);
        }

        const responseData = await response.json();

        // Store SMS record
        const smsRecord = await prisma.communicationLog.create({
          data: {
            channel: 'sms',
            recipient: to,
            message_type: 'text',
            content: message,
            status: responseData.status,
            external_id: responseData.sid,
            sent_at: new Date(),
            created_at: new Date()
          }
        });

        return {
          success: true,
          messageId: smsRecord.id,
          twilioSid: responseData.sid,
          to,
          message,
          status: responseData.status
        };

      } catch (error) {
        app.log.error('SMS send failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'SMS send failed'
        });
      }
    });

    // SMS Delivery Status Webhook
    app.post('/communication/sms/webhook', async (req, reply) => {
      try {
        const { MessageSid, MessageStatus } = req.body;

        await prisma.communicationLog.updateMany({
          where: { external_id: MessageSid },
          data: {
            status: MessageStatus,
            updated_at: new Date()
          }
        });

        return { success: true };

      } catch (error) {
        app.log.error('SMS webhook processing failed:', error);
        return reply.status(500).send({ success: false });
      }
    });

  }, { prefix: '/sms' });

  // Email Integration (using SendGrid)
  app.register(async function(app) {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@digitalpardna.com';

    // Send Email
    app.post('/communication/email/send', async (req, reply) => {
      try {
        const { to, subject, content, isHtml, cc, bcc } = emailSchema.parse(req.body);

        const emailData = {
          personalizations: [{
            to: [{ email: to }],
            ...(cc && { cc: cc.map(email => ({ email })) }),
            ...(bcc && { bcc: bcc.map(email => ({ email })) })
          }],
          from: { email: FROM_EMAIL, name: 'Digital Pardna' },
          subject,
          content: [{
            type: isHtml ? 'text/html' : 'text/plain',
            value: content
          }]
        };

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Email send failed: ${errorData.errors?.[0]?.message || response.statusText}`);
        }

        // Store email record
        const emailRecord = await prisma.communicationLog.create({
          data: {
            channel: 'email',
            recipient: to,
            message_type: 'email',
            subject,
            content,
            status: 'sent',
            sent_at: new Date(),
            created_at: new Date()
          }
        });

        return {
          success: true,
          messageId: emailRecord.id,
          to,
          subject,
          status: 'sent'
        };

      } catch (error) {
        app.log.error('Email send failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Email send failed'
        });
      }
    });

    // Email Event Webhook (delivery, open, click tracking)
    app.post('/communication/email/webhook', async (req, reply) => {
      try {
        const events = req.body;

        for (const event of events) {
          await prisma.communicationLog.updateMany({
            where: { 
              recipient: event.email,
              channel: 'email',
              sent_at: { gte: new Date(event.timestamp * 1000 - 60000) } // Within last minute
            },
            data: {
              status: event.event,
              updated_at: new Date()
            }
          });
        }

        return { success: true };

      } catch (error) {
        app.log.error('Email webhook processing failed:', error);
        return reply.status(500).send({ success: false });
      }
    });

  }, { prefix: '/email' });

  // Unified Notification System
  app.post('/communication/notify', async (req, reply) => {
    try {
      const { userId, type, priority, channels, data } = notificationSchema.parse(req.body);

      // Get user communication preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { communicationPreferences: true }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }

      const results = [];

      // Generate message content based on notification type
      const messageContent = generateNotificationContent(type, data, user);

      // Send notifications on requested channels
      for (const channel of channels) {
        try {
          let result;

          switch (channel) {
            case 'whatsapp':
              if (user.phone_number) {
                result = await sendWhatsAppNotification(user.phone_number, messageContent);
              }
              break;
            
            case 'sms':
              if (user.phone_number) {
                result = await sendSmsNotification(user.phone_number, messageContent.sms);
              }
              break;
            
            case 'email':
              if (user.email) {
                result = await sendEmailNotification(user.email, messageContent);
              }
              break;
            
            case 'push':
              // Implement push notification logic here
              result = { success: true, message: 'Push notification queued' };
              break;
          }

          results.push({ channel, success: result?.success || false, ...result });

        } catch (channelError) {
          app.log.error(`Notification failed for channel ${channel}:`, channelError);
          results.push({ 
            channel, 
            success: false, 
            error: channelError instanceof Error ? channelError.message : 'Channel failed' 
          });
        }
      }

      // Store notification record
      const notificationRecord = await prisma.notification.create({
        data: {
          user_id: userId,
          type,
          priority,
          channels: channels.join(','),
          content: JSON.stringify(messageContent),
          status: results.some(r => r.success) ? 'sent' : 'failed',
          sent_at: new Date(),
          created_at: new Date()
        }
      });

      return {
        success: true,
        notificationId: notificationRecord.id,
        userId,
        type,
        priority,
        results
      };

    } catch (error) {
      app.log.error('Unified notification failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Notification failed'
      });
    }
  });

  // Generate notification content based on type
  function generateNotificationContent(type: string, data: any, user: any) {
    const firstName = user.first_name || 'Member';

    switch (type) {
      case 'payment_due':
        return {
          whatsapp: `Hi ${firstName}! 💰 Your pardna payment of $${data.amount} ${data.currency} is due on ${data.dueDate}. Pay now in the app to stay current.`,
          sms: `Digital Pardna: Payment of $${data.amount} ${data.currency} due ${data.dueDate}. Pay in app.`,
          email: {
            subject: 'Payment Due - Digital Pardna',
            content: `Hi ${firstName},\n\nYour pardna payment of $${data.amount} ${data.currency} is due on ${data.dueDate}.\n\nPlease log into the app to make your payment.\n\nBest regards,\nDigital Pardna Team`
          }
        };

      case 'payment_received':
        return {
          whatsapp: `✅ Payment received! Thanks ${firstName}, your $${data.amount} ${data.currency} payment has been processed successfully.`,
          sms: `Digital Pardna: Payment of $${data.amount} ${data.currency} received. Thank you!`,
          email: {
            subject: 'Payment Received - Digital Pardna',
            content: `Hi ${firstName},\n\nWe've successfully received your payment of $${data.amount} ${data.currency}.\n\nTransaction ID: ${data.transactionId}\n\nThank you for staying current with your pardna circle!\n\nBest regards,\nDigital Pardna Team`
          }
        };

      case 'payout_ready':
        return {
          whatsapp: `🎉 Great news ${firstName}! Your payout of $${data.amount} ${data.currency} is ready. Check the app to collect your hand!`,
          sms: `Digital Pardna: Your payout of $${data.amount} ${data.currency} is ready! Check app.`,
          email: {
            subject: 'Payout Ready - Digital Pardna',
            content: `Hi ${firstName},\n\nExciting news! Your payout of $${data.amount} ${data.currency} is ready for collection.\n\nPlease log into the app to receive your hand.\n\nBest regards,\nDigital Pardna Team`
          }
        };

      default:
        return {
          whatsapp: `Hi ${firstName}, you have a new notification from Digital Pardna. Check the app for details.`,
          sms: `Digital Pardna: New notification. Check app for details.`,
          email: {
            subject: 'New Notification - Digital Pardna',
            content: `Hi ${firstName},\n\nYou have a new notification. Please log into the app for details.\n\nBest regards,\nDigital Pardna Team`
          }
        };
    }
  }

  // Helper functions for sending notifications
  async function sendWhatsAppNotification(phoneNumber: string, content: string) {
    // Implementation would call the WhatsApp send endpoint
    return { success: true, messageId: 'whatsapp-' + crypto.randomUUID() };
  }

  async function sendSmsNotification(phoneNumber: string, content: string) {
    // Implementation would call the SMS send endpoint
    return { success: true, messageId: 'sms-' + crypto.randomUUID() };
  }

  async function sendEmailNotification(email: string, content: any) {
    // Implementation would call the email send endpoint
    return { success: true, messageId: 'email-' + crypto.randomUUID() };
  }

  // Communication Analytics
  app.get('/communication/analytics', async (req, reply) => {
    try {
      const [channelStats, recentLogs] = await Promise.all([
        prisma.communicationLog.groupBy({
          by: ['channel', 'status'],
          where: {
            created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          _count: { id: true }
        }),
        prisma.communicationLog.findMany({
          orderBy: { created_at: 'desc' },
          take: 50
        })
      ]);

      return {
        success: true,
        analytics: {
          channelStats: channelStats.map(stat => ({
            channel: stat.channel,
            status: stat.status,
            count: stat._count.id
          })),
          totalMessages: channelStats.reduce((sum, stat) => sum + stat._count.id, 0),
          recentActivity: recentLogs.map(log => ({
            id: log.id,
            channel: log.channel,
            recipient: log.recipient,
            status: log.status,
            sentAt: log.sent_at
          }))
        }
      };

    } catch (error) {
      app.log.error('Communication analytics failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Analytics failed'
      });
    }
  });

};

export default communicationRoutes;