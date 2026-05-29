"use client";

import { useState, useRef } from "react";
import "./globals.css";

const topics = [
  {
    id: "school-life",
    label: "School Life",
    firstQuestion: "What do you like about your school?"
  },
  {
    id: "weekend",
    label: "Weekend",
    firstQuestion: "What did you do last weekend?"
  },
  {
    id: "food",
    label: "Food",
    firstQuestion: "What food do you like?"
  },
  {
    id: "club-activities",
    label: "Club Activities",
    firstQuestion: "What club activity do you do?"
  },
  {
    id: "future-dreams",
    label: "Future Dreams",
    firstQuestion: "What do you want to be in the future?"
  },
  {
    id: "travel",
    label: "Travel",
    firstQuestion: "Where do you want to travel?"
  },
  {
    id: "ai-education",
    label: "AI and Education",
    firstQuestion: "Do you think AI is useful for studying English?"
  }
];

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(topics[0].firstQuestion);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const recognitionRef = useRef(null);

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      alert("This browser does not support speech synthesis.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  function startPractice() {
    const firstMessage = {
      role: "assistant",
      text: currentQuestion
    };

    setMessages([firstMessage]);
    setStudentAnswer("");
    setFinished(false);
    speak(currentQuestion);
  }

  function handleTopicChange(e) {
    const topic = topics.find((t) => t.id === e.target.value);
    setSelectedTopic(topic);
    setCurrentQuestion(topic.firstQuestion);
    setMessages([]);
    setStudentAnswer("");
    setFinished(false);
  }

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "This browser does not support speech recognition. Please use Chrome or Safari with speech input enabled."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStudentAnswer("");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setStudentAnswer(text);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
      alert("Speech recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function sendAnswer() {
    if (!studentAnswer.trim()) {
      alert("Please answer first.");
      return;
    }

    const newStudentMessage = {
      role: "student",
      text: studentAnswer
    };

    const updatedMessages = [...messages, newStudentMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: selectedTopic.label,
          messages: updatedMessages,
          studentAnswer
        })
      });

      if (!response.ok) {
        throw new Error("API request failed.");
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        text: data.reply
      };

      setMessages([...updatedMessages, assistantMessage]);
      setCurrentQuestion(data.reply);
      setStudentAnswer("");
      speak(data.reply);
    } catch (error) {
      console.error(error);
      alert("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function finishPractice() {
    setFinished(true);
    window.speechSynthesis.cancel();
  }

  function resetPractice() {
    setMessages([]);
    setStudentAnswer("");
    setCurrentQuestion(selectedTopic.firstQuestion);
    setFinished(false);
    window.speechSynthesis.cancel();
  }

  return (
    <main className="container">
      <section className="card">
        <h1>English Speaking Practice</h1>
        <p className="subtitle">
          Practice for 5 minutes with the app. Then talk with your partner.
        </p>

        <label className="label">Topic</label>
        <select
          className="select"
          value={selectedTopic.id}
          onChange={handleTopicChange}
        >
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.label}
            </option>
          ))}
        </select>

        <div className="buttonRow">
          <button onClick={startPractice}>Start</button>
          <button onClick={() => speak(currentQuestion)}>Read Again</button>
          <button className="secondary" onClick={resetPractice}>
            Reset
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Conversation</h2>

        <div className="chatBox">
          {messages.length === 0 && (
            <p className="hint">Press Start to begin.</p>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "student"
                  ? "message student"
                  : "message assistant"
              }
            >
              <strong>{message.role === "student" ? "You" : "App"}</strong>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        {!finished && (
          <>
            <div className="answerBox">
              <label className="label">Your answer</label>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Speak or type your answer here."
              />
            </div>

            <div className="buttonRow">
              <button onClick={startListening} disabled={isListening}>
                {isListening ? "Listening..." : "Speak"}
              </button>

              <button onClick={sendAnswer} disabled={isLoading}>
                {isLoading ? "Thinking..." : "Send"}
              </button>

              <button className="finish" onClick={finishPractice}>
                Finish
              </button>
            </div>
          </>
        )}

        {finished && (
          <div className="finishBox">
            <h2>Good job!</h2>
            <p>Now talk with your partner using today&apos;s topic.</p>
            <p className="partnerTask">
              Partner Practice: Ask the same questions and try to continue the
              conversation.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
