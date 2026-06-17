import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Component/Navbar';
import bg from '../assets/bg.jpeg';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const chatEndRef = useRef(null);
const token = localStorage.getItem("token");  // 🔥 LOAD CHAT HISTORY ON MOUNT
  const moodFallback = (emotionContext) => {
    const emotion = (emotionContext?.emotion || "").toLowerCase();
    const severity = (emotionContext?.severity_level || "").toLowerCase();

    if (severity === "high") {
      return "Aap pehle 3 slow saans lein aur apne shoulders relax karein. Abhi sab se zyada pressure kis baat ka hai?";
    }

    if (["surprise", "surprised"].includes(emotion)) {
      return "Lagta hai kuch unexpected hua hai. Yeh surprise positive tha ya thora stressful?";
    }

    if (["sad", "sadness"].includes(emotion)) {
      return "Mujhe lagta hai aap thora heavy feel kar rahe hain. Kis baat ne dil par zyada asar kiya?";
    }

    if (["angry", "anger"].includes(emotion)) {
      return "Aap thora pause lein aur jaw relax karein. Kis cheez ne aap ko trigger kiya?";
    }

    if (["fear", "fearful"].includes(emotion)) {
      return "Aap apne around 3 cheezen notice karein jo safe lagti hain. Kis baat ka dar zyada hai?";
    }

    if (["happy", "joy"].includes(emotion)) {
      return "Yeh acha lag raha hai ke mood light hai. Is feeling ko thora enjoy karein, kya cheez ne smile di?";
    }

    if (emotion === "neutral") {
      return "Aap ka mood abhi balanced lag raha hai. Chhota sa walk ya paani ka break helpful ho sakta hai.";
    }

    return "Main aap ke sath hoon. Ek slow saans lein, abhi sab se zyada kya feel ho raha hai?";
  };

  const cleanBotText = (text, emotionContext = null) => {
    const fallback = moodFallback(emotionContext);
    if (!text) return fallback;

    const hasHindi = /[\u0900-\u097F]/.test(text);
    const genericAiReply = /as an ai|i don't have feelings|i do not have feelings|physical state like humans|how can i help you today/i.test(text);
    const modelBusy = /high demand|overloaded|temporarily unavailable|spikes in demand/i.test(text);
    if (modelBusy) return "EmoBot is busy right now. Please try again in a moment.";
    if (hasHindi || genericAiReply) return fallback;

    const compact = text.replace(/\s+/g, " ").trim();
    const twoSentences = compact.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
    const words = twoSentences.split(/\s+/);

    if (words.length <= 35) return twoSentences;
    return words.slice(0, 35).join(" ").replace(/[.,;:]$/, "") + ".";
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // LOAD CHAT HISTORY FROM BACKEND
  const loadChatHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/chatbot/history?limit=50", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          // Convert backend format to UI format
          const formattedMessages = data.history.flatMap(chat => [
            { type: "user", text: chat.user_message, id: chat.id },
            { type: "bot", text: cleanBotText(chat.bot_response, chat.emotion_context), id: chat.id + "_bot" }
          ]);
          setMessages(formattedMessages);
        } else {
          // First message if no history
          setMessages([
            {
              type: "bot",
              text: "😊 Hello! I'm EmoBot, your emotional support companion. How are you feeling today?"
            }
          ]);
        }
      } else if (response.status === 401) {
        // User not authenticated, show welcome message
        setMessages([
          {
            type: "bot",
            text: "😊 Hello! I'm EmoBot. Please log in to save our conversations."
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([
        {
          type: "bot",
          text: "😊 Hello! I'm EmoBot. I'm here to listen and support you."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // SEND MESSAGE TO GEMINI
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { type: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/chatbot/message", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg = {
          type: "bot",
          text: cleanBotText(data.bot_response, data.emotion_context)
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorData = await response.json();
        const botMsg = {
          type: "bot",
          text: "❌ " + (errorData.error || "Sorry, I couldn't respond. Please try again.")
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const botMsg = {
        type: "bot",
        text: "❌ Connection error. Please check your internet and try again."
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // CLEAR CHAT HISTORY
  const clearChatHistory = async () => {
    if (!window.confirm("Are you sure you want to clear chat history?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/chatbot/history/clear", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setMessages([
          {
            type: "bot",
            text: "😊 Chat cleared! Let's start fresh. How can I help you today?"
          }
        ]);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-4xl mb-4">🤖</div>
        <p className="text-gray-600">Loading EmoBot...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">

      {/* BACKGROUND */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-blue-50/40 backdrop-blur-sm"></div>
      </div>

      <Navbar />

      {/* CHAT AREA */}
      <main className="flex-1 flex flex-col pt-24 md:pt-32 pb-28 px-4 md:px-[20%]">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">
            <div className="text-3xl">🤖</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#2F357D]">
                EmoBot
              </h2>
              <p className="text-xs text-blue-600 uppercase tracking-widest">
                Powered by Gemini AI
              </p>
            </div>
          </div>

          {/* CLEAR BUTTON */}
          <button
            onClick={clearChatHistory}
            className="text-xs md:text-sm font-bold px-4 py-2 rounded-full 
            bg-white/40 backdrop-blur-xl border border-white 
            text-[#2F357D] shadow-md hover:bg-[#2F357D] hover:text-white 
            transition active:scale-95 mt-10"
          >
            Clear Chat
          </button>

        </div>

        {/* MESSAGES */}
        <div className="flex-1 space-y-4 overflow-y-auto">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[60%] px-5 py-4 rounded-3xl shadow-md
                ${msg.type === "user"
                  ? "bg-[#2F357D] text-white rounded-tr-none"
                  : "bg-white/70 text-[#2F357D] backdrop-blur-xl border border-white rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/70 px-5 py-3 rounded-3xl rounded-tl-none border border-white shadow flex items-center gap-2">

                <span className="text-sm text-[#2F357D] font-medium">
                  EmoBot is typing
                </span>

                <span className="w-2 h-2 bg-[#2F357D] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#2F357D] rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-[#2F357D] rounded-full animate-bounce delay-300"></span>

              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>
      </main>

      {/* INPUT */}
      <div className="fixed bottom-4 left-0 w-full px-3 md:px-[20%]">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-2xl rounded-full p-2 border border-white shadow-xl">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-[#2F357D] placeholder-gray-500"
            disabled={isTyping}
          />

          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className="bg-[#2F357D] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 transition disabled:opacity-50"
          >
            ➤
          </button>

        </div>
      </div>

    </div>
  );
};

export default Chatbot;
