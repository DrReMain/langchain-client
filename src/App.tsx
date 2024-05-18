import { useState } from "react";
type TData = { que: string; ans: string };

function App() {
  const [data, setData] = useState<TData[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q }),
    });
    setData((prev) => [...prev, { que: q, ans: "" }]);
    setQuestion("");

    const es = new EventSource("http://localhost:3000/chat");
    es.onmessage = ({ data }) => {
      const { answer, end } = JSON.parse(data);

      if (!end)
        setData((prev) => {
          const newData = [...prev];
          newData[newData.length - 1].ans += answer;
          return newData;
        });

      if (end) {
        es.close();
        setLoading(false);
      }
    };

    es.onerror = () => {
      es.close();
      setLoading(false);
    };
  };

  return (
    <section className="h-full p-4 flex flex-col bg-slate-900">
      <header className="text-white flex flex-col gap-2">
        <h1 className="text-center text-lg">
          Ollama + llama3 + LangChain + Nestjs + React
        </h1>
        <h2 className="text-center text-xl">AI聊天</h2>
      </header>

      <main className="h-0 flex-1 overflow-y-auto flex flex-col gap-4 text-sm">
        {data.map(({ que, ans }, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex justify-end gap-2 pl-16">
              <div className="text-white">{que}</div>
              <div className="w-6 h-6 flex-none bg-white rounded-full flex justify-center items-center">
                我
              </div>
            </div>
            {ans ? (
              <div className="flex gap-2 pr-16">
                <div className="w-6 h-6 flex-none bg-white rounded-full flex justify-center items-center">
                  AI
                </div>
                <div className="text-white">{ans}</div>
              </div>
            ) : null}
          </div>
        ))}
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) handleSend();
        }}
        className="h-16 flex gap-2 bg-slate-600 rounded-lg p-1"
      >
        <input
          type="text"
          className="w-0 flex-1 bg-slate-900 text-white rounded-lg p-2"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="w-14 rounded-lg bg-cyan-900 text-white"
          disabled={loading}
        >
          发送
        </button>
      </form>
    </section>
  );
}

export default App;
