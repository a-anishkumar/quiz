const mongoose = require('mongoose');

const roadmapProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  roadmapId: { type: String, index: true, required: true },
  startedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  currentPhase: { type: String, default: 'Foundation' },
  completedTopics: { type: [String], default: [] },
  inProgressTopic: { type: String, default: '' },
  percentComplete: { type: Number, default: 0 },
}, { timestamps: true });

roadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

module.exports = mongoose.model('RoadmapProgress', roadmapProgressSchema);


