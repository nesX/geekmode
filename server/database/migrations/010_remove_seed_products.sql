-- Eliminar productos de prueba del seed inicial (003_seed_data.sql)
-- Las tablas variants, product_images y product_categories tienen ON DELETE CASCADE

DELETE FROM products
WHERE slug IN (
  -- Camisetas
  'camiseta-hello-world',
  'camiseta-bug-hunter',
  'camiseta-404-not-found',
  'camiseta-git-push-force',
  'camiseta-css-is-awesome',
  'camiseta-sudo-rm-rf',
  'camiseta-vim-exit',
  'camiseta-localhost',
  'camiseta-binary',
  'camiseta-works-on-my-pc',
  -- Hoodies
  'hoodie-cyberpunk-coder',
  'hoodie-dark-mode',
  'hoodie-stack-overflow',
  'hoodie-hackerman',
  'hoodie-open-source',
  'hoodie-kernel-panic',
  'hoodie-ai-overlord',
  'hoodie-merge-conflict',
  'hoodie-full-stack',
  'hoodie-nan-problemas',
  -- Accesorios
  'mug-semicolon',
  'sticker-pack-dev',
  'gorra-sudo',
  'mousepad-xxl-terminal',
  'pin-metalico-curly-braces',
  'botella-debugger',
  'llavero-usb-retro',
  'mug-infinite-loop',
  'gorra-binary',
  'calcetines-http-status',
  -- Posters
  'poster-algoritmos',
  'poster-atajos-vim',
  'poster-git-flow',
  'poster-clean-code',
  'poster-shortcuts-vscode',
  'poster-big-o-notation',
  'poster-linux-commands',
  'poster-design-patterns',
  'poster-http-status',
  'poster-sql-joins'
);
