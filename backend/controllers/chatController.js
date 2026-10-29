import Chat from '../models/Chat.js';

// @desc    Get all chats for a user
// @route   GET /api/chats
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, chats });
  } catch (error) { next(error); }
};

// @desc    Create a new chat
// @route   POST /api/chats
export const createChat = async (req, res, next) => {
  try {
    const { title, messages } = req.body;
    const chat = await Chat.create({ user: req.user._id, title, messages });
    res.status(201).json({ success: true, chat });
  } catch (error) { next(error); }
};

// @desc    Update existing chat
// @route   PUT /api/chats/:id
export const updateChat = async (req, res, next) => {
  try {
    const { messages } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { messages },
      { new: true }
    );
    res.status(200).json({ success: true, chat });
  } catch (error) { next(error); }
};

// @desc    Delete chat
// @route   DELETE /api/chats/:id
export const deleteChat = async (req, res, next) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Chat deleted' });
  } catch (error) { next(error); }
};