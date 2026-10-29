"use strict";

const html = document.documentElement;


function lerPreferencia(chave) {
  try {
    return window.localStorage.getItem(chave);
  } catch (erro) {
    return null;
  }
}

function salvarPreferencia(chave, valor) {
  try {
    window.localStorage.setItem(chave, valor);
  } catch (erro) {
  }
}


const emPortugues = html.lang === "pt-BR";

const TEXTOS = emPortugues
  ? { ligadas: "Ligadas", desligadas: "Desligadas", sistema: " (seu dispositivo está configurado para reduzir movimento)" }
  : { ligadas: "On", desligadas: "Off", sistema: " (your device is set to reduce motion)" };


const sistemaReduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

function animacoesPermitidas() {
  return !sistemaReduzMovimento.matches && html.dataset.animacoes !== "desligadas";
}

function atualizarBotaoAnimacoes() {
  const botao = document.getElementById("botao-animacoes");
  const estado = document.getElementById("botao-animacoes-estado");
  const avisoSistema = document.getElementById("botao-animacoes-sistema");
  const ligadas = animacoesPermitidas();

  botao.setAttribute("aria-pressed", ligadas ? "true" : "false");
  estado.textContent = ligadas ? TEXTOS.ligadas : TEXTOS.desligadas;

  if (sistemaReduzMovimento.matches) {
    botao.setAttribute("aria-disabled", "true");
    avisoSistema.textContent = TEXTOS.sistema;
  } else {
    botao.removeAttribute("aria-disabled");
    avisoSistema.textContent = "";
  }
}

function definirAnimacoes(ligadas) {
  html.dataset.animacoes = ligadas ? "ligadas" : "desligadas";
  atualizarBotaoAnimacoes();
}

function iniciarAnimacoes() {
  const botao = document.getElementById("botao-animacoes");

  const salvo = lerPreferencia("magic-luna-animacoes");
  definirAnimacoes(salvo !== "desligadas" && !sistemaReduzMovimento.matches);

  botao.addEventListener("click", function () {
    if (sistemaReduzMovimento.matches) {
      return;
    }
    const ligar = html.dataset.animacoes === "desligadas";
    definirAnimacoes(ligar);
    salvarPreferencia("magic-luna-animacoes", ligar ? "ligadas" : "desligadas");
  });

  sistemaReduzMovimento.addEventListener("change", function () {
    const salvoAgora = lerPreferencia("magic-luna-animacoes");
    definirAnimacoes(salvoAgora !== "desligadas" && !sistemaReduzMovimento.matches);
  });
}


function sorteioComSemente(semente) {
  return function () {
    semente = (semente + 0x6D2B79F5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function criarEstrelas() {
  const ceu = document.getElementById("estrelas");
  if (!ceu) {
    return;
  }

  const sortear = sorteioComSemente(2026);
  const area = window.innerWidth * window.innerHeight;
  const quantidade = Math.min(90, Math.max(35, Math.round(area / 16000)));
  const fragmento = document.createDocumentFragment();

  for (let i = 0; i < quantidade; i += 1) {
    const estrela = document.createElement("span");
    estrela.className = "estrela";
    estrela.style.left = (sortear() * 100).toFixed(2) + "%";
    estrela.style.top = (sortear() * 100).toFixed(2) + "%";
    estrela.style.setProperty("--tamanho", (1 + sortear() * 2).toFixed(1) + "px");
    estrela.style.setProperty("--brilho", (0.35 + sortear() * 0.55).toFixed(2));
    estrela.style.setProperty("--duracao", (3 + sortear() * 5).toFixed(1) + "s");
    estrela.style.setProperty("--atraso", (-sortear() * 8).toFixed(1) + "s");
    estrela.style.setProperty("--dx", ((sortear() - 0.5) * 120).toFixed(0) + "px");
    estrela.style.setProperty("--dy", ((sortear() - 0.5) * 120).toFixed(0) + "px");
    estrela.style.setProperty("--passeio", (25 + sortear() * 30).toFixed(0) + "s");
    fragmento.appendChild(estrela);
  }

  for (let i = 0; i < 9; i += 1) {
    const brilho = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const uso = document.createElementNS("http://www.w3.org/2000/svg", "use");
    uso.setAttribute("href", "#icone-brilho");
    brilho.appendChild(uso);
    brilho.setAttribute("class", "estrela-brilho");
    brilho.style.left = (sortear() * 96).toFixed(2) + "%";
    brilho.style.top = (sortear() * 96).toFixed(2) + "%";
    brilho.style.setProperty("--tamanho", (8 + sortear() * 10).toFixed(0) + "px");
    brilho.style.setProperty("--duracao", (4 + sortear() * 4).toFixed(1) + "s");
    brilho.style.setProperty("--atraso", (-sortear() * 8).toFixed(1) + "s");
    brilho.style.setProperty("--dx", ((sortear() - 0.5) * 160).toFixed(0) + "px");
    brilho.style.setProperty("--dy", ((sortear() - 0.5) * 160).toFixed(0) + "px");
    brilho.style.setProperty("--passeio", (30 + sortear() * 30).toFixed(0) + "s");
    fragmento.appendChild(brilho);
  }

  ceu.appendChild(fragmento);
}


function iniciarMenu() {
  const botaoMenu = document.getElementById("botao-menu");
  const botaoFechar = document.getElementById("botao-fechar");
  const menu = document.getElementById("menu-principal");
  const fundo = document.getElementById("menu-fundo");
  const telaGrande = window.matchMedia("(min-width: 75em)");

  const partesForaDoMenu = [
    document.querySelector(".pular-conteudo"),
    document.querySelector("#topo .logo"),
    document.getElementById("conteudo"),
    document.querySelector(".rodape"),
    document.getElementById("voltar-topo")
  ];

  function menuEstaAberto() {
    return menu.classList.contains("aberto");
  }

  function sincronizarMenu() {
    menu.inert = !telaGrande.matches && !menuEstaAberto();
  }

  function abrirMenu() {
    menu.classList.add("aberto");
    sincronizarMenu();
    fundo.hidden = false;
    botaoMenu.setAttribute("aria-expanded", "true");
    partesForaDoMenu.forEach(function (parte) {
      if (parte) { parte.inert = true; }
    });
    botaoMenu.inert = true;
    document.body.style.overflow = "hidden";
    botaoFechar.focus();
  }

  function fecharMenu(devolverFoco) {
    if (!menuEstaAberto()) {
      return;
    }
    menu.classList.remove("aberto");
    sincronizarMenu();
    fundo.hidden = true;
    botaoMenu.setAttribute("aria-expanded", "false");
    partesForaDoMenu.forEach(function (parte) {
      if (parte) { parte.inert = false; }
    });
    botaoMenu.inert = false;
    document.body.style.overflow = "";
    if (devolverFoco) {
      botaoMenu.focus();
    }
  }

  botaoMenu.addEventListener("click", abrirMenu);
  botaoFechar.addEventListener("click", function () { fecharMenu(true); });
  fundo.addEventListener("click", function () { fecharMenu(true); });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { fecharMenu(false); });
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menuEstaAberto()) {
      fecharMenu(true);
    }
  });

  telaGrande.addEventListener("change", function () {
    if (telaGrande.matches) {
      fecharMenu(false);
    }
    sincronizarMenu();
  });

  sincronizarMenu();
}


function iniciarRevelar() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const elementos = document.querySelectorAll(".revelar");
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("revelado");
        observador.unobserve(entrada.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });

  elementos.forEach(function (elemento) {
    observador.observe(elemento);
  });

  html.classList.add("revelar-ativo");
}


function iniciarVoltarTopo() {
  const botao = document.getElementById("voltar-topo");
  const topo = document.getElementById("topo");
  if (!botao || !("IntersectionObserver" in window)) {
    return;
  }

  botao.hidden = false;

  const marcas = [];
  document.querySelectorAll("main section").forEach(function (secao) {
    const marca = document.createElement("div");
    marca.className = "fim-secao";
    marca.setAttribute("aria-hidden", "true");
    secao.appendChild(marca);
    marcas.push(marca);
  });

  const marcasNaZona = new Set();

  function atualizarSeta() {
    const longeDoTopo = window.scrollY > window.innerHeight * 0.5;
    const fimDaPagina = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const emUso = botao.matches(":hover") || botao.contains(document.activeElement);
    const mostrar = ((marcasNaZona.size > 0 || fimDaPagina) && longeDoTopo) || (emUso && window.scrollY >= 80);
    botao.classList.toggle("visivel", mostrar);
  }

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        marcasNaZona.add(entrada.target);
      } else {
        marcasNaZona.delete(entrada.target);
      }
    });
    atualizarSeta();
  }, { rootMargin: "-60% 0px 0px 0px" });

  marcas.forEach(function (marca) {
    observador.observe(marca);
  });

  let aguardando = false;
  window.addEventListener("scroll", function () {
    if (aguardando) {
      return;
    }
    aguardando = true;
    window.requestAnimationFrame(function () {
      atualizarSeta();
      aguardando = false;
    });
  }, { passive: true });

  botao.addEventListener("mouseleave", atualizarSeta);
  botao.addEventListener("blur", atualizarSeta);

  botao.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: animacoesPermitidas() ? "smooth" : "auto" });
    topo.focus({ preventScroll: true });
  });
}


function iniciarPerguntas() {
  const perguntas = document.querySelectorAll(".perguntas details");
  perguntas.forEach(function (pergunta) {
    pergunta.addEventListener("toggle", function () {
      if (!pergunta.open) {
        return;
      }
      perguntas.forEach(function (outra) {
        if (outra !== pergunta && outra.open) {
          outra.open = false;
        }
      });
    });
  });
}


document.addEventListener("DOMContentLoaded", function () {
  iniciarAnimacoes();
  iniciarPerguntas();
  criarEstrelas();
  iniciarMenu();
  iniciarRevelar();
  iniciarVoltarTopo();
});

