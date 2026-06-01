"use client";

import { useState, useRef } from "react";
import "./globals.css";

const topics = [
  {
    id: "school-life",
    label: "School Life",
    firstQuestion: "What do you like about your school?",
    modelAnswers: [
      "I like my school because I can study with my friends.",
      "I enjoy school events because they are exciting.",
      "I like my teachers because they are kind."
    ],
    followQuestions: [
      "What subject do you like?",
      "Who do you usually talk with at school?",
      "What is your favorite school event?"
    ]
  },
  {
    id: "weekend",
    label: "Weekend",
    firstQuestion: "What did you do last weekend?",
    modelAnswers: [
      "I stayed home and relaxed last weekend.",
      "I went shopping with my family last weekend.",
      "I played sports with my friends last weekend."
    ],
    followQuestions: [
      "Was it fun?",
      "Who did you spend time with?",
      "What do you want to do next weekend?"
    ]
  },
  {
    id: "food",
    label: "Food",
    firstQuestion: "What food do you like?",
    modelAnswers: [
      "I like curry because it is delicious.",
      "I like ramen because it is hot and tasty.",
      "I like sushi because it is fresh and delicious."
    ],
    followQuestions: [
      "How often do you eat it?",
      "Can you cook it?",
      "Who do you usually eat it with?"
    ]
  },
  {
    id: "club-activities",
    label: "Club Activities",
    firstQuestion: "What club activity do you do?",
    modelAnswers: [
      "I am in the tennis club. I enjoy practicing with my friends.",
      "I am in the brass band club. I like playing music.",
      "I am in the art club. I like drawing pictures."
    ],
    followQuestions: [
      "How often do you practice?",
      "What is difficult about your club activity?",
      "What do you like most about your club?"
    ]
  },
  {
    id: "future-dreams",
    label: "Future Dreams",
    firstQuestion: "What do you want to be in the future?",
    modelAnswers: [
      "I want to be a nurse because I want to help people.",
      "I want to be a teacher because I like children.",
      "I want to work in an office because I am interested in business."
    ],
    followQuestions: [
      "Why do you want to do that job?",
      "What do you need to study for your dream?",
      "Who inspired you?"
    ]
  },
  {
    id: "travel",
    label: "Travel",
    firstQuestion: "Where do you want to travel?",
    modelAnswers: [
      "I want to visit Kyoto because I like Japanese history.",
      "I want to go to Okinawa because the sea is beautiful.",
      "I want to visit Tokyo because there are many interesting places."
    ],
    followQuestions: [
      "Who do you want to go with?",
      "What do you want to do there?",
      "How long do you want to stay?"
    ]
  },
  {
    id: "ai-education",
    label: "AI and Education",
    firstQuestion: "Do you think AI is useful for studying English?",
    modelAnswers: [
      "I think AI is useful because it can help me practice English.",
      "I think AI is helpful because I can study anytime.",
      "I think AI is useful, but we also need to think by ourselves."
    ],
    followQuestions: [
      "How do you use AI for studying?",
      "What is good about using AI?",
      "Do you think students should use AI at school?"
    ]
  }
];

const keywordResponses = [
  {
    keywords: ["tennis", "baseball", "soccer", "basketball", "sport"],
    reaction: "That sounds active and fun.",
    model: "I enjoy playing sports because it is fun and exciting.",
    follow: "How often do you practice?"
  },
  {
    keywords: ["movie", "anime", "netflix", "youtube"],
    reaction: "That sounds interesting.",
    model: "I watched a movie at home, and it was very interesting.",
    follow: "What kind of movies or anime do you like?"
  },
  {
    keywords: ["friend", "friends"],
    reaction: "That sounds nice.",
    model: "I enjoyed spending time with my friends.",
    follow: "What do you usually do with your friends?"
  },
  {
    keywords: ["family", "mother", "father", "sister", "brother"],
    reaction: "That is nice.",
    model: "I spent time with my family, and I had a good time.",
    follow: "What do you like to do with your family?"
  },
  {
    keywords: ["study", "english", "math", "homework"],
    reaction: "Good effort.",
    model: "I studied hard because I wanted to improve my skills.",
    follow: "What subject do you want to improve?"
  },
  {
    keywords: ["nurse", "teacher", "doctor", "office", "business"],
    reaction: "That is a good dream.",
    model: "I want to do that job because I want to help people.",
    follow: "What do you need to do for your dream?"
  }
];

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [messages, setMessages] = useState([]);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [finished, setFinished] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

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
      text: selectedTopic.firstQuestion
    };

    setMessages([firstMessage]);
    setStudentAnswer("");
    setFinished(false);
    setTurnCount(0);
    speak(selectedTopic.firstQuestion);
  }

  function handleTopicChange(e) {
    const topic = topics.find((t) => t.id === e.target.value);
    setSelectedTopic(topic);
    setMessages([]);
    setStudentAnswer("");
    setFinished(false);
    setTurnCount(0);
    window.speechSynthesis.cancel();
  }

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "This browser does not support speech recognition. Please use keyboard voice input or type your answer."
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

    recognition.onerror = () => {
      setIsListening(false);
      alert("Speech recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function makeReply(answer) {
    const lowerAnswer = answer.toLowerCase();

    const matched = keywordResponses.find((item) =>
      item.keywords.some((keyword) => lowerAnswer.includes(keyword))
    );

    if (matched) {
      return `${matched.reaction} You can also say, "${matched.model}" ${matched.follow}`;
    }

    const model =
      selectedTopic.modelAnswers[turnCount % selectedTopic.modelAnswers.length];

    const follow =
      selectedTopic.followQuestions[turnCount % selectedTopic.followQuestions.length];

    return `Good answer. You can also say, "${model}" ${follow}`;
  }

  function sendAnswer() {
    if (!studentAnswer.trim()) {
      alert("Please answer first.");
      return;
    }

    const studentMessage = {
      role: "student",
      text: studentAnswer
    };

    const reply = makeReply(studentAnswer);

    const assistantMessage = {
      role: "assistant",
      text: reply
    };

    const updatedMessages = [...messages, studentMessage, assistantMessage];

    setMessages(updatedMessages);
    setStudentAnswer("");
    setTurnCount(turnCount + 1);
    speak(reply);
  }

  function finishPractice() {
    setFinished(true);
    window.speechSynthesis.cancel();
  }

  function resetPractice() {
    setMessages([]);
    setStudentAnswer("");
    setFinished(false);
    setTurnCount(0);
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
          <button
            onClick={() => {
              const lastAssistantMessage = [...messages]
                .reverse()
                .find((m) => m.role === "assistant");

              if (lastAssistantMessage) {
                speak(lastAssistantMessage.text);
              } else {
                speak(selectedTopic.firstQuestion);
              }
            }}
          >
            Read Again
          </button>
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

              <button onClick={sendAnswer}>Send</button>

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
