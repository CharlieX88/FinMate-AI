import Groq from 'groq-sdk';

let _groq = null;
const getGroq = () => {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing in .env');
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callGroq = async (model, messages, options = {}) => {
  const completion = await getGroq().chat.completions.create({
    messages,
    model,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 500,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
};

const generateCompletion = async (messages, options = {}) => {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callGroq(model, messages, options);
      } catch (error) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        if (status === 429) {
          await sleep(1000 * Math.pow(2, attempt));
          continue;
        }
        break;
      }
    }
  }
  throw new Error(`AI service unavailable: ${lastError?.message || 'Unknown error'}`);
};

// ---- 1. Chatbot: personalized Q&A ----
export const generateChatResponse = async (userMessage, conversationHistory, userContext) => {
  const systemPrompt = `You are the "World's Best Financial Advisor" for an Indian personal finance app called "FinMate".

User's Financial Profile:
- Monthly Income: ₹${userContext.monthlyIncome || 0}
- Monthly Expenses: ₹${userContext.monthlyExpenses || 0}
- Existing EMIs: ₹${userContext.existingEMIs || 0}
- Financial Goal: ${userContext.financialGoal || 'not set'}

Rules for your response:
1. LANGUAGE: Detect the user's language. If they ask in English, reply in clear English. If they ask in Hindi/Hinglish, reply in friendly Hinglish.
2. PERSONA: Act as a world-class expert. Give thorough, highly educational, and practical advice.
3. FORMATTING: Use standard Markdown (bolding, bullet points, and TABLES). 
4. CRITICAL: DO NOT use ANY HTML tags like <br>, <br/>, <ul>, <li>. Use standard newlines (Enter) for spacing and standard markdown '-' for bullet points.
5. COMPLETENESS: You must complete your entire thought process. Do not stop mid-sentence.

Answer the user's latest question thoroughly based on these rules.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(conversationHistory || []).slice(-6),
    { role: 'user', content: userMessage },
  ];

  // 👈 Token limit badha kar 4000 kar diya taaki answer kabhi cut na ho
  return await generateCompletion(messages, { maxTokens: 4000, temperature: 0.7 });
};

// ---- 2. Spending insights (dashboard card) ----
export const generateSpendingInsights = async (summary, categoryBreakdown) => {
  if (!summary || summary.expense === 0) {
    return 'No expenses recorded this month. Start adding expenses so the AI can generate personalized insights.';
  }

  const top = (categoryBreakdown || [])
    .slice(0, 3)
    .map((c) => `${c.category} (₹${c.total})`)
    .join(', ');

  const prompt = `Analyze this user's monthly spending and provide insights.
Income: ₹${summary.income}
Expense: ₹${summary.expense}
Savings Rate: ${summary.savingsRate}%
Top categories: ${top}

Rules for your response:
1. Provide exactly 2 short bullet points analyzing the spending. Start each with a hyphen (-).
2. Provide exactly 1 bullet point for an "Actionable tip" to save money. Start it with "Tip: ".
3. Do NOT use markdown bolding (**) anywhere.
4. Keep the total response under 60 words.
5. Ensure sentences are complete and do not cut off.`;

  try {
    const response = await generateCompletion(
      [
        { role: 'system', content: 'You are a concise financial analyst. Use plain text and bullet points only.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 200, temperature: 0.6 }
    );
    
    // 👈 Safety check: Agar AI khaali string bhejta hai, toh error throw karo taaki catch block chale
    if (!response || response.trim() === '') {
      throw new Error("Empty AI response");
    }
    
    return response;
  } catch (error) {
    console.log("AI Insight failed, using fallback:", error.message);
    return ruleBasedInsight(summary, categoryBreakdown);
  }
};

const ruleBasedInsight = (summary, breakdown) => {
  const insights = [];
  if (summary.savingsRate < 10)
    insights.push(`Your savings rate is only ${summary.savingsRate}% — aim for at least 20%.`);
  else if (summary.savingsRate >= 30)
    insights.push(`Excellent! A ${summary.savingsRate}% savings rate is very strong.`);

  const top = breakdown?.[0];
  if (top && top.percent > 40)
    insights.push(`${top.percent}% of your spending is on ${top.category} — consider trimming it.`);

  return insights.join(' ') || 'Your finances look stable. Keep it up!';
};

// ---- 3. EMI explanation ----
export const explainEMI = async (emiData, userContext) => {
  const totalEmi = emiData.emi + (userContext.existingEMIs || 0);
  const dtiRatio = userContext.monthlyIncome > 0 ? ((totalEmi / userContext.monthlyIncome) * 100).toFixed(1) : 0;
  const leftover = userContext.monthlyIncome - totalEmi - (userContext.monthlyExpenses || 0);

  let prompt = `Act as a strict financial advisor. Analyze this loan scenario.
USER: Income ₹${userContext.monthlyIncome}, Expenses ₹${userContext.monthlyExpenses}.
NEW LOAN: Amount ₹${emiData.principal}, EMI ₹${emiData.emi}, Tenure ${emiData.tenureMonths} months, Total Interest ₹${emiData.totalInterest}.

Provide a reality check using exactly 3 short bullet points (start each with a hyphen '-'). Keep it under 70 words. No bold text. Plain text only.
1. Affordability: Is the ${dtiRatio}% EMI burden safe or risky for their income?
2. Reality: You will have ₹${leftover} left each month for daily living.
`;

  if (userContext.optimalTenure) {
    prompt += `3. TENURE WARNING: Their chosen tenure of ${emiData.tenureMonths} months makes them pay a massive ₹${emiData.totalInterest} as interest! STRICTLY advise them to change the tenure to ${userContext.optimalTenure} months. Explain that if they do this, their EMI will be ₹${userContext.optimalEmi}, but they will save ₹${userContext.interestSaved} in interest.`;
  } else {
    prompt += `3. Advice: Their tenure of ${emiData.tenureMonths} months is good, but suggest one tip (like prepayment or emergency fund) to stay safe.`;
  }

  try {
    const response = await generateCompletion([{ role: 'user', content: prompt }], {
      maxTokens: 180,
      temperature: 0.6,
    });
    if (!response || response.trim() === '') throw new Error("Empty AI response");
    return response;
  } catch (error) {
    return `- Your total EMI is ₹${totalEmi.toLocaleString('en-IN')}, which is ${dtiRatio}% of your income.\n- You will have ₹${leftover.toLocaleString('en-IN')} left each month for daily living.\n- ${userContext.optimalTenure ? `WARNING: Taking a ${emiData.tenureMonths}-month loan charges you ₹${emiData.totalInterest.toLocaleString('en-IN')} in interest. Try reducing it to ${userContext.optimalTenure} months to save money.` : 'Ensure you build an emergency fund before starting this EMI.'}`;
  }
};

// ---- 4. Loan recommendation explanation ----
export const explainRecommendations = async (recommendations, userContext) => {
  const top = recommendations?.[0];
  if (!top) return 'No recommendations available right now.';

  const prompt = `Explain in clear English (under 80 words) why this loan is the best fit for the user:

User: Income ₹${userContext.monthlyIncome}, Goal: ${userContext.financialGoal}
Loan: ${top.loan.bankName} ${top.loan.loanType} at ${top.loan.interestRate}%
EMI: ₹${top.emi}, Score: ${top.score}/100

Friendly tone. Mention why it is the best fit and one consideration to keep in mind.`;

  try {
    return await generateCompletion([{ role: 'user', content: prompt }], {
      maxTokens: 150,
      temperature: 0.6,
    });
  } catch (error) {
    return `${top.loan.bankName}'s ${top.loan.loanType} loan is the best fit with a ${top.loan.interestRate}% rate and ₹${top.emi} EMI. Score: ${top.score}/100.`;
  }
};

// ---- 5. Credit Score Action Plan ----
export const generateCreditAdvice = async (scoreData, userProfile) => {
  const { score, grade, breakdown } = scoreData;
  
  const prompt = `Act as a credit repair expert. Analyze this user's mock credit score.
CURRENT SCORE: ${score}/900 (${grade})
BREAKDOWN:
- Payment History: ${breakdown.paymentHistory}/315
- Credit Utilization: ${breakdown.utilization}/270
- Credit History Length: ${breakdown.historyLength}/135
- Credit Mix: ${breakdown.creditMix}/90
- New Inquiries: ${breakdown.inquiries}/90

USER DETAILS: Utilization is ${userProfile.creditUtilizationPercentage}%, Inquiries in last 6 months: ${userProfile.recentInquiries}.

Provide a 3-point Action Plan in English (under 100 words) to improve this score to 750+. 
Format as a bulleted list. Be specific (e.g., tell them to reduce utilization below 30%). No markdown headers.`;

  try {
    return await generateCompletion([{ role: 'user', content: prompt }], {
      maxTokens: 200,
      temperature: 0.6,
    });
  } catch (error) {
    return `- Keep your credit utilization below 30%.\n- Avoid applying for new loans for the next 6 months.\n- Ensure 100% on-time bill payments to build history.`;
  }
};