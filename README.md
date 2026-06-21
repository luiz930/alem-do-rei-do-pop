# Além do Rei do Pop

Site estático premium, independente e não oficial, criado para fins culturais, educativos e de homenagem. Não utiliza fotos reais, capas oficiais, logotipos, músicas, vídeos baixados ou letras completas.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:4321`. Para validar e gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Editar conteúdo

Os dados ficam em `src/data/`:

- `timeline.json`: eventos históricos;
- `albums.json`: discografia comentada;
- `videos.json`: análises de videoclipes;
- `sources.json`: fontes e referências.

As mensagens enviadas pela página `mensagens.html` são armazenadas no Netlify Blobs e entram sempre como pendentes. Somente mensagens aprovadas pela página administrativa são exibidas publicamente.

## Mensagens de fãs

O recurso usa apenas Netlify Functions e Netlify Blobs:

- `public/mensagens.html`: envio e listagem pública;
- `public/admin-mensagens.html`: moderação, sem link no menu;
- `netlify/functions/submit-message.js`: valida e salva mensagens pendentes;
- `netlify/functions/list-messages.js`: retorna somente mensagens aprovadas;
- `netlify/functions/approve-message.js`: lista pendências e aprova com autenticação.

Instale as dependências e vincule o diretório ao projeto do Netlify:

```bash
npm install
npx netlify login
npx netlify link
```

Crie uma senha aleatória com pelo menos 24 caracteres e configure `ADMIN_SECRET` no painel do Netlify, com escopo para Functions. Para desenvolvimento local:

```bash
ADMIN_SECRET='uma-senha-local-longa-e-aleatoria' npx netlify dev
```

Abra `http://localhost:8888/mensagens.html` para enviar e `http://localhost:8888/admin-mensagens.html` para moderar. O Netlify Dev usa um sandbox local do Blobs e não acessa dados da produção.

## Publicação

- **Netlify:** conecte o repositório. O arquivo `netlify.toml` configura automaticamente `npm run build` e o diretório de publicação `dist`.
- **Vercel:** use `npm run build` e diretório de saída `dist`.
- **GitHub Pages:** configure uma Action para Astro. Se publicar em subdiretório, defina `base` e a URL real em `astro.config.mjs`.

No Netlify, configure `ADMIN_SECRET` antes do deploy. Não coloque essa senha no `netlify.toml`, em arquivos JavaScript públicos ou no repositório.

## Direitos e independência

Este projeto não é afiliado a Michael Jackson Estate, Sony Music, Motown, Epic Records ou representantes oficiais. Links externos são referências; seus conteúdos pertencem aos respectivos titulares.
