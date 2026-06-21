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
- `fan-messages.json`: mensagens de fãs;
- `sources.json`: fontes e referências.

A página pública de vozes exibe somente mensagens com `"status": "approved"`. Revise texto, consentimento e privacidade antes de aprovar qualquer entrada real.

## Formulário

O formulário de mensagem é somente visual e não transmite informações. O HTML está organizado para receber uma integração futura com Netlify Forms, Formspree ou Supabase. Antes disso, defina política de retenção, canal de contato e fluxo de remoção.

## Publicação

- **Netlify:** conecte o repositório. O arquivo `netlify.toml` configura automaticamente `npm run build` e o diretório de publicação `dist`.
- **Vercel:** use `npm run build` e diretório de saída `dist`.
- **GitHub Pages:** configure uma Action para Astro. Se publicar em subdiretório, defina `base` e a URL real em `astro.config.mjs`.

Substitua o domínio de exemplo em `astro.config.mjs` e o e-mail placeholder da página de remoção antes de publicar.

## Direitos e independência

Este projeto não é afiliado a Michael Jackson Estate, Sony Music, Motown, Epic Records ou representantes oficiais. Links externos são referências; seus conteúdos pertencem aos respectivos titulares.
