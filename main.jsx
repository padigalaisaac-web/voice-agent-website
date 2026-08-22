import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  SessionProvider,
  useSession,
  useVoiceAssistant,
  RoomAudioRenderer,
  BarVisualizer,
} from "@livekit/components-react";
import { TokenSource } from "livekit-client";
import "@livekit/components-styles";
import "./styles.css";

const AGENT_NAME = "gemini-voice-agent";

// Add your LiveKit Development Token Server ID here.
const TOKEN_SERVER_ID = "voiceagent-9nyv49";

function AgentUI({ session }) {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const [text, setText] = useState("");

  const sendText = () => {
    if (!text.trim()) return;
    // LiveKit's voice session can be controlled by microphone.
    // Text input is kept as a UI field; voice is the primary interaction.
    setText("");
  };

  return (
    <div className="app">
      <div className="glow glow1" />
      <div className="glow glow2" />

      <header className="topbar">
        <div className="brand">
          <div className="logo">✦</div>
          <div>
            <div className="brand-name">Gemini Voice Agent</div>
            <div className="brand-sub">LiveKit + Gemini + Web Search</div>
          </div>
        </div>
        <div className="status">
          <span className={`dot ${state === "speaking" ? "speaking" : ""}`} />
          {state || "connecting"}
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="eyebrow">AI VOICE ASSISTANT</div>
          <h1>Talk to your<br /><span>AI agent.</span></h1>
          <p className="description">
            Ask questions naturally. Your agent can search the web and answer
            with real-time voice.
          </p>

          <div className="orb-wrap">
            <div className={`orb ${state === "speaking" ? "active" : ""}`}>
              <div className="orb-inner">
                {audioTrack ? (
                  <BarVisualizer
                    track={audioTrack}
                    state={state}
                    barCount={7}
                    options={{ minHeight: 8, maxHeight: 42 }}
                  />
                ) : (
                  <div className="mic-icon">◉</div>
                )}
              </div>
            </div>
          </div>

          <div className="state-label">
            {state === "speaking" ? "Agent is speaking" :
             state === "listening" ? "Listening..." :
             state === "thinking" ? "Thinking..." :
             "Ready"}
          </div>

          <div className="controls">
            <button
              className="mic-button"
              onClick={() => session.start()}
              disabled={session.isConnected}
            >
              <span>🎙</span>
              {session.isConnected ? "Connected" : "Start talking"}
            </button>
            {session.isConnected && (
              <button className="end-button" onClick={() => session.end()}>
                End session
              </button>
            )}
          </div>

          <div className="text-box">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
              placeholder="Type something..."
            />
            <button onClick={sendText}>Send</button>
          </div>
        </section>

        <aside className="side">
          <div className="card">
            <div className="card-title">AGENT</div>
            <div className="agent-name">{AGENT_NAME}</div>
            <div className="pill">● Production</div>
          </div>

          <div className="card transcript">
            <div className="card-title">TRANSCRIPT</div>
            <div className="transcript-body">
              {agentTranscriptions?.length ? (
                agentTranscriptions.slice(-8).map((item, i) => (
                  <div className="line" key={i}>{item.text}</div>
                ))
              ) : (
                <div className="empty">
                  Start a session and speak to see the conversation here.
                </div>
              )}
            </div>
          </div>

          <div className="card features">
            <div className="card-title">CAPABILITIES</div>
            <div className="feature">🎤 Real-time voice</div>
            <div className="feature">🔎 Web search</div>
            <div className="feature">⚡ Gemini Realtime</div>
          </div>
        </aside>
      </main>

      <footer>
        Powered by LiveKit · Gemini · Olostep
      </footer>

      <RoomAudioRenderer />
    </div>
  );
}

function App() {
  const [error, setError] = useState("");

  if (TOKEN_SERVER_ID === "PASTE_YOUR_TOKEN_SERVER_ID_HERE") {
    return (
      <div className="setup">
        <h1>Almost ready</h1>
        <p>Open <b>src/main.jsx</b> and replace:</p>
        <code>PASTE_YOUR_TOKEN_SERVER_ID_HERE</code>
        <p>with your LiveKit Development Token Server ID.</p>
      </div>
    );
  }

  const tokenSource = TokenSource.developmentTokenServer(TOKEN_SERVER_ID);
  const session = useSession(tokenSource, { agentName: AGENT_NAME });

  useEffect(() => {
    const onError = (e) => setError(e?.message || "Connection error");
    return () => {};
  }, []);

  return (
    <SessionProvider session={session}>
      {error && <div className="error">{error}</div>}
      <AgentUI session={session} />
    </SessionProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);