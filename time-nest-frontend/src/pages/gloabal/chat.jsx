import React, { useState } from 'react';
import Navbar from '../../components/navbar';
import M_navbar from '../../components/M_navbar';

const people = [
  { username: 'Alice' },
  { username: 'Bob' },
  { username: 'Charlie' },
];

const initialMessages = [
  { sender: 'Alice', text: 'Hey team!' },
  { sender: 'Bob', text: 'Hello Alice!' },
];

const Chat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(null);
  const isManager = localStorage.getItem('isManager') === 'true';

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() && selected) {
      setMessages([...messages, { sender: 'You', text: input }]);
      setInput('');
    }
  };

  return (
    <>
    {isManager ? <M_navbar /> : <Navbar />} 
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center pt-20">
        <h1 className="text-4xl font-bold mb-6 text-indigo-900">Chat</h1>
        <div className="employeeCard mb-8 w-full max-w-lg">
          <h2 className=" font-bold mb-5 text-center text-3xl underline text-black">Connect with your team</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {people.map((person) => (
              <button
                key={person.username}
                className={`px-4 py-2 rounded-full border border-black  text-black font-semibold bg-indigo-50 hover:bg-indigo-200 transition ${
                  selected === person.username ? 'bg-indigo-200' : ''
                }`}
                onClick={() => setSelected(person.username)}
              >
                {person.username}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 rounded-full border border-black text-black font-semibold bg-indigo-50 hover:bg-indigo-200 transition">Create Group Chat</button>
            <button className="px-4 py-2 rounded-full border border-black text-black font-semibold bg-indigo-50 hover:bg-indigo-200 transition">Private Message</button>
          </div>
        </div>

        <div className="employeeCard w-full max-w-lg mb-20 flex flex-col border-2 border-black bg-gray-100 rounded-2xl p-5" style={{ minHeight: '400px' }}>
          <div className="flex items-center mb-2">
            <span className="font-bold text-black text-lg">
              {selected ? selected : 'Select a coworker or group'}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto mb-4 bg-indigo-50 rounded-lg p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-${msg.sender === 'You' ? 'end' : 'start'} mb-2`}
              >
                <span className="text-xs text-gray-500">{msg.sender}</span>
                <span
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    msg.sender === 'You'
                      ? 'bg-indigo-400 text-white'
                      : 'bg-white text-black border border-indigo-200'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-full border border-black outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!selected}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              disabled={!selected || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chat;