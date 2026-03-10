import { ChatGoogle } from "@langchain/google";
import type { ParsedEndpoint } from "../types/endpoint.js";
import { buildDtoPrompt } from "../prompts/dto-prompt.js";
import { GeneratedDtosSchema } from "../schemas/endpoint-schema.js";
import { withRetry } from "../utils/retry.js";

function normalizeCodeFence(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function generateDtos(
  endpoint: ParsedEndpoint,
  prismaSchema: string,
  model: ChatGoogle
): Promise<{ requestDtoCode: string | null; responseDtoCode: string }> {
  const prompt = buildDtoPrompt(endpoint, prismaSchema || null);

  console.error(
    `  [DTO] ${endpoint.httpMethod} ${endpoint.routePath}`
  );

  return withRetry(
    `DTO ${endpoint.httpMethod} ${endpoint.routePath}`,
    async () => {
      const response = await model.invoke(prompt);
      const raw = normalizeCodeFence(String(response.content));

      try {
        return GeneratedDtosSchema.parse(JSON.parse(raw));
      } catch {
        throw new Error(
          `Invalid JSON response for ${endpoint.methodName}. Raw: ${raw.slice(0, 200)}`
        );
      }
    }
  );
}
