# AstroPDF 🚀

Resumo inteligente de documentos PDF com IA. Faça upload, receba o resumo e converse com o documento.

🔗 **[Acessar o projeto](https://resumo-doc.vercel.app)**

## Funcionalidades

- Upload de PDF com drag and drop
- Resumo automático gerado por IA (Groq + LLaMA 3.3)
- Chat com o documento — tire dúvidas sobre o conteúdo
- Histórico de documentos salvo por usuário
- Autenticação completa (cadastro, login, perfil)
- Dark mode

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Banco de dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **IA:** Groq API (LLaMA 3.3 70B)
- **Deploy:** Vercel

## Como rodar localmente
```bash
git clone https://github.com/loaded7/resumo-doc.git
cd resumo-doc
npm install
```

Crie um arquivo `.env.local` com as variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key
GROQ_API_KEY=sua_key
```
```bash
npm run dev
```

## Autor

Feito por **Thomas** — estudante de Engenharia da Computação