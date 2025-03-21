"use client";
import React from "react";
import { useState } from "react";


function MainComponent() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [permanentRoomPassword, setPermanentRoomPassword] = useState("");
  const [showPermanentRoomModal, setShowPermanentRoomModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomType: selectedRoom }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (password !== "123apple") {
        setError("Incorrect password");
        return;
      }
      if (!nickname.trim()) {
        setError("Please enter a nickname");
        return;
      }
      setError("");
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentRoomAccess = async () => {
    setIsLoading(true);
    try {
      if (permanentRoomPassword !== "Pineapple24") {
        setError("Incorrect permanent room password");
        return;
      }
      setError("");
      setSelectedRoom("permanent");
      setShowPermanentRoomModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPermanentRoom = async () => {
    if (selectedRoom === "permanent") {
      try {
        const response = await fetch("/api/messages/reset", {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error("Failed to reset room");
        }
        fetchMessages();
      } catch (error) {
        console.error("Error resetting room:", error);
        setError("Failed to reset room");
      }
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomType: selectedRoom,
          nickname,
          content: currentMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setCurrentMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Welcome to Chat
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Enter your nickname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Enter password"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white p-2 rounded-md transition-colors"
          >
            {isLoading ? "Logging in..." : "Enter Chat"}
          </button>
        </div>
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Select a Chatroom
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => setSelectedRoom("temp")}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white p-3 rounded-md transition-colors"
          >
            Temporary Chat
          </button>
          <button
            onClick={() => setShowPermanentRoomModal(true)}
            className="w-full border border-gray-200 hover:bg-gray-900 hover:text-white text-gray-900 p-3 rounded-md transition-colors"
          >
            Permanent Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-900 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <span className="font-medium">
              {selectedRoom === "temp" ? "Temporary" : "Permanent"} Chat
            </span>
            <span className="text-sm ml-2 text-gray-400">({nickname})</span>
          </div>
          <div className="space-x-4">
            {selectedRoom === "permanent" && (
              <button
                onClick={resetPermanentRoom}
                className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition-colors"
              >
                Reset Room
              </button>
            )}
            <button
              onClick={() => setSelectedRoom(null)}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
            >
              Change Room
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  msg.nickname === nickname ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.nickname === nickname
                      ? "bg-gray-900 text-white"
                      : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{msg.nickname}</div>
                  <div>{msg.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex gap-4">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
          />
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim()}
            className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {showPermanentRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Enter Permanent Room Password
            </h3>
            <input
              type="password"
              value={permanentRoomPassword}
              onChange={(e) => setPermanentRoomPassword(e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-4"
              placeholder="Enter password"
            />
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <div className="flex gap-4">
              <button
                onClick={handlePermanentRoomAccess}
                className="flex-1 bg-gray-900 hover:bg-gray-700 text-white p-2 rounded-md transition-colors"
              >
                Enter Room
              </button>
              <button
                onClick={() => {
                  setShowPermanentRoomModal(false);
                  setError("");
                }}
                className="flex-1 border border-gray-200 hover:bg-gray-900 hover:text-white text-gray-900 p-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;
