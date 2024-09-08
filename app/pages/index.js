import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI("AIzaSyAi119cnRG3Ilpj-gJlirUIM2XrGGgkI3g");
    window.genAI = genAI;
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const model = window.genAI.getGenerativeModel({ model: "gemini-pro" });
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gemini Chatbot</h1>
      <div className="bg-gray-100 p-4 h-96 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
              {message.content}
            </span>
          </div>
        ))}
        {isTyping && <div className="text-gray-500">Bot is typing...</div>}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-grow border p-2 rounded-l"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r">Send</button>
      </div>
    </div>
  );
}