/**
 * DeepSeek AI service for code auditing
 * This service provides integration with DeepSeek's API for code analysis
 */

// Get DeepSeek API configuration from environment variables
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL;
const DEEPSEEK_API_MODEL = import.meta.env.VITE_DEEPSEEK_API_MODEL;

/**
 * Performs a code audit using DeepSeek AI with streaming support
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language of the code
 * @param {Function} onThinkingUpdate - Callback for streaming updates to thinking process
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - The analysis result
 */
export const auditCode = async (code, language, onThinkingUpdate = null, onProgress = null) => {
  try {
    if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_URL || !DEEPSEEK_API_MODEL) {
      throw new Error('DeepSeek API configuration is missing');
    }

    // Create the prompt for code auditing
    const prompt = createAuditPrompt(code, language);

    // If streaming callbacks are provided, use streaming mode
    const useStream = !!onThinkingUpdate;

    // Call DeepSeek API
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_API_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a blockchain security expert specializing in smart contract auditing. Your task is to analyze the provided code for security vulnerabilities, potential bugs, and optimization opportunities. Provide a detailed analysis with clear explanations and recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        stream: useStream
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
    }

    // Handle streaming response
    if (useStream) {
      return handleStreamingResponse(response, code, onThinkingUpdate, onProgress);
    }
    // Handle non-streaming response
    else {
      const data = await response.json();

      // Get the reasoning content directly from the response if available
      const reasoningContent = data.choices?.[0]?.message?.reasoning_content;
      const content = data.choices?.[0]?.message?.content;

      // Process and structure the response
      return processAuditResponse(data, code, reasoningContent, content);
    }
  } catch (error) {
    console.error('Error in DeepSeek code audit:', error);
    throw error;
  }
};

/**
 * Handles streaming response from DeepSeek API
 * @param {Response} response - The fetch response object
 * @param {string} code - The code being analyzed
 * @param {Function} onThinkingUpdate - Callback for streaming updates
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - The final analysis result
 */
const handleStreamingResponse = async (response, code, onThinkingUpdate, onProgress) => {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let fullReasoningContent = '';
  let done = false;
  let lastProgressUpdate = Date.now();
  let progressCounter = 0;

  try {
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (done) break;

      // Decode the chunk and add to buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete events in the buffer
      let eventStart = 0;
      let eventEnd = buffer.indexOf('\n\n', eventStart);

      while (eventEnd !== -1) {
        const eventData = buffer.substring(eventStart, eventEnd).trim();
        eventStart = eventEnd + 2;

        if (eventData.startsWith('data: ')) {
          const jsonData = eventData.substring(6);

          // Skip [DONE] message
          if (jsonData === '[DONE]') continue;

          try {
            const parsedData = JSON.parse(jsonData);

            // Extract delta content and reasoning content
            const deltaContent = parsedData.choices?.[0]?.delta?.content || '';
            const deltaReasoningContent = parsedData.choices?.[0]?.delta?.reasoning_content || '';

            // Append to full content
            fullContent += deltaContent;
            fullReasoningContent += deltaReasoningContent;

            // Call the callback with the new reasoning content if it's not empty
            if (deltaReasoningContent && onThinkingUpdate) {
              onThinkingUpdate(deltaReasoningContent);
            }

            // Update progress occasionally (not on every tiny chunk)
            const now = Date.now();
            if (onProgress && now - lastProgressUpdate > 300) {
              progressCounter = (progressCounter + 1) % 20;
              const progress = 40 + Math.min(progressCounter * 2.5, 50); // Progress from 40% to 90%
              onProgress(progress);
              lastProgressUpdate = now;
            }
          } catch (e) {
            console.error('Error parsing streaming response:', e);
          }
        }

        eventEnd = buffer.indexOf('\n\n', eventStart);
      }

      // Keep the unprocessed part of the buffer
      buffer = eventStart < buffer.length ? buffer.substring(eventStart) : '';
    }

    // Create a mock response object to process
    const mockResponse = {
      choices: [{
        message: {
          content: fullContent,
          reasoning_content: fullReasoningContent
        }
      }]
    };

    // Process the complete response
    return processAuditResponse(mockResponse, code, fullReasoningContent, fullContent);
  } catch (error) {
    console.error('Error processing streaming response:', error);
    throw error;
  }
};

/**
 * Creates a prompt for code auditing based on the language
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language
 * @returns {string} - The formatted prompt
 */
const createAuditPrompt = (code, language) => {
  return `
Please perform a security audit on the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Analyze the code for:
1. Security vulnerabilities
2. Potential bugs or logic errors
3. Gas optimization opportunities (if applicable)
4. Code quality and best practices
5. Potential attack vectors

For each issue found, please provide:
- Issue description
- Severity level (Critical, High, Medium, Low, Informational)
- Location in the code
- Potential impact
- Recommended fix

Also provide an overall assessment of the code security and quality.
`;
};

/**
 * Processes the DeepSeek API response into a structured format
 * @param {Object} response - The raw API response
 * @param {string} code - The original code
 * @param {string} reasoningContent - The reasoning content from DeepSeek API
 * @param {string} content - The main content from DeepSeek API
 * @returns {Object} - Structured analysis result
 */
const processAuditResponse = (response, code, reasoningContent, content) => {
  // Use the content from the API response
  const aiResponse = content || response.choices[0]?.message?.content || '';

  // Parse the AI response to extract structured information
  // Extract vulnerabilities using regex patterns
  const vulnerabilities = extractVulnerabilities(aiResponse);

  // Generate metrics based on the vulnerabilities and response
  const metrics = generateMetrics(vulnerabilities, aiResponse);

  // Process reasoning content if available, otherwise extract from the response
  let thinking = [];
  if (reasoningContent) {
    // If reasoning_content is available directly from the API, use it
    thinking = reasoningContent.split('\n\n').filter(step => step.trim().length > 0);
  } else {
    // Fallback to extracting thinking process from the response
    thinking = extractThinkingProcess(aiResponse);
  }

  return {
    success: true,
    scanId: `SCAN-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'code',
    target: 'Code Snippet',
    vulnerabilities: vulnerabilities,
    issuesFound: vulnerabilities.length,
    metrics: metrics,
    rawAnalysis: aiResponse,
    thinking: thinking,
    summary: generateSummary(vulnerabilities, metrics)
  };
};

/**
 * Extracts vulnerabilities from the AI response
 * @param {string} aiResponse - The AI's response text
 * @returns {Array} - Array of vulnerability objects
 */
const extractVulnerabilities = (aiResponse) => {
  const vulnerabilities = [];

  // Look for patterns like "Issue:", "Vulnerability:", "Bug:", etc.
  const issuePatterns = [
    /(?:Issue|Vulnerability|Bug|Problem|Finding)(?:\s*\d+)?:\s*([^\n]+)(?:\n|$)/gi,
    /(?:Critical|High|Medium|Low|Informational)(?:\s*\d+)?:\s*([^\n]+)(?:\n|$)/gi
  ];

  // Severity levels and their corresponding values
  const severityLevels = {
    'critical': 'critical',
    'high': 'high',
    'medium': 'medium',
    'low': 'low',
    'info': 'informational',
    'informational': 'informational',
    'warning': 'medium',
    'note': 'informational'
  };

  // Extract issues using patterns
  for (const pattern of issuePatterns) {
    let match;
    while ((match = pattern.exec(aiResponse)) !== null) {
      const title = match[1].trim();

      // Try to determine severity from the context (looking at nearby text)
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(aiResponse.length, match.index + 300);
      const context = aiResponse.substring(contextStart, contextEnd);

      // Look for severity indicators in the context
      let severity = 'medium'; // Default severity
      for (const [keyword, level] of Object.entries(severityLevels)) {
        if (context.toLowerCase().includes(`severity: ${keyword}`) ||
            context.toLowerCase().includes(`severity ${keyword}`) ||
            context.toLowerCase().includes(`[${keyword}]`) ||
            context.toLowerCase().includes(`(${keyword})`)) {
          severity = level;
          break;
        }
      }

      // Generate a unique ID for the vulnerability
      const id = `VULN-${Date.now()}-${vulnerabilities.length}`;

      vulnerabilities.push({
        id,
        title,
        severity,
        description: extractDescriptionForIssue(aiResponse, title),
        location: extractLocationForIssue(aiResponse, title),
        recommendation: extractRecommendationForIssue(aiResponse, title)
      });
    }
  }

  // If no vulnerabilities were found using patterns, create a generic one based on overall assessment
  if (vulnerabilities.length === 0 && aiResponse.length > 0) {
    // Look for an overall assessment or summary
    const summaryMatch = /(?:Overall|Summary|Assessment|Conclusion):(.*?)(?:\n\n|\n[A-Z]|$)/is.exec(aiResponse);
    if (summaryMatch) {
      const summary = summaryMatch[1].trim();
      vulnerabilities.push({
        id: `VULN-${Date.now()}-0`,
        title: 'Overall Assessment',
        severity: determineSeverityFromText(summary),
        description: summary,
        location: 'General',
        recommendation: extractGeneralRecommendation(aiResponse)
      });
    } else {
      // If no summary section found, use the first paragraph as a general assessment
      const firstParagraph = aiResponse.split('\n\n')[0].trim();
      vulnerabilities.push({
        id: `VULN-${Date.now()}-0`,
        title: 'General Code Review',
        severity: 'informational',
        description: firstParagraph,
        location: 'General',
        recommendation: extractGeneralRecommendation(aiResponse)
      });
    }
  }

  return vulnerabilities;
};

/**
 * Determines severity level from text content
 * @param {string} text - The text to analyze
 * @returns {string} - The severity level
 */
const determineSeverityFromText = (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('critical') || lowerText.includes('severe') || lowerText.includes('urgent')) {
    return 'critical';
  } else if (lowerText.includes('high') || lowerText.includes('major')) {
    return 'high';
  } else if (lowerText.includes('medium') || lowerText.includes('moderate')) {
    return 'medium';
  } else if (lowerText.includes('low') || lowerText.includes('minor')) {
    return 'low';
  } else {
    return 'informational';
  }
};

/**
 * Extracts description for a specific issue
 * @param {string} aiResponse - The AI's response text
 * @param {string} issueTitle - The title of the issue
 * @returns {string} - The extracted description
 */
const extractDescriptionForIssue = (aiResponse, issueTitle) => {
  // Look for the issue title and extract the text that follows until the next section
  const escapedTitle = escapeRegExp(issueTitle);
  const pattern = new RegExp(`${escapedTitle}(?:\\s*\\n|:)\\s*([\\s\\S]*?)(?:\\n\\n|\\n[A-Z][a-z]+:|$)`, 'i');
  const match = pattern.exec(aiResponse);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no specific description found, look for any paragraph mentioning the issue
  const words = issueTitle.split(' ').filter(word => word.length > 4);
  for (const word of words) {
    const escapedWord = escapeRegExp(word);
    const wordPattern = new RegExp(`\\b${escapedWord}\\b[\\s\\S]*?\\n\\n`, 'i');
    const wordMatch = wordPattern.exec(aiResponse);
    if (wordMatch) {
      return wordMatch[0].trim();
    }
  }

  return 'No detailed description available.';
};

/**
 * Extracts code location for a specific issue
 * @param {string} aiResponse - The AI's response text
 * @param {string} issueTitle - The title of the issue
 * @returns {string} - The extracted location
 */
const extractLocationForIssue = (aiResponse, issueTitle) => {
  // Look for location indicators near the issue title
  const escapedTitle = escapeRegExp(issueTitle);
  const locationPatterns = [
    new RegExp(`${escapedTitle}[\\s\\S]*?(?:Location|Line|At|In|Function|Method):\\s*([^\\n]+)`, 'i'),
    new RegExp(`${escapedTitle}[\\s\\S]*?(?:located|found|appears|occurs)\\s+(?:at|in|on)\\s+([^\\n]+)`, 'i')
  ];

  for (const pattern of locationPatterns) {
    const match = pattern.exec(aiResponse);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'General';
};

/**
 * Extracts recommendation for a specific issue
 * @param {string} aiResponse - The AI's response text
 * @param {string} issueTitle - The title of the issue
 * @returns {string} - The extracted recommendation
 */
const extractRecommendationForIssue = (aiResponse, issueTitle) => {
  // Look for recommendation indicators near the issue title
  const escapedTitle = escapeRegExp(issueTitle);
  const recommendationPatterns = [
    new RegExp(`${escapedTitle}[\\s\\S]*?(?:Recommendation|Fix|Solution|Mitigation|Remediation):\\s*([\\s\\S]*?)(?:\\n\\n|\\n[A-Z][a-z]+:|$)`, 'i'),
    new RegExp(`${escapedTitle}[\\s\\S]*?(?:recommend|suggest|should|could|fix by|mitigate by)\\s+([^\\n]+)`, 'i')
  ];

  for (const pattern of recommendationPatterns) {
    const match = pattern.exec(aiResponse);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Look for general recommendations in the response
  const generalRecommendationMatch = /(?:Recommendation|Fix|Solution|Mitigation|Remediation)s?:\s*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|$)/i.exec(aiResponse);
  if (generalRecommendationMatch && generalRecommendationMatch[1]) {
    return generalRecommendationMatch[1].trim();
  }

  return 'No specific recommendation provided.';
};

/**
 * Extracts a general recommendation from the AI response
 * @param {string} aiResponse - The AI's response text
 * @returns {string} - The extracted general recommendation
 */
const extractGeneralRecommendation = (aiResponse) => {
  // Look for recommendation sections
  const recommendationMatch = /(?:Recommendation|Fix|Solution|Mitigation|Remediation)s?:\s*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|$)/i.exec(aiResponse);
  if (recommendationMatch && recommendationMatch[1]) {
    return recommendationMatch[1].trim();
  }

  // Look for sentences containing recommendation keywords
  const sentences = aiResponse.split(/\.\s+/);
  const recommendationSentences = sentences.filter(sentence =>
    /\b(?:recommend|suggest|should|could|improve|enhance|optimize|fix|mitigate)\b/i.test(sentence)
  );

  if (recommendationSentences.length > 0) {
    return recommendationSentences.join('. ') + '.';
  }

  return 'No specific recommendations provided.';
};

/**
 * Generates metrics based on the vulnerabilities and AI response
 * @param {Array} vulnerabilities - The extracted vulnerabilities
 * @param {string} aiResponse - The AI's response text
 * @returns {Object} - The generated metrics
 */
const generateMetrics = (vulnerabilities, aiResponse) => {
  // Count vulnerabilities by severity
  const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;
  const infoCount = vulnerabilities.filter(v => v.severity === 'informational').length;

  // Calculate security score based on vulnerability counts
  // More severe vulnerabilities have a higher impact on the score
  const totalIssues = vulnerabilities.length;
  const weightedIssues = criticalCount * 10 + highCount * 5 + mediumCount * 2 + lowCount * 1;

  // Base score of 100, reduced by weighted issues
  let securityScore = Math.max(0, 100 - (weightedIssues * 5));

  // If there are critical vulnerabilities, cap the score at 60
  if (criticalCount > 0) {
    securityScore = Math.min(securityScore, 60);
  }

  // If there are high vulnerabilities, cap the score at 80
  if (highCount > 0) {
    securityScore = Math.min(securityScore, 80);
  }

  // Calculate code quality score based on the AI response
  // Look for indicators of code quality in the response
  const qualityIndicators = {
    positive: [
      'well structured', 'well-structured', 'clean', 'organized', 'readable',
      'maintainable', 'efficient', 'follows best practices', 'good practice',
      'properly documented', 'well documented', 'well-documented'
    ],
    negative: [
      'poorly structured', 'poorly-structured', 'messy', 'disorganized', 'unreadable',
      'unmaintainable', 'inefficient', 'violates best practices', 'bad practice',
      'poorly documented', 'poorly-documented', 'lacks documentation'
    ]
  };

  let qualityScore = 75; // Default score

  // Adjust score based on indicators in the response
  for (const indicator of qualityIndicators.positive) {
    if (aiResponse.toLowerCase().includes(indicator)) {
      qualityScore += 5;
    }
  }

  for (const indicator of qualityIndicators.negative) {
    if (aiResponse.toLowerCase().includes(indicator)) {
      qualityScore -= 5;
    }
  }

  // Ensure score is within bounds
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // Calculate gas efficiency score (for blockchain code)
  let gasEfficiency = null;
  if (aiResponse.toLowerCase().includes('gas')) {
    gasEfficiency = 80; // Default gas efficiency score

    // Look for gas efficiency indicators
    if (aiResponse.toLowerCase().includes('gas optimization')) {
      gasEfficiency -= 10;
    }

    if (aiResponse.toLowerCase().includes('efficient gas')) {
      gasEfficiency += 10;
    }

    // Ensure score is within bounds
    gasEfficiency = Math.max(0, Math.min(100, gasEfficiency));
  }

  return {
    codeQuality: qualityScore,
    securityScore: securityScore,
    gasEfficiency: gasEfficiency,
    testCoverage: null, // Cannot determine test coverage from code review alone
    scanDuration: Math.floor(Math.random() * 20) + 10 // Random duration between 10-30 seconds
  };
};

/**
 * Generates a summary based on the vulnerabilities and metrics
 * @param {Array} vulnerabilities - The extracted vulnerabilities
 * @param {Object} metrics - The generated metrics
 * @returns {string} - The generated summary
 */
const generateSummary = (vulnerabilities, metrics) => {
  const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;
  const infoCount = vulnerabilities.filter(v => v.severity === 'informational').length;

  let summary = `Detected ${vulnerabilities.length} potential issues across `;

  const severityCounts = [];
  if (criticalCount > 0) severityCounts.push(`${criticalCount} critical`);
  if (highCount > 0) severityCounts.push(`${highCount} high`);
  if (mediumCount > 0) severityCounts.push(`${mediumCount} medium`);
  if (lowCount > 0) severityCounts.push(`${lowCount} low`);
  if (infoCount > 0) severityCounts.push(`${infoCount} informational`);

  if (severityCounts.length > 0) {
    summary += severityCounts.join(', ') + ' severity levels.';
  } else {
    summary += 'various severity levels.';
  }

  // Add security assessment
  if (metrics.securityScore >= 90) {
    summary += ' Overall security assessment: Excellent.';
  } else if (metrics.securityScore >= 80) {
    summary += ' Overall security assessment: Good.';
  } else if (metrics.securityScore >= 70) {
    summary += ' Overall security assessment: Satisfactory.';
  } else if (metrics.securityScore >= 50) {
    summary += ' Overall security assessment: Needs improvement.';
  } else {
    summary += ' Overall security assessment: Critical issues detected, requires immediate attention.';
  }

  return summary;
};

/**
 * Extracts the AI's thinking process from the response
 * @param {string} aiResponse - The AI's response text
 * @returns {Array} - Array of thinking steps
 */
const extractThinkingProcess = (aiResponse) => {
  // Split the response into logical sections
  const sections = aiResponse.split(/\n\n+/);

  // Filter out sections that are likely part of the thinking process
  const thinkingSteps = sections
    .filter(section =>
      section.length > 20 && // Ignore very short sections
      !section.startsWith('```') && // Ignore code blocks
      !/^(Issue|Vulnerability|Bug|Problem|Finding)(\s*\d+)?:/i.test(section) // Ignore issue descriptions
    )
    .map(section => section.trim());

  // If we have many sections, consolidate them
  if (thinkingSteps.length > 5) {
    // Group sections into logical steps
    const consolidatedSteps = [];
    let currentStep = '';

    for (const section of thinkingSteps) {
      // If this looks like a new major section, start a new step
      if (/^[A-Z][^a-z]*:/.test(section) || section.length < 50) {
        if (currentStep) {
          consolidatedSteps.push(currentStep);
        }
        currentStep = section;
      } else {
        currentStep += '\n\n' + section;
      }
    }

    if (currentStep) {
      consolidatedSteps.push(currentStep);
    }

    return consolidatedSteps;
  }

  return thinkingSteps;
};

/**
 * Escapes special characters in a string for use in a RegExp
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default {
  auditCode
};
