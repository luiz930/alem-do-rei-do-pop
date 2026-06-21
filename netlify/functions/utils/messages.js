import { getStore } from '@netlify/blobs';
import { randomUUID, timingSafeEqual } from 'node:crypto';

const STORE_NAME = 'fan-messages';
const MESSAGES_KEY = 'messages';
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HTML_PATTERN = /<\/?[a-z][^>]*>/i;
const LINK_PATTERN = /\b(?:https?:\/\/|www\.)\S+|\b[\w-]+(?:\.[\w-]+)+(?:\/\S*)?/gi;
const SENSITIVE_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:\+?\d[\d\s().-]{7,}\d)/i;

export function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

export function methodNotAllowed(methods) {
  return json({ error: 'Método não permitido.' }, 405, { Allow: methods.join(', ') });
}

export async function readJson(request) {
  const contentType = request.headers.get('content-type') || '';
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (!contentType.toLowerCase().includes('application/json')) throw new ValidationError('Envie os dados em formato JSON.', 415);
  if (contentLength > 20_000) throw new ValidationError('Corpo da requisição muito grande.', 413);
  try {
    return await request.json();
  } catch {
    throw new ValidationError('JSON inválido.');
  }
}

function sanitizeText(value) {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function validateText(value, field, maxLength, { optional = false, multiline = false } = {}) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') throw new ValidationError(`${field} inválido.`);
  if (value.length > maxLength) throw new ValidationError(`${field} deve ter no máximo ${maxLength} caracteres.`);
  if (HTML_PATTERN.test(value)) throw new ValidationError(`${field} não pode conter HTML.`);
  const clean = sanitizeText(value);
  if (!optional && !clean) throw new ValidationError(`${field} é obrigatório.`);
  if (!multiline && /[\r\n]/.test(clean)) throw new ValidationError(`${field} deve ocupar uma única linha.`);
  return clean;
}

export function validateSubmission(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new ValidationError('Dados inválidos.');
  const name = validateText(payload.name, 'Nome', 80);
  const city = validateText(payload.city, 'Cidade', 80, { optional: true });
  const message = validateText(payload.message, 'Mensagem', 1000, { multiline: true });
  const links = message.match(LINK_PATTERN) || [];
  if (links.length > 2) throw new ValidationError('A mensagem pode conter no máximo dois links.');
  if ((name.match(LINK_PATTERN) || []).length || (city.match(LINK_PATTERN) || []).length) {
    throw new ValidationError('Nome e cidade não podem conter links.');
  }
  if (SENSITIVE_PATTERN.test(`${name}\n${city}\n${message}`)) {
    throw new ValidationError('Remova e-mails, telefones, documentos ou outros dados numéricos sensíveis.');
  }
  return { name, city, message };
}

export function isHoneypotFilled(payload) {
  return typeof payload?.website === 'string' && payload.website.trim().length > 0;
}

export function createMessage(fields) {
  return {
    id: randomUUID(),
    ...fields,
    approved: false,
    createdAt: new Date().toISOString()
  };
}

export function getMessagesStore() {
  return getStore(STORE_NAME);
}

function validateId(id) {
  if (!ID_PATTERN.test(id)) throw new ValidationError('ID de mensagem inválido.');
  return id;
}

async function updateMessages(mutator) {
  const store = getMessagesStore();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const entry = await store.getWithMetadata(MESSAGES_KEY, { type: 'json', consistency: 'strong' });
    const messages = Array.isArray(entry?.data?.messages) ? entry.data.messages : [];
    const update = mutator(messages);
    if (!update.changed) return update.value;
    const result = entry
      ? await store.setJSON(MESSAGES_KEY, { messages: update.messages }, { onlyIfMatch: entry.etag })
      : await store.setJSON(MESSAGES_KEY, { messages: update.messages }, { onlyIfNew: true });
    if (result.modified) return update.value;
    await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
  }
  throw new Error('Could not update messages after concurrent writes');
}

export async function saveMessage(message) {
  return updateMessages((messages) => ({ changed: true, messages: [message, ...messages] }));
}

export async function approveMessage(id) {
  validateId(id);
  return updateMessages((messages) => {
    const index = messages.findIndex((message) => message?.id === id);
    if (index === -1) return { changed: false, value: 'not-found' };
    if (messages[index].approved === true) return { changed: false, value: 'already-approved' };
    const updated = [...messages];
    updated[index] = { ...updated[index], approved: true };
    return { changed: true, messages: updated, value: 'approved' };
  });
}

export async function readAllMessages() {
  const data = await getMessagesStore().get(MESSAGES_KEY, { type: 'json', consistency: 'strong' });
  return Array.isArray(data?.messages) ? data.messages.filter((entry) => entry && typeof entry === 'object') : [];
}

export function publicMessage(message) {
  return {
    id: message.id,
    name: message.name,
    city: message.city,
    message: message.message,
    createdAt: message.createdAt
  };
}

export function requireAdmin(request) {
  const configuredSecret = process.env.ADMIN_SECRET;
  if (!configuredSecret || configuredSecret.length < 24) throw new AuthError('Moderação não configurada.', 503);
  const headerSecret = request.headers.get('x-admin-secret') || '';
  const provided = Buffer.from(headerSecret);
  const expected = Buffer.from(configuredSecret);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) throw new AuthError('Não autorizado.', 401);
}

export class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
