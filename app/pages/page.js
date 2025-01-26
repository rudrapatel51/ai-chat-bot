"use client"
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mic, MapPin } from 'lucide-react';

export default function AdvancedChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // API Keys (replace with your actual keys)
  const GEMINI_API_KEY = "AIzaSyAi119cnRG3Ilpj-gJlirUIM2XrGGgkI3g";
  const GOOGLE_PLACES_API_KEY = "AIzaSyAi119cnRG3Ilpj-gJlirUIM2XrGGgkI3g";

  useEffect(() => {
    // Initialize Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    window.genAI = genAI;

    // Speech Recognition Setup
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert('Speech recognition not supported');
    }
  };

  // Search Nearby Places
  const searchNearbyPlaces = async (query) => {
    if (!location) {
      addMessage('bot', 'Location access is required to search nearby places.');
      return;
    }

    try {
      const response = await fetch(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=5000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const formattedPlaces = data.results.map((place) => ({
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          openNow: place.opening_hours?.open_now
        }));

        setPlaces(formattedPlaces);
        addMessage('bot', `Found ${formattedPlaces.length} places nearby for "${query}".`);
      } else {
        addMessage('bot', `No places found for "${query}".`);
      }
    } catch (error) {
      console.error('Places search error:', error);
      addMessage('bot', 'Error searching places. Please try again.');
    }
  };

  // Add Message to Chat
  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  // Send Message Handler
  const sendMessage = async () => {
    if (!input.trim()) return;

    addMessage('user', input);
    setInput('');
    setIsTyping(true);

    try {
      const lowercaseInput = input.toLowerCase();
      
      if (lowercaseInput.includes('near') || lowercaseInput.includes('nearby')) {
        const query = lowercaseInput.replace(/near|nearby/g, '').trim();
        await searchNearbyPlaces(query);
      } else {
        // Default to Gemini AI response
        const model = window.genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(input);
        const response = await result.response;
        const text = response.text();
        
        addMessage('bot', text);
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('bot', 'Sorry, I encountered an error.');
    }

    setIsTyping(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Chatbot Assistant</h1>
      
      <div className="bg-gray-900 p-4 h-96 overflow-y-auto mb-4 rounded-lg shadow-lg">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
        
        {/* Places Results */}
        {places.length > 0 && (
          <div className="mt-4 bg-gray-800 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-white">Nearby Places</h3>
            {places.map((place, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded mb-2">
                <p className="font-bold text-white">{place.name}</p>
                <p className="text-gray-300">{place.address}</p>
                {place.rating && (
                  <p className="text-yellow-400">Rating: {place.rating} ⭐</p>
                )}
              </div>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="text-gray-500 text-center">Bot is thinking...</div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="w-full border p-3 rounded-lg text-black pr-10"
            placeholder="Ask anything or search nearby places..."
          />
          <button 
            onClick={startListening} 
            className="absolute right-12 top-1/2 transform -translate-y-1/2"
          >
            <Mic 
              color={isListening ? 'red' : 'gray'} 
              className={isListening ? 'animate-pulse' : ''} 
            />
          </button>
          <button 
            onClick={() => searchNearbyPlaces(input)} 
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <MapPin color="gray" />
          </button>
        </div>
        <button 
          onClick={sendMessage} 
          className="bg-blue-600 text-white p-3 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}