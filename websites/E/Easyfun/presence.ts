const presence = new Presence({
  clientId: '1408054441252491326',
})

// Controle de mudança de URL para reiniciar o timestamp
let lastUrl = document.location.href
let startTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Vc51Wzs.png',
}

/**
 * Tenta obter a URL do ícone do jogo atual.
 * Utiliza seletores específicos baseados nos atributos gerados pelo Next.js e classes observadas.
 */
function getGameIcon(): string | null {
  // Prioridade: imagem com data-nimg="1" e dimensões 60x60 (comum para capas)
  const iconEl =
    document.querySelector<HTMLImageElement>('img[data-nimg="1"][width="60"][height="60"]') ||
    document.querySelector<HTMLImageElement>('img[data-nimg="1"][width="128"][height="128"]') ||
    document.querySelector<HTMLImageElement>('img.size-25') || // fallback pela classe de tamanho
    document.querySelector<HTMLImageElement>('img[data-nimg="1"]') // última opção: qualquer imagem Next.js

  return iconEl?.src || null
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const isGamePage = pathname.includes('/cloud-games/')

  // Reinicia o timestamp se a URL mudou (navegação SPA)
  if (href !== lastUrl) {
    lastUrl = href
    startTimestamp = Math.floor(Date.now() / 1000)
  }

  let gameName: string | null = null
  let gameIcon: string | null = null

  if (isGamePage) {
    // Extrai o nome do jogo da URL
    const rawName = pathname.split('/').pop()?.replace(/-cloud.*|\.html$/i, '') ?? ''
    gameName = rawName
      .split('-')
      .map(word =>
        /^\d+$/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ')

    // Tenta capturar o ícone (pode não estar disponível imediatamente)
    gameIcon = getGameIcon()
  }

  const presenceData: PresenceData = {
    largeImageKey: gameIcon || ActivityAssets.Logo,
    details: isGamePage && gameName ? `Playing ${gameName}` : 'Exploring EasyFun',
    state: isGamePage ? 'Cloud Gaming' : 'Browsing on site',
    startTimestamp,
  }

  // Adiciona o botão apenas na página do jogo
  if (isGamePage) {
    presenceData.buttons = [{ label: 'Play Now', url: href }]
    // Define o smallImageKey como o logo (conforme solicitado)
    presenceData.smallImageKey = ActivityAssets.Logo
  }

  // Log de depuração (opcional)
  console.log('Presence data:', presenceData)

  presence.setActivity(presenceData)
})