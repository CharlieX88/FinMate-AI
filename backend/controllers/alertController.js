import Alert from '../models/Alert.js';

// @desc    Create alert (internal use — future mein triggers se call hoga)
// @route   POST /api/alerts
// @access  Private
export const createAlert = async (req, res, next) => {
  try {
    const { type, title, message, priority, relatedId } = req.body;

    if (!type || !title || !message) {
      return res
        .status(400)
        .json({ success: false, message: 'type, title, and message are required' });
    }

    const alert = await Alert.create({
      user: req.user._id,
      type,
      title,
      message,
      priority: priority || 'medium',
      relatedId: relatedId || null,
    });

    res.status(201).json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Get alerts (filter by isRead)
// @route   GET /api/alerts?isRead=false&limit=20
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const { isRead, limit = 50 } = req.query;

    const query = { user: req.user._id };
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Alert.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({ success: true, unreadCount, count: alerts.length, alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all alerts as read
// @route   PUT /api/alerts/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Alert.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} alerts marked as read`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
export const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};