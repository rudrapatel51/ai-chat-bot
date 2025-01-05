"use client";

import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Webcam from 'react-webcam';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [genAI, setGenAI] = useState(null);
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const apiKey = 'AIzaSyAi119cnRG3Ilpj-gJlirUIM2XrGGgkI3g';
    const ai = new GoogleGenerativeAI(apiKey);
    setGenAI(ai);

    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then(res => res.blob());
      processImageWithGemini(blob);
    }
  };

  const processImageWithGemini = async (imageBlob) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const imageBytes = await imageBlob.arrayBuffer();
      const imagePart = {
        inlineData: {
          data: Buffer.from(imageBytes).toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const result = await model.generateContent([imagePart, "What can you see in this image? If there's text, please read and respond to it as a teaching assistant."]);
      const response = await result.response;
      const text = response.text();

      addMessageAndSpeak('bot', text);
    } catch (error) {
      console.error('Error processing image:', error);
      addMessageAndSpeak('bot', 'Sorry, I encountered an error processing the image.');
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const addMessageAndSpeak = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
    if (role === 'bot') {
      speakText(content);
    }
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || !genAI) return;

    const newMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `As a virtual teaching assistant, please help with the following: ${messageText}
      Remember to:
      - Be patient and encouraging
      - Break down complex concepts into simple steps
      - Provide relevant examples
      - Ask clarifying questions if needed
      - Suggest additional resources when appropriate`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      addMessageAndSpeak('bot', text);
    } catch (error) {
      console.error('Error:', error);
      addMessageAndSpeak('bot', 'Sorry, I encountered an error.');
    }

    setIsTyping(false);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="w-full max-w-2xl flex flex-col gap-8">
        <h1 className="text-2xl font-bold mb-4">AI Teaching Assistant</h1>
        
        {/* Camera Section */}
        {isCameraActive && (
          <div className="relative w-full aspect-video mb-4">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg w-full"
            />
            <button
              onClick={captureImage}
              className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Capture Question
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 h-96 overflow-y-auto mb-4 rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${
                message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'
              }`}>
                {message.content}
              </span>
            </div>
          ))}
          {isTyping && <div className="text-gray-500">Assistant is thinking...</div>}
        </div>

        {/* Input Section */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
            placeholder="Type your question..."
          />
          <button
            onClick={() => sendMessage()}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
          <button
            onClick={startListening}
            className={`p-2 rounded transition-colors ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isListening ? 'Listening...' : 'Voice'}
          </button>
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`p-2 rounded transition-colors ${
              isCameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
          >
            {isCameraActive ? 'Hide Camera' : 'Show Camera'}
          </button>
        </div>
      </main>
    </div>
  );
}