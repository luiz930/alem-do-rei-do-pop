const form = document.querySelector('#fan-message-form');
const statusElement = document.querySelector('#form-status');
const submitButton = form?.querySelector('button[type="submit"]');
const messageField = form?.querySelector('#message');
const messageCount = document.querySelector('#message-count');
const cards = document.querySelector('#message-cards');

function setStatus(text, state = '') {
  if (!statusElement) return;
  statusElement.textContent = text;
  statusElement.dataset.state = state;
}

function updateCount() {
  if (messageField && messageCount) messageCount.textContent = String(messageField.value.length);
}

function createMessageCard(item) {
  const article = document.createElement('article');
  article.className = 'message-card';

  const quote = document.createElement('span');
  quote.className = 'quote-mark';
  quote.setAttribute('aria-hidden', 'true');
  quote.textContent = '“';

  const text = document.createElement('p');
  text.className = 'message-text';
  text.textContent = item.message;

  const footer = document.createElement('footer');
  footer.className = 'message-meta';
  const name = document.createElement('div');
  name.className = 'message-name';
  name.textContent = item.name;
  const place = document.createElement('div');
  place.className = 'message-place';
  const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(item.createdAt));
  place.textContent = item.city ? `${item.city} • ${date}` : date;

  footer.append(name, place);
  article.append(quote, text, footer);
  return article;
}

async function loadMessages() {
  if (!cards) return;
  try {
    const response = await fetch('/.netlify/functions/list-messages', { headers: { Accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as mensagens.');
    cards.replaceChildren();
    if (!data.messages.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'Ainda não há mensagens aprovadas. Seja a primeira pessoa a enviar uma homenagem.';
      cards.append(empty);
      return;
    }
    cards.append(...data.messages.map(createMessageCard));
  } catch {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Não foi possível carregar as mensagens agora. Tente novamente mais tarde.';
    cards.replaceChildren(empty);
  }
}

messageField?.addEventListener('input', updateCount);

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    city: formData.get('city'),
    message: formData.get('message'),
    website: formData.get('website')
  };

  submitButton.disabled = true;
  setStatus('Enviando mensagem...');

  try {
    const response = await fetch('/.netlify/functions/submit-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível enviar a mensagem.');
    form.reset();
    updateCount();
    setStatus(data.message, 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.', 'error');
  } finally {
    submitButton.disabled = false;
  }
});

updateCount();
loadMessages();
