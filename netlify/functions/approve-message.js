import {
  AuthError,
  ValidationError,
  approveMessage,
  json,
  methodNotAllowed,
  publicMessage,
  readAllMessages,
  readJson,
  requireAdmin
} from './utils/messages.js';

export default async (request) => {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);

  try {
    requireAdmin(request);
    const payload = await readJson(request);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new ValidationError('Dados inválidos.');

    if (payload.action === 'list') {
      const messages = (await readAllMessages())
        .filter((message) => message.approved !== true)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .map(publicMessage);
      return json({ messages });
    }

    if (typeof payload.id !== 'string') throw new ValidationError('ID de mensagem obrigatório.');
    const result = await approveMessage(payload.id);
    if (result === 'not-found') return json({ error: 'Mensagem não encontrada.' }, 404);
    if (result === 'already-approved') return json({ success: true, message: 'Mensagem já estava aprovada.' });
    return json({ success: true, message: 'Mensagem aprovada.' });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthError) return json({ error: error.message }, error.status);
    console.error('Failed to moderate fan message', error);
    return json({ error: 'Não foi possível concluir a moderação.' }, 500);
  }
};
