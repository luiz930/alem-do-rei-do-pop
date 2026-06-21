import {
  ValidationError,
  createMessage,
  isHoneypotFilled,
  json,
  methodNotAllowed,
  readJson,
  saveMessage,
  validateSubmission
} from './utils/messages.js';

export default async (request) => {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);

  try {
    const payload = await readJson(request);

    // Bots receive a normal success response, but their submission is discarded.
    if (isHoneypotFilled(payload)) {
      return json({ success: true, message: 'Mensagem recebida e enviada para moderação.' }, 202);
    }

    const message = createMessage(validateSubmission(payload));
    await saveMessage(message);

    return json({ success: true, message: 'Mensagem recebida e enviada para moderação.' }, 201);
  } catch (error) {
    if (error instanceof ValidationError) return json({ error: error.message }, error.status);
    console.error('Failed to submit fan message', error);
    return json({ error: 'Não foi possível salvar a mensagem agora.' }, 500);
  }
};
