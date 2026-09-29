import StudentProfile from '../models/StudentProfile.js';
import { generateAIResponse } from '../services/aiService.js';

/**
 * @desc    Chat with AlumniConnect AI Assistant (Powered by Google Gemini)
 * @route   POST /api/ai/chat
 * @access  Private (Students only)
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const userId = req.user._id;

    // 1. Retrieve safe academic context if user is a student
    let studentContext = null;
    try {
      if (req.user?.role === 'student') {
        const studentProfile = await StudentProfile.findOne({ user: userId }).select(
          'branch semester graduationYear skills interests'
        ).lean();

        if (studentProfile) {
          studentContext = {
            branch: studentProfile.branch || '',
            semester: studentProfile.semester || '',
            graduationYear: studentProfile.graduationYear || '',
            skills: Array.isArray(studentProfile.skills) ? studentProfile.skills : [],
            interests: Array.isArray(studentProfile.interests) ? studentProfile.interests : [],
          };
        }
      }
    } catch (profileErr) {
      // Non-fatal: if profile lookup fails, continue without context
      console.warn('[AIController] Could not fetch student context:', profileErr.message);
    }

    // 2. Call AI Service to communicate with Google Gemini
    const result = await generateAIResponse({
      message,
      history,
      studentContext,
    });

    // 3. Return clean JSON response
    return res.status(200).json({
      success: true,
      reply: result.message,
      message: result.message,
      model: result.model,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'An error occurred while processing your question with AlumniConnect AI.',
    });
  }
};

export default {
  chatWithAI,
};
