# Site da Barbearia — Portfólio + Agendamento

## O que tem aqui
- `index.html` — a página (apresentação + seção de agendamento)
- `style.css` — visual do site
- `script.js` — a lógica (não precisa mexer)
- `config.js` — **é aqui que você edita tudo**: nome, cores, telefone, serviços, logo
- `assets/logo.svg` — logo provisória, troque pela sua
- `supabase-schema.sql` — comando pra criar o banco de dados

O site já funciona localmente sem configurar nada (agendamentos ficam salvos só
no seu navegador, pra você testar). Pra virar um site de verdade, no ar, com
agendamentos reais, siga os passos abaixo.

## 1. Personalizar (você mesmo edita)
Abra `config.js` e troque:
- `nomeBarbearia`, `slogan`, `telefone`, `endereco`, `instagram`
- `cores` — já vem com uma paleta clássica de barbearia (preto, dourado, vermelho); troque os HEX à vontade
- `servicos` — nome, duração e preço de cada serviço
- Pra trocar a logo: substitua o arquivo `assets/logo.svg` por outro arquivo
  (pode ser `.png` ou `.jpg` — só ajuste o nome do arquivo nas duas linhas do
  `index.html` que têm `assets/logo.svg`)

## 2. Criar o banco de dados (Supabase — grátis)
1. Crie conta em https://supabase.com e um novo projeto
2. Vá em **SQL Editor** → cole o conteúdo de `supabase-schema.sql` → Run
3. Vá em **Project Settings → API** e copie:
   - a **Project URL**
   - a chave **anon public**
4. Cole os dois valores em `config.js`, no campo `supabase: { url, anonKey }`

Pronto — o site passa a gravar os agendamentos de verdade na nuvem.

## 3. Colocar no ar (GitHub + Vercel — grátis)
1. Crie um repositório novo (privado) no GitHub e suba esta pasta inteira
2. Entre em https://vercel.com, faça login com o GitHub
3. **Add New → Project** → selecione o repositório
4. Não precisa configurar nada (é um site estático) → **Deploy**
5. Em poucos segundos o Vercel te dá um link tipo `seusite.vercel.app`

Quer um domínio próprio (ex: `barbeariadojoao.com.br`)? Compra em qualquer
registrador (Registro.br, Hostinger etc.) e aponta pro Vercel em
**Project Settings → Domains** — o próprio Vercel te dá o passo a passo.

## 4. Confirmar agendamentos
Depois que o cliente agenda, o status fica "pendente". Pra confirmar:
- Entre no seu projeto Supabase → **Table Editor → agendamentos**
- Mude a coluna `status` da linha de `pending` pra `confirmed`

Isso é manual por enquanto — dá pra automatizar depois com um painel próprio,
mas pra começar já resolve.

## Segurança básica
- Deixe o repositório do GitHub como **privado**
- A chave `anonKey` do Supabase é pública por natureza (ela só permite o que
  as regras do banco liberarem — já configuradas no `supabase-schema.sql`
  pra só ler e criar agendamento, nada mais)
