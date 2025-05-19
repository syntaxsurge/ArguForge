interface Tool {
  type: "function";
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description: string;
      }
    >;
  };
}

const toolDefinitions = {
  end_debate: {
    description:
      "End the debate when time is up or the conversation has reached a natural conclusion",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description:
            "The reason for ending the debate, e.g., 'time_up', 'natural_conclusion', 'user_conceded'",
        },
        explanation: {
          type: "string",
          description: "A brief explanation of why the debate is ending",
        },
      },
      required: ["reason"],
    },
  },
  time_warning: {
    description: "Issue a warning that time is running out for the debate",
    parameters: {
      type: "object",
      properties: {
        remaining_seconds: {
          type: "number",
          description: "Approximate number of seconds remaining in the debate",
        },
        message: {
          type: "string",
          description: "Custom warning message to display to the user",
        },
      },
      required: ["remaining_seconds"],
    },
  },
};

const tools: Tool[] = Object.entries(toolDefinitions).map(([name, config]) => ({
  type: "function",
  name,
  description: config.description,
  parameters: config.parameters || {
    type: "object",
    properties: config.parameters,
  },
}));

export type { Tool };
export { tools };
