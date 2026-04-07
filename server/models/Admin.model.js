import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageChats: { type: Boolean, default: true },
    manageBroadcasts: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    manageAgents: { type: Boolean, default: true },
    manageLabels: { type: Boolean, default: true },
    manageCatalog: { type: Boolean, default: true },
    manageAutomations: { type: Boolean, default: true }
  },
  notes: [{ content: String, createdAt: { type: Date, default: Date.now } }],
  automationRules: [{
    name: String,
    trigger: { type: String, enum: ['new_user', 'message_received', 'keyword_matched', 'scheduled'] },
    conditions: [{
      field: String,
      operator: { type: String, enum: ['contains', 'equals', 'startsWith', 'endsWith'] },
      value: String,
      logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
    }],
    actions: [{
      type: { type: String, enum: ['auto_reply', 'assign_agent', 'add_label', 'notify_admin'] },
      value: String
    }],
    isActive: { type: Boolean, default: true },
    executionCount: { type: Number, default: 0 },
    lastExecuted: Date
  }]
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
