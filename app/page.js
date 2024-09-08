"use client";

import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [genAI, setGenAI] = useState(null);

  useEffect(() => {
    const apiKey = 'AIzaSyAi119cnRG3Ilpj-gJlirUIM2XrGGgkI3g';
    const ai = new GoogleGenerativeAI(apiKey);
    setGenAI(ai);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !genAI) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      setMessages([...newMessages, { role: 'bot', content: text }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { role: 'bot', content: 'Sorry, I encountered an error.' }]);
    }

    setIsTyping(false);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-2xl flex flex-col gap-8">
        <h1 className="text-2xl font-bold mb-4">Rudra&apos;s Chatbot</h1>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 h-96 overflow-y-auto mb-4 rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>
                {message.content}
              </span>
            </div>
          ))}
          {isTyping && <div className="text-gray-500">Bot is Typing...</div>}
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow border p-2 rounded-l dark:bg-gray-700 dark:border-gray-600"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition-colors">Send</button>
        </div>
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}