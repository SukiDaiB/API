const url = "https://valorant-api.com/v1/agents?language=pt-BR&isPlayableCharacter=true";
let agentes = [];
let funcaoAtiva = "todos";

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Busca os agentes uma única vez quando a página abre.
async function carregarAgentes() {
  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Erro na resposta da API");
    }

    const resultado = await resposta.json();

    if (!Array.isArray(resultado.data) || resultado.data.length === 0) {
      throw new Error("Dados inválidos");
    }

    agentes = resultado.data;
    adicionarIconesDasFuncoes();
    mostrarAgentes();
  } catch (erro) {
    console.error(erro);
    const status = document.getElementById("status");
    status.textContent = "Não foi possível carregar os agentes. Verifique sua conexão.";
    status.classList.add("error");
  }
}

// Monta os cards usando os agentes guardados no array.
function mostrarAgentes() {
  let cards = "";
  const pesquisa = normalizarTexto(document.getElementById("agent-search").value.trim());
  const agentesFiltrados = agentes.filter(function (agente) {
    const nome = normalizarTexto(agente.displayName || "");
    const funcao = normalizarTexto(agente.role?.displayName || "");

    return nome.includes(pesquisa) && (funcaoAtiva === "todos" || funcao === funcaoAtiva);
  });

  for (const agente of agentesFiltrados) {
    const indice = agentes.indexOf(agente);
    const nome = agente.displayName || "Agente sem nome";

    cards += `
      <button class="agent-card" type="button" onclick="mostrarDetalhes(${indice})">
        <img src="${agente.displayIcon || ""}" alt="Retrato de ${nome}" onerror="this.hidden=true">
        <strong>${nome}</strong>
      </button>`;
  }

  document.getElementById("agents-grid").innerHTML = cards;
  const status = document.getElementById("status");
  status.textContent = "Nenhum agente encontrado.";
  status.classList.remove("error");
  status.hidden = agentesFiltrados.length > 0;
}

function adicionarIconesDasFuncoes() {
  document.querySelectorAll(".role-filter[data-role]:not([data-role='todos'])").forEach(function (botao) {
    const agente = agentes.find(function (item) {
      return normalizarTexto(item.role?.displayName || "") === botao.dataset.role;
    });
    const icone = botao.querySelector("img");

    if (agente?.role?.displayIcon) {
      icone.src = agente.role.displayIcon;
    } else {
      icone.hidden = true;
    }
  });
}

// Preenche a tela de detalhes com o agente escolhido.
function mostrarDetalhes(indice) {
  const agente = agentes[indice];
  const nome = agente.displayName || "Agente sem nome";
  const funcao = agente.role || {};
  const habilidades = Array.isArray(agente.abilities) ? agente.abilities : [];

  document.getElementById("agent-name").textContent = nome;
  document.getElementById("agent-description").textContent = agente.description || "Descrição não disponível.";
  document.getElementById("role-name").textContent = funcao.displayName || "Função não informada";

  const imagemAgente = document.getElementById("agent-image");
  imagemAgente.src = agente.fullPortrait || agente.displayIcon || "";
  imagemAgente.alt = `Imagem de ${nome}`;
  imagemAgente.hidden = !imagemAgente.src;
  imagemAgente.onerror = function () {
    this.hidden = true;
  };

  const iconeFuncao = document.getElementById("role-icon");
  iconeFuncao.src = funcao.displayIcon || "";
  iconeFuncao.alt = `Ícone da função ${funcao.displayName || ""}`;
  iconeFuncao.hidden = !iconeFuncao.src;
  iconeFuncao.onerror = function () {
    this.hidden = true;
  };

  let cardsHabilidades = "";

  for (const habilidade of habilidades) {
    cardsHabilidades += `
      <article class="ability-card">
        <img src="${habilidade.displayIcon || ""}" alt="Ícone de ${habilidade.displayName || "habilidade"}" onerror="this.hidden=true">
        <h3>${habilidade.displayName || "Habilidade sem nome"}</h3>
        <p>${habilidade.description || "Descrição não disponível."}</p>
      </article>`;
  }

  document.getElementById("abilities-list").innerHTML =
    cardsHabilidades || "<p>Nenhuma habilidade disponível.</p>";
  document.getElementById("selection-view").hidden = true;
  document.getElementById("details-view").hidden = false;
  window.scrollTo(0, 0);
}

function voltarParaSelecao() {
  document.getElementById("details-view").hidden = true;
  document.getElementById("selection-view").hidden = false;
  window.scrollTo(0, 0);
}

document.getElementById("back-button").addEventListener("click", voltarParaSelecao);
document.getElementById("agent-search").addEventListener("input", mostrarAgentes);
document.querySelectorAll(".role-filter").forEach(function (botao) {
  botao.addEventListener("click", function () {
    funcaoAtiva = botao.dataset.role;

    document.querySelectorAll(".role-filter").forEach(function (item) {
      const ativo = item === botao;
      item.classList.toggle("active", ativo);
      item.setAttribute("aria-pressed", ativo);
    });

    mostrarAgentes();
  });
});
document.querySelector(".brand").addEventListener("click", function (evento) {
  evento.preventDefault();
  voltarParaSelecao();
});
carregarAgentes();
