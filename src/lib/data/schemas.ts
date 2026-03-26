import { z } from "zod";

/**
 * Zod schemas for validating raw webhook responses from each of the 4 groups.
 * Uses z.looseObject() for metadado to preserve unknown fields (webhook fields
 * may evolve and we should not strip data we don't explicitly know about).
 */

/** Parses metadado: accepts both a plain object and a JSON-encoded string (n8n serializes objects as strings) */
const metadadoField = z.preprocess(
  (val) => (typeof val === "string" ? JSON.parse(val) : val),
  z.looseObject({})
);

/**
 * Grupo 1: Handover Aquisicao, Handover Monetizacao, BANT
 * metadado is a looseObject -- different projects within the group have different keys
 */
export const grupo1Schema = z.object({
  project_id: z.string(),
  data: z.string(),
  id_kommo: z.string(),
  status: z.string(),
  metadado: metadadoField,
});

/**
 * Grupo 2: Sales Coach AI, Account Coach AI
 * Includes email, tag, and score fields
 */
export const grupo2Schema = z.object({
  project_id: z.string(),
  data: z.string(),
  tag: z.string(),
  email: z.string(),
  score: z.string(),
  metadado: metadadoField,
});

/**
 * Grupo 3: Auditoria do Saber
 * Includes fase and status_id fields
 */
export const grupo3Schema = z.object({
  project_id: z.string(),
  data: z.string(),
  id_kommo: z.string(),
  status_id: z.string(),
  fase: z.string(),
  status: z.string(),
  metadado: metadadoField,
});

/**
 * Grupo 4: Banco de Dados de Midia
 * NOTE: Uses "date" field (not "data" like other groups).
 * Has NO metadado -- uses status array of strings instead.
 */
export const grupo4Schema = z.object({
  project_id: z.string(),
  date: z.string(),
  client_name: z.string(),
  ekyte_id: z.string(),
  account_id: z.string(),
  type: z.string(),
  status: z.string(),
  plataforma: z.string(),
});
