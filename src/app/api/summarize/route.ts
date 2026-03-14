import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const { extractText } = await import('unpdf')
    const { text } = await extractText(new Uint8Array(bytes), { mergePages: true })

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Não foi possível extrair texto do PDF' }, { status: 400 })
    }

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
            role: 'user',
            content: `Faça um resumo claro e objetivo do seguinte documento em português. 
            Inclua: 1) Resumo geral (3-4 frases), 2) Pontos principais (lista), 3) Conclusão.
            
            Documento:
            ${text.slice(0, 8000)}`,
          },
        ],
      }),
    })

    const data = await response.json()
    const summary = data.choices[0].message.content

    return NextResponse.json({ summary })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar documento' }, { status: 500 })
  }
}