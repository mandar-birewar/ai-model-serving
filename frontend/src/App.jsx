import { Activity, Bot, FileText, MessageSquareText, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const tasks = [
  {
    id: "sentiment",
    title: "Sentiment",
    endpoint: "/api/sentiment",
    icon: Activity,
    label: "Analyze",
    placeholder: "I love how simple this AI model serving project feels.",
    field: "text",
    outputKey: "label"
  },
  {
    id: "summarize",
    title: "Summarizer",
    endpoint: "/api/summarize",
    icon: FileText,
    label: "Summarize",
    placeholder:
      "Paste a paragraph of at least 35 words here. The backend sends it to a Hugging Face summarization model and returns a compact summary that the React frontend displays without reloading the page.",
    field: "text",
    outputKey: "summary"
  },
  {
    id: "generate",
    title: "Generator",
    endpoint: "/api/generate",
    icon: Sparkles,
    label: "Generate",
    placeholder: "An end-to-end AI application is useful because",
    field: "prompt",
    outputKey: "generated_text"
  }
];

function App() {
  const [activeTask, setActiveTask] = useState(tasks[0]);
  const [input, setInput] = useState(activeTask.placeholder);
  const [maxNewTokens, setMaxNewTokens] = useState(60);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const ActiveIcon = activeTask.icon;

  const output = useMemo(() => {
    if (!result) {
      return "";
    }

    if (activeTask.id === "sentiment") {
      return `${result.label} confidence: ${Math.round(result.score * 100)}%`;
    }

    return result[activeTask.outputKey];
  }, [activeTask, result]);

  function changeTask(task) {
    setActiveTask(task);
    setInput(task.placeholder);
    setResult(null);
    setError("");
    setStatus("idle");
  }

  async function runTask(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);

    const payload =
      activeTask.id === "generate"
        ? { prompt: input, max_new_tokens: maxNewTokens }
        : { text: input };

    try {
      const response = await fetch(`${API_BASE}${activeTask.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The API request failed.");
      }

      setResult(data);
      setStatus("done");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="sidebar" aria-label="AI tasks">
          <div className="brand">
            <Bot size={30} />
            <div>
              <h1>AI Model Serving</h1>
              <p>FastAPI + Hugging Face + React</p>
            </div>
          </div>

          <nav className="task-list">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <button
                  className={task.id === activeTask.id ? "task-button active" : "task-button"}
                  key={task.id}
                  onClick={() => changeTask(task)}
                  type="button"
                >
                  <Icon size={20} />
                  <span>{task.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Live endpoint</span>
              <h2>{activeTask.endpoint}</h2>
            </div>
            <span className="status">{status}</span>
          </div>

          <form className="task-form" onSubmit={runTask}>
            <label htmlFor="model-input">{activeTask.field === "prompt" ? "Prompt" : "Text"}</label>
            <textarea
              id="model-input"
              onChange={(event) => setInput(event.target.value)}
              rows={10}
              value={input}
            />

            {activeTask.id === "generate" && (
              <label className="range-label" htmlFor="token-range">
                <span>Max new tokens</span>
                <input
                  id="token-range"
                  max="120"
                  min="10"
                  onChange={(event) => setMaxNewTokens(Number(event.target.value))}
                  type="range"
                  value={maxNewTokens}
                />
                <strong>{maxNewTokens}</strong>
              </label>
            )}

            <button className="primary-button" disabled={status === "loading"} type="submit">
              <ActiveIcon size={20} />
              {status === "loading" ? "Running..." : activeTask.label}
            </button>
          </form>

          <section className="output-area" aria-live="polite">
            <div className="output-title">
              <MessageSquareText size={20} />
              <h3>Model Response</h3>
            </div>

            {error && <p className="error">{error}</p>}
            {!error && output && <p className="result">{output}</p>}
            {!error && !output && <p className="muted">Run an endpoint to see the Hugging Face model output here.</p>}
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
