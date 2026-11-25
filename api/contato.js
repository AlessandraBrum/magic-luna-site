const ASSUNTOS = {
  sugestao: 'Sugestões de melhorias',
  erro: 'Reportar erro',
  agradecimento: 'Agradecimento',
  parcerias: 'Parcerias',
  outros: 'Outros',
}
const LIMITE_REQUISICAO = 4_200_000
const LIMITE_ANEXO = 3_600_000
const LIMITE_TOTAL_ANEXOS = 3_700_000
const MAX_ANEXOS = 20

function json(status, dados = {}) {
  return Response.json(dados, { status, headers: { 'Cache-Control': 'no-store' } })
}

function nomeSeguro(nome) {
  return nome.replace(/[\x00-\x1f\x7f/\\]/g, '_').slice(0, 240)
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json(405)
    if (request.headers.get('origin') !== new URL(request.url).origin) return json(403)
    if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) return json(415)

    const tamanho = Number(request.headers.get('content-length'))
    if (!Number.isSafeInteger(tamanho) || tamanho <= 0 || tamanho > LIMITE_REQUISICAO) return json(413)
    const endpoint = process.env.CONTATO_BASIN_URL?.trim()
    if (!endpoint || !/^https:\/\/usebasin\.com\/f\/[a-z\d]+$/i.test(endpoint)) return json(503)

    let dados
    try {
      dados = await request.formData()
    } catch {
      return json(400)
    }

    const nome = dados.get('nome')
    if (nome !== null && (typeof nome !== 'string' || !nome.trim() || nome.length > 120)) return json(400)

    const assunto = dados.get('assunto')
    const canal = dados.get('canal')
    const resposta = dados.get('resposta')
    const mensagem = dados.get('mensagem')
    const anexos = dados.getAll('attachments[]')
    const origem = dados.get('origem')
    const id = dados.get('id')
    const site = dados.get('site')
    if (typeof assunto !== 'string' || !Object.hasOwn(ASSUNTOS, assunto) ||
      typeof resposta !== 'string' || resposta.length > 254 ||
      typeof origem !== 'string' || origem.length > 4000 ||
      typeof id !== 'string' || !/^[a-f\d-]{36}$/.test(id) ||
      (site !== null && site !== '')) return json(400)
    if (canal === 'email') {
      if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(resposta)) return json(400)
    } else if (canal !== 'whatsapp' || !/^\+[1-9]\d{7,14}$/.test(resposta)) {
      return json(400)
    }
    if (typeof mensagem !== 'string' || mensagem.length === 0 || mensagem.length > 100_000) return json(400)
    if (!Array.isArray(anexos) || anexos.length > MAX_ANEXOS) return json(400)
    let somaAnexos = 0
    for (const anexo of anexos) {
      if (!(anexo instanceof File) || !anexo.type.startsWith('image/') ||
        anexo.size === 0 || anexo.size > LIMITE_ANEXO) return json(400)
      somaAnexos += anexo.size
    }
    if (somaAnexos > LIMITE_TOTAL_ANEXOS) return json(400)

    const envio = new FormData()
    if (nome) envio.set('nome', nome.trim())
    envio.set('assunto', ASSUNTOS[assunto])
    envio.set('protocolo', id)
    envio.set('mensagem', mensagem)
    envio.set(canal === 'email' ? 'email' : 'whatsapp', resposta)
    if (origem) envio.set('origem', origem)
    anexos.forEach((anexo, indice) => envio.append('attachments[]', anexo, nomeSeguro(anexo.name) || `imagem-${indice + 1}.jpg`))

    try {
      const resultado = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', Origin: new URL(request.url).origin },
        redirect: 'error',
        signal: AbortSignal.timeout(25_000),
        body: envio,
      })
      if (!resultado.ok) return json(502)
      return json(200, { enviado: true })
    } catch {
      return json(502)
    }
  },
}
