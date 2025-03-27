import { useState, useRef, useEffect } from 'react';

export default function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('botMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('botMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    const formattedMessages = [
      {
        role: 'system',
        content:
          'You are a kind and empathetic AI best friend. Your goal is to offer support, comfort, and friendship. You remember what the user shares with you and continue conversations naturally. Keep answers short and emotionally aware.',
      },
      ...newMessages.filter(msg => msg.role && msg.content),
    ];

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
        }),
      });

      const data = await response.json();
      console.log('OpenAI response:', data);

      if (data.choices?.[0]?.message) {
        const botMessage = data.choices[0].message;
        setMessages(prev => [...prev, botMessage]);
      } else {
        console.error('Unexpected API response format:', data);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Hmm, I didn’t get that. Want to try again?' },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Oops, something went wrong. Try again later.' },
      ]);
    }
  };

  return (
    <div className="support-bot">
      <button className="bot-toggle" onClick={() => setIsOpen(!isOpen)}>💬</button>
      {isOpen && (
        <div className="bot-window">
          <div className="bot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>{msg.content}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="bot-input">
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
