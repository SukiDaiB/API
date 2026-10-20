const valorantApi = "https://valorant-api.com/v1";
const logsApi = "https://www.piway.com.br/unoesc/api";
const matricula = "463274";

let agentes = [];
let funcaoAtiva = "Todos";

async function registrarLog(metodo, resultado) {
  const url = `${logsApi}/inserir/log/${encodeURIComponent(matricula)}/Valorant API/${encodeURIComponent(metodo)}/${encodeURIComponent(resultado)}`;
  await fetch(url);
}

async function carregarAgentes() {
  const status = document.getElementById("status");
  status.hidden = false;
  status.textContent = "Carregando agentes...";

  try {
    const resposta = await fetch(`${valorantApi}/agents?language=pt-BR&isPlayableCharacter=true`);
    const resultado = await resposta.json();
    agentes = resultado.data;

    await registrarLog("Listar agentes com filtros", `${agentes.length} agentes`);
    mostrarAgentes();
    carregarResumo();
  } catch (erro) {
    status.textContent = "Não foi possível carregar os agentes.";
    status.classList.add("error");
  }
}

async function carregarResumo() {
  try {
    const resposta = await fetch(`${valorantApi}/agents`);
    const resultado = await resposta.json();
    const total = resultado.data.length;

    document.getElementById("api-summary").textContent = `A API possui ${total} registros.`;
    await registrarLog("Listar agentes sem filtros", `${total} registros`);
  } catch (erro) {
    document.getElementById("api-summary").textContent = "";
  }
}

function mostrarAgentes() {
  const pesquisa = document.getElementById("agent-search").value.trim().toLowerCase();
  const filtrados = agentes.filter(function (agente) {
    const nomeCorresponde = agente.displayName.toLowerCase().includes(pesquisa);
    const funcaoCorresponde = funcaoAtiva === "Todos" || agente.role.displayName === funcaoAtiva;
    return nomeCorresponde && funcaoCorresponde;
  });

  let cards = "";

  for (const agente of filtrados) {
    cards += `
      <button class="agent-card" type="button" onclick="mostrarDetalhes('${agente.uuid}')">
        <img src="${agente.displayIcon}" alt="Retrato de ${agente.displayName}">
        <strong>${agente.displayName}</strong>
      </button>`;
  }

  document.getElementById("agents-grid").innerHTML = cards;
  const status = document.getElementById("status");
  status.textContent = "Nenhum agente encontrado.";
  status.classList.remove("error");
  status.hidden = filtrados.length > 0;
}

async function mostrarDetalhes(uuid) {
  try {
    const resposta = await fetch(`${valorantApi}/agents/${uuid}?language=pt-BR`);
    const resultado = await resposta.json();
    const agente = resultado.data;

    await registrarLog("Buscar agente por ID", agente.displayName);

    document.getElementById("agent-name").textContent = agente.displayName;
    document.getElementById("agent-description").textContent = agente.description;
    document.getElementById("role-name").textContent = agente.role.displayName;
    document.getElementById("agent-image").src = agente.fullPortrait;
    document.getElementById("agent-image").alt = `Imagem de ${agente.displayName}`;
    document.getElementById("role-icon").src = agente.role.displayIcon;
    document.getElementById("role-icon").alt = `Ícone da função ${agente.role.displayName}`;

    let habilidades = "";
    for (const habilidade of agente.abilities) {
      habilidades += `
        <article class="ability-card">
          <img src="${habilidade.displayIcon || ""}" alt="">
          <h3>${habilidade.displayName}</h3>
          <p>${habilidade.description}</p>
        </article>`;
    }

    document.getElementById("abilities-list").innerHTML = habilidades;
    document.getElementById("selection-view").hidden = true;
    document.getElementById("details-view").hidden = false;
    window.scrollTo(0, 0);
  } catch (erro) {
    alert("Não foi possível carregar os detalhes do agente.");
  }
}

async function carregarMapas() {
  const status = document.getElementById("maps-status");
  status.hidden = false;
  status.textContent = "Carregando mapas...";

  try {
    const resposta = await fetch(`${valorantApi}/maps?language=pt-BR`);
    const resultado = await resposta.json();
    const mapas = resultado.data;
    let cards = "";

    await registrarLog("Listar mapas", `${mapas.length} mapas`);

    for (const mapa of mapas) {
      cards += `
        <article class="map-card">
          <img src="${mapa.splash}" alt="Mapa ${mapa.displayName}">
          <strong>${mapa.displayName}</strong>
        </article>`;
    }

    document.getElementById("maps-list").innerHTML = cards;
    status.hidden = true;
  } catch (erro) {
    status.textContent = "Não foi possível carregar os mapas.";
  }
}

function voltarParaSelecao() {
  document.getElementById("details-view").hidden = true;
  document.getElementById("selection-view").hidden = false;
  window.scrollTo(0, 0);
}

async function carregarLogs() {
  const status = document.getElementById("logs-status");
  status.hidden = false;
  status.textContent = "Carregando logs...";

  try {
    const resposta = await fetch(`${logsApi}/logs/${matricula}`);
    const logs = await resposta.json();
    let itens = "";

    for (const log of logs) {
      itens += `
        <article class="log-item">
          <div>
            <strong>${log.metodo}</strong>
            <p>${log.log} — ${log.resultado}</p>
          </div>
          <button class="delete-log" type="button" onclick="excluirLog(${log.idlog})">Excluir</button>
        </article>`;
    }

    document.getElementById("logs-list").innerHTML = itens;
    status.textContent = logs.length ? "" : "Nenhum log registrado.";
    status.hidden = logs.length > 0;
  } catch (erro) {
    status.textContent = "Não foi possível carregar os logs.";
  }
}

async function excluirLog(id) {
  try {
    await fetch(`${logsApi}/excluir/log/${id}/aluno/${matricula}`);
    carregarLogs();
  } catch (erro) {
    alert("Não foi possível excluir o log.");
  }
}

document.getElementById("load-logs-button").addEventListener("click", carregarLogs);
document.getElementById("load-maps-button").addEventListener("click", carregarMapas);
document.getElementById("back-button").addEventListener("click", voltarParaSelecao);
document.getElementById("agent-search").addEventListener("input", mostrarAgentes);

document.querySelectorAll(".role-filter").forEach(function (botao) {
  botao.addEventListener("click", function () {
    funcaoAtiva = botao.textContent.trim();

    document.querySelectorAll(".role-filter").forEach(function (item) {
      item.classList.toggle("active", item === botao);
    });

    mostrarAgentes();
  });
});

document.querySelector(".brand").addEventListener("click", function (evento) {
  evento.preventDefault();
  voltarParaSelecao();
});

carregarAgentes();
