const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIService {
  async generateQuestions(request) {
    const { subject, class: grade, difficulty, type, count, topic } = request;
    
    const prompt = this.buildPrompt(subject, grade, difficulty, type, count, topic);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate high-quality, accurate questions for students. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      const questions = JSON.parse(content);
      
      // Process and validate questions
      return this.processGeneratedQuestions(questions, request);
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Fallback to sample questions if AI fails
      return this.generateFallbackQuestions(request);
    }
  }

  buildPrompt(subject, grade, difficulty, type, count, topic) {
    const topicText = topic ? ` focusing on ${topic}` : '';
    const typeInstruction = type === 'mixed' ? 'mix of objective and subjective' : type;
    
    return `Generate ${count} ${difficulty} difficulty ${typeInstruction} questions for ${subject} at ${grade} level${topicText}.

Requirements:
- Questions must be educationally appropriate and accurate
- For objective questions: provide exactly 4 options with one correct answer
- For subjective questions: provide a comprehensive correct answer
- Include brief explanations for all questions
- Assign appropriate points (5-15 based on difficulty)

Return ONLY a JSON array with this exact structure:
[
  {
    "subject": "${subject}",
    "class": "${grade}",
    "difficulty": "${difficulty}",
    "type": "objective" or "subjective",
    "question": "Question text here",
    "options": ["A", "B", "C", "D"] (only for objective),
    "correctAnswer": "Correct answer here",
    "explanation": "Brief explanation",
    "points": 10,
    "createdBy": "ai"
  }
]

Generate exactly ${count} questions. Ensure variety in question types and topics within the subject.`;
  }

  processGeneratedQuestions(questions, request) {
    return questions.map(q => ({
      ...q,
      subject: request.subject,
      class: request.class,
      difficulty: request.difficulty,
      createdBy: 'ai',
      aiMetadata: {
        model: 'gpt-3.5-turbo',
        prompt: `Generated for ${request.subject} - ${request.class}`,
        generatedAt: new Date()
      }
    }));
  }

  generateFallbackQuestions(request) {
    const { subject, class: grade, difficulty, type, count } = request;
    
    const fallbackQuestions = [];
    
    for (let i = 0; i < count; i++) {
      const questionType = type === 'mixed' ? (i % 2 === 0 ? 'objective' : 'subjective') : type;
      
      const baseQuestion = {
        subject,
        class: grade,
        difficulty,
        type: questionType,
        createdBy: 'ai',
        points: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
        aiMetadata: {
          model: 'fallback',
          prompt: 'Fallback generation',
          generatedAt: new Date()
        }
      };

      if (questionType === 'objective') {
        fallbackQuestions.push({
          ...baseQuestion,
          question: `Sample ${subject} question ${i + 1} for ${grade} students at ${difficulty} level`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          explanation: `This is a sample explanation for ${subject} concept.`
        });
      } else {
        fallbackQuestions.push({
          ...baseQuestion,
          question: `Explain a key concept in ${subject} relevant to ${grade} students`,
          correctAnswer: `A comprehensive answer explaining the ${subject} concept with examples and applications.`,
          explanation: `This question tests understanding of fundamental ${subject} principles.`
        });
      }
    }
    
    return fallbackQuestions;
  }

  async generateTestDescription(title, subject, difficulty, questionCount) {
    try {
      const prompt = `Generate a brief, engaging description for an educational test with these details:
- Title: ${title}
- Subject: ${subject}
- Difficulty: ${difficulty}
- Number of questions: ${questionCount}

The description should be 1-2 sentences, highlighting what students will learn or be tested on. Make it encouraging and informative.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Description generation error:', error);
      return `Test your knowledge of ${subject} with ${questionCount} ${difficulty} questions covering key concepts and applications.`;
    }
  }
}

module.exports = new AIService();