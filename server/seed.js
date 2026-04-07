import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Chat from './models/Chat.model.js';
import Message from './models/Message.model.js';
import Status from './models/Status.model.js';
import Call from './models/Call.model.js';
import Label from './models/Label.model.js';
import QuickReply from './models/QuickReply.model.js';
import Catalog from './models/Catalog.model.js';
import Admin from './models/Admin.model.js';
import logger from './utils/logger.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    logger.success('Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Chat.deleteMany({}), Message.deleteMany({}),
      Status.deleteMany({}), Call.deleteMany({}), Label.deleteMany({}),
      QuickReply.deleteMany({}), Catalog.deleteMany({}), Admin.deleteMany({})
    ]);
    logger.info('Cleared existing data');

    // Create admin
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await User.create({
      name: 'Admin', email: 'admin@demo.com', password: adminPassword,
      role: 'admin', isVerified: true, avatar: '',
      about: 'System Administrator'
    });

    // Create 10 regular users
    const userPassword = await bcrypt.hash('User@123', 12);
    const users = [];
    const names = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Ross', 'Edward Norton',
      'Fiona Apple', 'George Lucas', 'Hannah Montana', 'Ivan Drago', 'Julia Roberts'];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        name: names[i], email: `user${i + 1}@demo.com`, password: userPassword,
        isVerified: true, about: `Hi, I'm ${names[i]}!`,
        isOnline: i < 3 // First 3 users show as online
      });
      users.push(user);
    }
    logger.success(`Created admin + ${users.length} users`);

    // Create private chats between first few users
    const privateChats = [];
    for (let i = 0; i < 5; i++) {
      const chat = await Chat.create({
        type: 'private',
        participants: [users[i]._id, users[(i + 1) % 10]._id]
      });
      privateChats.push(chat);
    }

    // Create group chats
    const groupChats = [];
    const groupNames = ['Project Team', 'Friends Group', 'Study Group', 'Gaming Squad', 'Book Club'];
    for (let i = 0; i < 5; i++) {
      const memberIds = users.slice(0, 4 + i).map(u => u._id);
      const chat = await Chat.create({
        type: 'group',
        participants: [admin._id, ...memberIds],
        groupInfo: {
          name: groupNames[i],
          description: `Welcome to ${groupNames[i]}!`,
          admins: [admin._id, users[0]._id],
          superAdmin: admin._id,
          inviteLink: `invite_${i}_${Date.now()}`
        }
      });
      groupChats.push(chat);
    }

    // Create sample messages for each chat
    const sampleTexts = [
      'Hey! How are you?', 'I\'m doing great, thanks!', 'Want to grab coffee later?',
      'Sure, that sounds awesome!', 'See you at 5pm then 😊', 'Perfect! 👍',
      'Did you see the news today?', 'Yeah, it was wild!', 'Check out this link',
      'That\'s really interesting!', 'Let me know what you think', 'Will do!',
      'Good morning everyone! ☀️', 'Happy Monday! 🎉', 'Who\'s up for lunch?',
    ];

    for (const chat of [...privateChats, ...groupChats]) {
      const participants = chat.participants;
      const messages = [];
      for (let j = 0; j < 50; j++) {
        const sender = participants[j % participants.length];
        const msg = await Message.create({
          chat: chat._id,
          sender,
          type: 'text',
          content: sampleTexts[j % sampleTexts.length],
          createdAt: new Date(Date.now() - (50 - j) * 60000)
        });
        messages.push(msg);
      }
      await Chat.findByIdAndUpdate(chat._id, { lastMessage: messages[messages.length - 1]._id });
    }
    logger.success('Created sample messages');

    // Create sample statuses
    const statusTexts = ['Having a great day! 🌟', 'Working on something cool 💻', 'Weekend vibes 🏖️'];
    const backgrounds = ['#128C7E', '#25D366', '#075E54', '#DCF8C6'];
    for (let i = 0; i < 3; i++) {
      await Status.create({
        user: users[i]._id, type: 'text', content: statusTexts[i],
        background: backgrounds[i], font: 'sans-serif'
      });
    }
    logger.success('Created sample statuses');

    // Create call history
    for (let i = 0; i < 10; i++) {
      const callTypes = ['audio', 'video'];
      const callStatuses = ['ended', 'missed', 'rejected'];
      await Call.create({
        initiator: users[i % 10]._id,
        participants: [users[i % 10]._id, users[(i + 1) % 10]._id],
        type: callTypes[i % 2],
        status: callStatuses[i % 3],
        duration: i % 3 === 0 ? Math.floor(Math.random() * 300) : 0,
        startedAt: new Date(Date.now() - i * 3600000),
        endedAt: new Date(Date.now() - i * 3600000 + Math.random() * 300000)
      });
    }
    logger.success('Created call history');

    // Create admin data
    const labels = ['VIP', 'New Customer', 'Support Needed', 'Follow Up', 'Resolved'];
    const labelColors = ['#FFD700', '#00CED1', '#FF6347', '#FFA500', '#32CD32'];
    for (let i = 0; i < 5; i++) {
      await Label.create({ name: labels[i], color: labelColors[i], createdBy: admin._id });
    }

    const shortcuts = ['/hello', '/bye', '/help', '/price', '/hours', '/thanks', '/welcome', '/wait', '/done', '/issue'];
    const replies = [
      'Hello! How can I help you?', 'Goodbye! Have a great day!', 'I can help with that!',
      'Our prices start at ₹99/month.', 'We are open Mon-Fri 9am-6pm.',
      'Thank you for your patience!', 'Welcome aboard!', 'Please wait, connecting you soon.',
      'Your request has been processed!', 'I understand the issue, let me look into it.'
    ];
    for (let i = 0; i < 10; i++) {
      await QuickReply.create({ shortcut: shortcuts[i], message: replies[i], createdBy: admin._id });
    }

    const catalogItems = ['WhatsApp Business API', 'Chat Bot Setup', 'Custom Integration', 'Support Plan', 'Analytics Dashboard'];
    for (let i = 0; i < 5; i++) {
      await Catalog.create({
        name: catalogItems[i], description: `Premium ${catalogItems[i]} service`,
        price: (i + 1) * 999, createdBy: admin._id
      });
    }

    // Create admin settings with automation rules
    await Admin.create({
      user: admin._id,
      automationRules: [
        {
          name: 'Welcome New Users', trigger: 'new_user',
          conditions: [], actions: [{ type: 'auto_reply', value: 'Welcome to our platform! 🎉' }],
          isActive: true
        },
        {
          name: 'Support Keyword', trigger: 'keyword_matched',
          conditions: [{ field: 'content', operator: 'contains', value: 'help', logic: 'AND' }],
          actions: [{ type: 'add_label', value: 'Support Needed' }, { type: 'notify_admin', value: 'New support request' }],
          isActive: true
        },
        {
          name: 'Auto-assign Agent', trigger: 'message_received',
          conditions: [{ field: 'content', operator: 'contains', value: 'urgent', logic: 'AND' }],
          actions: [{ type: 'assign_agent', value: 'auto' }],
          isActive: false
        }
      ]
    });

    logger.success('Created admin data (labels, quick replies, catalog, automations)');
    logger.success('🎉 Seeding complete!');
    logger.info('Admin: admin@demo.com / Admin@123');
    logger.info('Users: user1@demo.com through user10@demo.com / User@123');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
