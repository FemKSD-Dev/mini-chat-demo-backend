import { Request, Response, NextFunction } from 'express';
import { Message } from '../schemas/chat.schema';

// In-memory storage (replace with database in production)
let messages: (Message & { id: string; timestamp: string })[] = [];
let messageIdCounter = 1;

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const paginatedMessages = messages
      .slice(offset, offset + limit)
      .reverse(); // Most recent first

    res.json({
      messages: paginatedMessages,
      total: messages.length,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, message } = req.body;
    
    const newMessage = {
      id: `msg_${messageIdCounter++}`,
      username,
      message,
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);

    // Keep only last 1000 messages
    if (messages.length > 1000) {
      messages = messages.slice(-1000);
    }

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const messageIndex = messages.findIndex(msg => msg.id === id);
    
    if (messageIndex === -1) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }

    messages.splice(messageIndex, 1);

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    next(error);
  }
};

export const clearMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    messages = [];
    messageIdCounter = 1;

    res.json({
      success: true,
      message: 'All messages cleared'
    });
  } catch (error) {
    next(error);
  }
};
