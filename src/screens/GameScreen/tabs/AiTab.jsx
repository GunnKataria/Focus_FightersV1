import AiChat from "../../../components/game/AiChat";
import Btn from "../../../components/ui/Btn";
import { SectionTitle } from "../../../components/ui/Typography";

export default function AiTab({
  aiMessages,
  aiLoading,
  aiInput,
  setAiInput,
  sendAi,
}) {
  const quickPrompts = [
    { label: "📝 Summarize", prompt: "Summarize the key points" },
    { label: "📖 Definitions", prompt: "What are the most important definitions?" },
    { label: "❓ Quiz Me", prompt: "Create a quiz question from this material" },
  ];

  const handleQuickPrompt = (prompt) => {
    setAiInput(prompt);
    setTimeout(() => sendAi(prompt), 50);
  };

  return (
    <div className="animate-fade">
      <SectionTitle>🤖 AI Study Assistant</SectionTitle>
      <AiChat
        messages={aiMessages}
        loading={aiLoading}
        input={aiInput}
        setInput={setAiInput}
        onSend={sendAi}
      />
      <div
        style={{
          display: "flex",
          gap: ".5rem",
          marginTop: ".5rem",
          flexWrap: "wrap",
        }}
      >
        {quickPrompts.map(({ label, prompt }) => (
          <Btn
            key={prompt}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickPrompt(prompt)}
          >
            {label}
          </Btn>
        ))}
      </div>
    </div>
  );
}