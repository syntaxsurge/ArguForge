import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/types";

interface TokenUsageDisplayProps {
  messages: Message[];
}

export function TokenUsageDisplay({ messages }: TokenUsageDisplayProps) {
  return (
    <>
      {messages.length > 0 && (
        <div className="w-full">
          <h3 className="font-medium mb-3 text-lg">Token Usage</h3>
          <div>
            {messages
              .filter((msg) => msg.type === "response.done")
              .slice(-1)
              .map((msg) => {
                const tokenData = [
                  {
                    label: "Total Tokens",
                    value: msg.response?.usage?.total_tokens,
                  },
                  {
                    label: "Input Tokens",
                    value: msg.response?.usage?.input_tokens,
                  },
                  {
                    label: "Output Tokens",
                    value: msg.response?.usage?.output_tokens,
                  },
                ];

                return (
                  <div
                    key="token-usage-grid"
                    className="grid grid-cols-3 gap-2 md:gap-4"
                  >
                    {tokenData.map(({ label, value }) => (
                      <Card key={label}>
                        <CardContent className="p-4">
                          <div className="font-medium">{label}</div>
                          <div>{value}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}
