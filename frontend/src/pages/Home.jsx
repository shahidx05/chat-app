import { useState, useEffect, useRef } from 'react'
import { getUsers } from '../services/user.service'
import { getMessages } from '../services/message.service'
import { io } from "socket.io-client";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("")

  const token = localStorage.getItem('token');

  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000", {
      auth: { token }
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.current.on("connect", () => {
      console.log("connected", socket.current.id);
    });

    // socket.on("me", (user) => {
    //   console.log(user.username);
    // });

    // socket.on("welcome", (message) => {
    //   console.log(message);
    // });

    // socket.on('connect_error', (err) => {
    //   console.log('Connection failed:', err.message);
    // });

    // socket.on("mess", (message) => {
    //   console.log(message);
    // });

    socket.current.on("receive_message", (data) => {
      console.log(data.message, "from", data.user);
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: data.message, mine: false, _id: Date.now() } 
      ]);
    })
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data.users);
        console.log("Fetched users:", data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const fetchMessages = async (userId) => {
    try {
      const data = await getMessages(userId);
      console.log("Fetched messages:", data);
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">

        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold">Chat App</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-100"
            >
              <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {user.name[0]}
              </div>

              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      console.log(`Selected user: ${user.name}`);
                      fetchMessages(user._id);
                    }}
                  >
                    Click to chat
                  </button>
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="h-20 bg-white border-b flex items-center px-6">
          <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            {selectedUser ? selectedUser.name[0] : "U"}
          </div>

          <div className="ml-4">
            <h2 className="font-semibold text-lg">
              {selectedUser ? selectedUser.name : "Select a user"}
            </h2>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">

          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.mine ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-sm ${msg.mine
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

        </div>

        {/* Input */}
        <div className="bg-white border-t p-4 flex gap-3">

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
            onClick={() => {
              if (message.trim() !== "") {
                socket.current.emit("send_message", { receiver: selectedUser._id, message });
                setMessage("");
                // Optionally, you can also add the sent message to the messages state
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { content: message, mine: true, _id: Date.now() } 
                ]);
              }
            }}
          >
            Send
          </button>

        </div>

      </div>
    </div>
  );
};

export default Home;