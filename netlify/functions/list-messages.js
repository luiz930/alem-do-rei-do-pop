import { json, methodNotAllowed, publicMessage, readAllMessages } from './utils/messages.js';

export default async (request) => {
  if (request.method !== 'GET') return methodNotAllowed(['GET']);

  try {
    const messages = (await readAllMessages())
      .filter((message) => message.approved === true)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map(publicMessage);
    return json({ messages });
  } catch (error) {
    console.error('Failed to list approved fan messages', error);
    return json({ error: 'Não foi possível carregar as mensagens agora.' }, 500);
  }
};
