const loginForm = document.querySelector('#admin-login');
const secretField = document.querySelector('#admin-secret');
const statusElement = document.querySelector('#admin-status');
const list = document.querySelector('#pending-list');
let adminSecret = '';

function setStatus(text, state = '') {
  statusElement.textContent = text;
  statusElement.dataset.state = state;
}

async function adminRequest(payload) {
  const response = await fetch('/.netlify/functions/approve-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Admin-Secret': adminSecret
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Falha na operação administrativa.');
  return data;
}

function renderPending(messages) {
  list.replaceChildren();
  if (!messages.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Não há mensagens pendentes.';
    list.append(empty);
    return;
  }

  for (const item of messages) {
    const article = document.createElement('article');
    article.className = 'admin-card';
    const heading = document.createElement('h2');
    heading.textContent = item.name;
    const message = document.createElement('p');
    message.textContent = item.message;
    const footer = document.createElement('footer');
    const meta = document.createElement('div');
    meta.className = 'admin-meta';
    const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt));
    meta.textContent = item.city ? `${item.city} • ${date}` : date;
    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'button';
    button.textContent = 'Aprovar mensagem';
    button.addEventListener('click', async () => {
      button.disabled = true;
      setStatus('Aprovando mensagem...');
      try {
        await adminRequest({ id: item.id });
        article.remove();
        setStatus('Mensagem aprovada.', 'success');
        if (!list.children.length) renderPending([]);
      } catch (error) {
        button.disabled = false;
        setStatus(error instanceof Error ? error.message : 'Não foi possível aprovar.', 'error');
      }
    });
    footer.append(meta, button);
    article.append(heading, message, footer);
    list.append(article);
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  adminSecret = secretField.value;
  if (!adminSecret) return;
  setStatus('Carregando mensagens pendentes...');
  try {
    const data = await adminRequest({ action: 'list' });
    secretField.value = '';
    renderPending(data.messages);
    setStatus(`${data.messages.length} mensagem(ns) pendente(s).`, 'success');
  } catch (error) {
    adminSecret = '';
    setStatus(error instanceof Error ? error.message : 'Não foi possível autenticar.', 'error');
  }
});
