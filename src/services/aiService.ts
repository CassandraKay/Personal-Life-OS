export async function askGeminiAssistant(
  prompt: string,
  context?: any,
  systemInstruction?: string
): Promise<{ text: string; error?: string }> {
  try {
    const res = await fetch("/api/gemini/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context, systemInstruction }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Server error ${res.status}`);
    }
    return { text: data.text || "No response received." };
  } catch (error: any) {
    console.error("AI Assistant request failed:", error);
    return {
      text: "",
      error: error.message || "Failed to reach AI assistant. Please verify your connection or API key.",
    };
  }
}

export async function generateStructuredAI<T = any>(
  type: "side_hustle_ideas" | "flashcards" | "mind_declutter" | "code_snippet_explain" | "brain_dump_triage" | "custom",
  topic: string,
  context?: any
): Promise<{ data: T | null; error?: string }> {
  try {
    // Map brain_dump_triage to mind_declutter for server
    const serverType = type === "brain_dump_triage" ? "mind_declutter" : type;
    const res = await fetch("/api/gemini/structured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: serverType, topic, context }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || `Server error ${res.status}`);
    }
    return { data: result.data as T };
  } catch (error: any) {
    console.error("Structured AI request failed:", error);
    return {
      data: null,
      error: error.message || "AI structured generation failed.",
    };
  }
}
