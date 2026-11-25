const formulario = document.getElementById("formulario-contato");

if (formulario) {
  const app = formulario.dataset.app;
  const appPt = formulario.dataset.appPt ?? app;
  const TEXTOS = {
    pt: {
      nomeVazio: "Informe seu nome.",
      telefoneInvalido: "Informe um número com o código do país e o DDD.",
      mensagemVazia: "Escreva sua mensagem.",
      preparando: "Preparando imagens…",
      anexadas: (n) => (n ? (n === 1 ? "1 imagem anexada." : `${n} imagens anexadas.`) : ""),
      arquivoInvalido: (nome) => `Não foi possível adicionar ${nome}.`,
      remover: "Remover",
      enviar: "Enviar mensagem",
      enviando: "Enviando mensagem…",
      sucesso: "Mensagem enviada. A resposta poderá chegar pelo canal que você escolheu.",
      falha: "Não foi possível enviar. Tente novamente em alguns minutos.",
      exemplos: {
        sugestao: "Acho que o aplicativo poderia melhorar em...",
        erro: "Encontrei um erro quando tentei...",
        agradecimento: "Muito obrigada! O aplicativo me ajudou no dia a dia da seguinte maneira:",
        parcerias: "Olá, Alessandra. Eu gostaria de falar com você sobre uma parceria comercial ou acadêmica.",
        outros: `Olá, Alessandra. Vi ${appPt} online e eu gostaria de conversar com você sobre...`,
      },
    },
    en: {
      nomeVazio: "Enter your name.",
      telefoneInvalido: "Enter a number with its country and area code.",
      mensagemVazia: "Write your message.",
      preparando: "Preparing images…",
      anexadas: (n) => (n ? (n === 1 ? "1 image attached." : `${n} images attached.`) : ""),
      arquivoInvalido: (nome) => `Could not add ${nome}.`,
      remover: "Remove",
      enviar: "Send message",
      enviando: "Sending message…",
      sucesso: "Message sent. You can receive a reply through the channel you chose.",
      falha: "Could not send your message. Please try again in a few minutes.",
      exemplos: {
        sugestao: "I think the app could improve by...",
        erro: "I found a bug when I tried to...",
        agradecimento: "Thank you! The app helped me in my day-to-day life by:",
        parcerias: "Hi Alessandra, I would like to talk about a business or academic partnership.",
        outros: `Hi Alessandra, I saw ${app} online and would like to talk about...`,
      },
    },
  };
  const TELEFONE = /^\+[1-9]\d{7,14}$/;
  const ORCAMENTO_ANEXOS = 3_600_000;
  const textos = () => (document.documentElement.lang.startsWith("pt") ? TEXTOS.pt : TEXTOS.en);

  const campos = formulario.querySelector(".contato-campos");
  const nome = formulario.querySelector("#contato-nome");
  const assunto = formulario.querySelector("#contato-assunto");
  const mensagem = formulario.querySelector("#contato-mensagem");
  const exemplo = formulario.querySelector("#contato-exemplo");
  const canais = formulario.querySelectorAll('input[name="canal"]');
  const campoEmail = formulario.querySelector("#campo-email");
  const campoWhatsapp = formulario.querySelector("#campo-whatsapp");
  const email = formulario.querySelector("#contato-email");
  const telefone = formulario.querySelector("#contato-whatsapp");
  const seletor = formulario.querySelector("#contato-imagens");
  const situacaoAnexos = formulario.querySelector("#contato-anexos-status");
  const errosAnexos = formulario.querySelector("#contato-anexos-erros");
  const lista = formulario.querySelector("#contato-anexos");
  const botao = formulario.querySelector("#contato-enviar");
  const rotulo = botao.querySelector("span") ?? botao;
  const situacao = formulario.querySelector("#contato-status");
  const alerta = formulario.querySelector("#contato-erro");

  let originais = [];
  let imagens = [];
  let ocupado = false;
  let adicionando = false;

  function canalAtual() {
    return formulario.querySelector('input[name="canal"]:checked').value;
  }

  function atualizarExemplo() {
    const texto = assunto.value ? textos().exemplos[assunto.value] : "";
    exemplo.textContent = texto;
    exemplo.hidden = !texto;
    exemplo.classList.toggle("sr-only", mensagem.value.length > 0);
    if (texto) mensagem.setAttribute("aria-describedby", "contato-exemplo");
    else mensagem.removeAttribute("aria-describedby");
  }

  function atualizarCanal() {
    const whatsapp = canalAtual() === "whatsapp";
    campoEmail.hidden = whatsapp;
    campoWhatsapp.hidden = !whatsapp;
    email.disabled = whatsapp;
    telefone.disabled = !whatsapp;
  }

  function desenharAnexos() {
    lista.replaceChildren();
    lista.hidden = imagens.length === 0;
    imagens.forEach((imagem, indice) => {
      const item = document.createElement("li");
      const nome = document.createElement("span");
      nome.textContent = imagem.name;
      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "botao-remover";
      remover.textContent = textos().remover;
      remover.setAttribute("aria-label", `${textos().remover} ${imagem.name}`);
      remover.addEventListener("click", () => removerAnexo(indice));
      item.append(nome, remover);
      lista.append(item);
    });
    situacaoAnexos.textContent = adicionando ? textos().preparando : textos().anexadas(imagens.length);
  }

  function removerAnexo(indice) {
    const botoes = lista.querySelectorAll("button");
    originais = originais.filter((_, posicao) => posicao !== indice);
    imagens = imagens.filter((_, posicao) => posicao !== indice);
    desenharAnexos();
    const restantes = lista.querySelectorAll("button");
    const vizinho = restantes[indice] ?? restantes[indice - 1] ?? seletor;
    if (botoes.length) vizinho.focus();
  }

  async function comprimirAnexos(arquivos, limite) {
    const precisaComprimir = arquivos.reduce((soma, arquivo) => soma + arquivo.size, 0) > limite;
    const alvo = Math.floor(limite / arquivos.length);
    const processados = await Promise.all(
      arquivos.map(async (arquivo) => {
        if (!arquivo.type.startsWith("image/") || !arquivo.size) return null;
        if (!precisaComprimir) return arquivo;
        try {
          const bitmap = await createImageBitmap(arquivo);
          try {
            const quadro = document.createElement("canvas");
            const ctx = quadro.getContext("2d", { alpha: false });
            if (!ctx) return null;
            for (const tamanhoMaximo of [1920, 1280, 960, 720, 480]) {
              const escala = Math.min(1, tamanhoMaximo / Math.max(bitmap.width, bitmap.height));
              quadro.width = Math.max(1, Math.round(bitmap.width * escala));
              quadro.height = Math.max(1, Math.round(bitmap.height * escala));
              ctx.fillStyle = "#fff";
              ctx.fillRect(0, 0, quadro.width, quadro.height);
              ctx.drawImage(bitmap, 0, 0, quadro.width, quadro.height);
              for (const qualidade of [0.85, 0.7, 0.55, 0.4]) {
                const blob = await new Promise((resolve) => quadro.toBlob(resolve, "image/jpeg", qualidade));
                if (blob && blob.size <= alvo) {
                  const nome = arquivo.name.replace(/\.[^.]+$/, "") + ".jpg";
                  return new File([blob], nome, { type: blob.type || "image/jpeg" });
                }
              }
            }
          } finally {
            bitmap.close();
          }
        } catch {
          // Mantém o arquivo fora dos anexos: a compressão não foi possível.
        }
        return null;
      }),
    );
    return {
      imagens: processados.filter(Boolean),
      falhas: arquivos.filter((_, indice) => !processados[indice]),
    };
  }

  seletor.addEventListener("change", async () => {
    const novos = Array.from(seletor.files ?? []);
    seletor.value = "";
    if (!novos.length) return;
    adicionando = true;
    seletor.disabled = true;
    desenharAnexos();
    originais = [...originais, ...novos];
    const { imagens: processadas, falhas } = await comprimirAnexos(originais, ORCAMENTO_ANEXOS);
    originais = originais.filter((arquivo) => !falhas.includes(arquivo));
    imagens = processadas;
    errosAnexos.replaceChildren(
      ...falhas.map((arquivo) => {
        const linha = document.createElement("p");
        linha.textContent = textos().arquivoInvalido(arquivo.name);
        return linha;
      }),
    );
    adicionando = false;
    seletor.disabled = false;
    desenharAnexos();
  });

  nome.addEventListener("input", () => nome.setCustomValidity(""));
  assunto.addEventListener("change", atualizarExemplo);
  mensagem.addEventListener("input", () => {
    mensagem.setCustomValidity(mensagem.value && !mensagem.value.trim() ? textos().mensagemVazia : "");
    exemplo.classList.toggle("sr-only", mensagem.value.length > 0);
  });
  telefone.addEventListener("input", () => telefone.setCustomValidity(""));
  canais.forEach((canal) => canal.addEventListener("change", atualizarCanal));

  function bloquear(estado) {
    campos.disabled = estado;
    botao.setAttribute("aria-disabled", String(estado));
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (ocupado || adicionando) return;

    const nomeInformado = nome.value.trim();
    if (!nomeInformado) {
      nome.setCustomValidity(textos().nomeVazio);
      nome.reportValidity();
      return;
    }
    const canal = canalAtual();
    const numero = telefone.value.trim().replace(/[\s().-]/g, "");
    if (canal === "whatsapp" && !TELEFONE.test(numero)) {
      telefone.setCustomValidity(textos().telefoneInvalido);
      telefone.reportValidity();
      return;
    }
    const texto = mensagem.value.trim();
    if (!texto || !assunto.value) return;

    const dados = new FormData();
    dados.set("nome", nomeInformado);
    dados.set("assunto", assunto.value);
    dados.set("canal", canal);
    dados.set("resposta", canal === "whatsapp" ? numero : email.value.trim());
    dados.set("origem", "");
    dados.set("id", crypto.randomUUID());
    dados.set("site", "");
    dados.set("mensagem", texto);
    imagens.forEach((imagem) => dados.append("attachments[]", imagem, imagem.name));

    ocupado = true;
    bloquear(true);
    alerta.textContent = "";
    situacao.textContent = textos().enviando;
    try {
      const resultado = await fetch("/api/contato", {
        method: "POST",
        body: dados,
        signal: AbortSignal.timeout(45_000),
      });
      if (!resultado.ok || (await resultado.json()).enviado !== true) throw new Error();
      formulario.reset();
      originais = [];
      imagens = [];
      errosAnexos.replaceChildren();
      atualizarCanal();
      atualizarExemplo();
      desenharAnexos();
      rotulo.textContent = textos().enviar;
      bloquear(false);
      situacao.textContent = textos().sucesso;
    } catch {
      situacao.textContent = "";
      alerta.textContent = textos().falha;
      rotulo.textContent = textos().enviar;
      bloquear(false);
    } finally {
      ocupado = false;
    }
  });

  atualizarCanal();
  atualizarExemplo();
  desenharAnexos();
}
