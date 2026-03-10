import { ChatGoogle } from "@langchain/google";
import type { ParsedEndpoint } from "../types/endpoint.js";
import { buildSwaggerPrompt } from "../prompts/swagger-prompt.js";
import { GeneratedSwaggerSchema } from "../schemas/endpoint-schema.js";
import { withRetry } from "../utils/retry.js";

function normalizeCodeFence(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function generateSwagger(
  endpoint: ParsedEndpoint,
  requestDtoCode: string | null,
  responseDtoCode: string,
  model: ChatGoogle
): Promise<{ controllerDecorators: string }> {
  const prompt = buildSwaggerPrompt(endpoint, requestDtoCode, responseDtoCode);

  console.error(
    `  [Swagger] ${endpoint.httpMethod} ${endpoint.routePath}`
  );

  return withRetry(
    `Swagger ${endpoint.httpMethod} ${endpoint.routePath}`,
    async () => {
      const response = await model.invoke(prompt);
      const raw = normalizeCodeFence(String(response.content));

      try {
        return GeneratedSwaggerSchema.parse(JSON.parse(raw));
      } catch {
        throw new Error(
          `Invalid JSON response for ${endpoint.methodName}. Raw: ${raw.slice(0, 200)}`
        );
      }
    }
  );
}
