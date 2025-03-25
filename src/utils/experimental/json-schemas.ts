import type { FromSchema, JSONSchema } from "json-schema-to-ts";

export const testParamsSchema = {
  type: "object",
  required: ["parStr", "parNum"],
  properties: {
    parStr: { type: "string" },
    parNum: { type: "number" },
  },
} as const satisfies JSONSchema;
export type TestParamsSchema = FromSchema<typeof testParamsSchema>;

export const testQsSchema = {
  type: "object",
  required: ["name", "age"],
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
} as const satisfies JSONSchema;
export type TestQsSchema = FromSchema<typeof testQsSchema>;

export const testBodySchema = {
  type: "object",
  required: ["str", "num", "bool"],
  properties: {
    str: { type: "string" },
    num: { type: "number" },
    bool: { type: "boolean" },
  },
} as const satisfies JSONSchema;
export type TestBodySchema = FromSchema<typeof testBodySchema>;

export const responseDefaultSchema = {
  type: "object",
  properties: {
    error: { type: "boolean", default: true },
    message: { type: "string", default: "Something wen wong" },
  },
} as const satisfies JSONSchema;
export type ResponseDefaultSchema = FromSchema<typeof responseDefaultSchema>;

export const response200Schema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        qs: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
        },
        params: {
          type: "object",
          properties: {
            parStr: { type: "string" },
            parNum: { type: "number" },
          },
        },
        body: {
          type: "object",
          properties: {
            str: { type: "string" },
            num: { type: "number" },
            bool: { type: "boolean" },
          },
        },
      },
    },
  },
} as const satisfies JSONSchema;
export type Response200Schema = FromSchema<typeof response200Schema>;

export const response400Schema = {
  type: "object",
  properties: {
    error: { type: "boolean", default: true },
    message: { type: "string", default: "Bad request" },
  },
} as const satisfies JSONSchema;
export type Response400Schema = FromSchema<typeof response400Schema>;
