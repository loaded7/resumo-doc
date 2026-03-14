import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question, summary, title } = await request.json()

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: `Você é um assistente que responde perguntas sobre o documento "${title}". Use o resumo abaixo como base para suas respostas. Seja direto e objetivo. Responda em português.\n\nResumo do documento:\n${summary}`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
      }),
    })

    const data = await response.json()
    const answer = data.choices[0].message.content

    return NextResponse.json({ answer })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar pergunta' }, { status: 500 })
  }
}