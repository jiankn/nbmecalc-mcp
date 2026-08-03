import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { ALGORITHM_VERSION, convert } from "./calculate";

export class NBMEcalcMCP extends McpAgent<Env, Record<string, never>, Record<string, never>> {
  server = new McpServer({ name: "NBMEcalc educational score tools", version: "1.0.1" });
  initialState = {};

  async init(): Promise<void> {
    this.server.registerTool(
      "convert_practice_score",
      {
        description:
          "Convert one supported practice-assessment score into an independent educational estimate. " +
          "This is not an official conversion or an examination guarantee.",
        inputSchema: {
          source: z.enum(["NBME", "UWSA_1", "UWSA_2", "FREE_120", "AMBOSS", "CMS"]),
          score: z.number().finite(),
          step: z.enum(["STEP_1", "STEP_2", "STEP_3"]),
          form: z.number().int().optional().describe("Optional NBME form number"),
        },
      },
      async ({ source, score, step, form }) => {
        const estimate = convert(source, score, step, form);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              estimate,
              algorithmVersion: ALGORITHM_VERSION,
              disclaimer:
                "Independent educational model assumption; not an official conversion or result guarantee.",
            }),
          }],
          structuredContent: { estimate, algorithmVersion: ALGORITHM_VERSION },
        };
      },
    );
  }
}

const mcpHandler = NBMEcalcMCP.serve("/mcp", { binding: "NBMECALC_MCP" });

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/mcp")) {
        return await mcpHandler.fetch(request, env, ctx);
      }
      if (url.pathname === "/" || url.pathname === "/health") {
        return Response.json({
          name: "NBMEcalc MCP",
          status: "ok",
          endpoint: "/mcp",
          website: "https://nbmecalc.com",
          algorithmVersion: ALGORITHM_VERSION,
        });
      }
      return new Response("Not found", { status: 404 });
    } catch (error) {
      console.error(JSON.stringify({
        message: "request failed",
        path: url.pathname,
        error: error instanceof Error ? error.message : String(error),
      }));
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
