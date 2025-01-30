"use client"
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Heart, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from "react-markdown"


const prompts = [
  {
    "title": "Love letter 💌",
    "prompt": "Write a short love letter to a girl, should not exceed 80 words. Try to impress her and write also write a shayari, insert it somewhere in between the letter in the following format: \\n[start]\\n[text]\\n[Shayari in Hinglish Note: must not contain any non-English words or phrases.]\\n[text]\\n[end]"
  },
  {
    "title": "Proposal letter 💘",
    "prompt": "Write a short proposal letter to a girl. Persuade her to be your girlfriend, be flirty. Should not exceed 80 words. Try to impress her. Format: \\n[intro] \\n[text] \\n[end with finesse]"
  },
  {
    "title": "Pickup line ❤️",
    "prompt": "write one pickup line ideas. Be creative."
  },
  {
    "title": "Flirty opening on photo 👩",
    "prompt": "Saw a profile on a dating app, create a flirty message that instantly catches eye from 100 messages, which is in reply to the photo of her. The message should be crisp and in less than 15 words. It should be extremely flirty and creative but not creepy."
  },
  {
    "title": "Coffee ☕",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty ice breaker which could grab her attention and would want to ask out to coffee date"
  },
  {
    "title": "Movie 🍿",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty ice breaker which could grab her attention and would want to ask out for movie"
  },
  {
    "title": "Drive 🚗",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty ice breaker which could grab her attention and would want to ask out for a long drive with music"
  },
  {
    "title": "What made you Swipe Right on my profile?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on What made you Swipe Right on my profile?"
  },
  {
    "title": "What does a day in the life of (name) look like?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on What does a day in the life of your life look like?"
  },
  {
    "title": "Do you have any pets? Or want to own one in the future?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on Do you have any pets? Or want to own one in the future?"
  },
  {
    "title": "Do you love your work?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on Do you love your work?"
  },
  {
    "title": "What's your first impression of people?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on What’s your first impression of people?"
  },
  {
    "title": "What does your typical weekend look like?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on What does your typical weekend look like?"
  },
  {
    "title": "Next Trip",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on Where are you planning your next trip?"
  },
  {
    "title": "When did your last relationship end?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on When did your last relationship end?"
  },
  {
    "title": "Who’re you closer to? Your mom or dad?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on Who’re you closer to? Your mom or dad?"
  },
  {
    "title": "What are some items on your bucket list?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on What are some items on your bucket list?"
  },
  {
    "title": "What's your goal for the next 5 years?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on What’s your goal for the next 5 years?"
  },
  {
    "title": "If you would choose to be a superhero, who would you be?",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty follow up topic on If you would choose to be a superhero, who would you be?"
  },
  {
    "title": "Start a conversation",
    "prompt": "I am a guy who is matched with a girl on a dating app, write an opening flirty ice breaker which could grab her attention for opening"
  }
]


export default function RomanceChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const chatEndRef = useRef(null);
  const [error, setError] = useState(null);
  
  const GEMINI_API_KEY = "AIzaSyAi119cnRG3Ilpj-gJlirUIM2XrGGgkI3g";

  useEffect(() => {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      window.genAI = genAI;
    } catch (error) {
      setError("Failed to initialize AI. Please check your API key.");
      console.error("Initialization error:", error);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedPrompt) return;

    const messageToSend = selectedPrompt ? selectedPrompt.prompt : input;
    const displayMessage = selectedPrompt ? selectedPrompt.title : input;
    
    addMessage('user', displayMessage);
    setInput('');
    setIsTyping(true);

    try {
      if (!window.genAI) {
        throw new Error("AI not initialized. Please check your API key.");
      }

      const model = window.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(messageToSend);
      const response = await result.response;
      const text = response.text();
      
      addMessage('bot', text);
    } catch (error) {
      console.error('Error:', error);
      addMessage('bot', `Sorry, I encountered an error: ${error.message}`);
    } finally {
      setIsTyping(false);
      setSelectedPrompt(null);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-6 rounded-xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-pink-600">
          <Heart className="inline-block mr-2" /> Love Assistant
        </h1>
        <p className="text-center text-pink-500">Your personal romance and dating advisor</p>
        {error && (
          <p className="text-red-500 text-center mt-2 text-sm">{error}</p>
        )}
      </div>

      {/* Prompt Suggestions */}
      <div className="mb-6 flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => setSelectedPrompt(prompt)}
            className="bg-pink-50 hover:bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {prompt.title}
          </button>
        ))}
      </div>

      {/* Selected Prompt Indicator */}
      {selectedPrompt && (
        <div className="mb-4 p-2 bg-pink-50 rounded-lg text-pink-600 text-sm">
          Selected: {selectedPrompt.title}
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white p-4 h-[400px] overflow-y-auto mb-4 rounded-xl shadow-lg border border-pink-100">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-pink-50 text-gray-800'
              }`}
            >
              <ReactMarkdown>
                {message.content}
                </ReactMarkdown>
            </span>
          </div>
        ))}
        
        {isTyping && (
          <div className="text-pink-400 text-center">
            <Sparkles className="inline-block animate-spin" /> Crafting response...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="w-full border border-pink-200 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
          placeholder={selectedPrompt ? "Press Send to use selected prompt or type your own message..." : "Ask for dating advice, pickup lines, or love letters..."}
        />
        <button 
          onClick={sendMessage} 
          className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-xl transition-colors duration-200"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}