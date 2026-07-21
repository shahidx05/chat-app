import { useState, useEffect, useRef } from 'react'
import { getUsers } from '../services/user.service'
import { getMessages } from '../services/message.service'
import { io } from "socket.io-client";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const socket = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000", {
      auth: { token }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [token]);

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

    // socket.current.on("receive_message", (data) => {
    //   console.log(data.message, "from", data.user);
    //   if (selectedUser && data.user === selectedUser._id) {
    //     setMessages((prevMessages) => [
    //       ...prevMessages,
    //       { content: data.message, mine: false, _id: Date.now() }
    //     ]);
    //   }
    // })

    socket.current.on("online_users", (data) => {
      console.log("Online users:", data);
      setUsers(prev =>
        prev.map(user =>
          data.includes(user._id)
            ? { ...user, online: true }
            : { ...user, online: false }
        )
      );
    })
  }, [token]);

  useEffect(() => {
    const receiveHandler = (data) => {
      if (selectedUser && String(data.sender) === String(selectedUser._id)) {
        setMessages(prev => [...prev, data]);
      }
    };

    const typingHandler = (data) => {
      if (selectedUser && String(data.sender) === String(selectedUser._id)) {
        setIsTyping(data.typing);
      }
    };

    const onlineHandler = (data) => {
      console.log(`${data.username} is online`);
      setUsers(prev =>
        prev.map(user =>
          user._id === data.userId
            ? { ...user, online: true }
            : user
        )
      );
      selectedUser && selectedUser._id === data.userId && setSelectedUser(prev => ({ ...prev, online: true }));
    };

    const offlineHandler = (data) => {
      console.log(`${data.username} is offline`);
      setUsers(prev =>
        prev.map(user =>
          user._id === data.userId
            ? { ...user, online: false }
            : user
        )
      );
      selectedUser && selectedUser._id === data.userId && setSelectedUser(prev => ({ ...prev, online: false }));
    };

    socket.current.on("receive_message", receiveHandler);
    socket.current.on("typing", typingHandler);
    socket.current.on("user_online", onlineHandler);
    socket.current.on("user_offline", offlineHandler);

    return () => {
      socket.current.off("receive_message", receiveHandler);
      socket.current.off("typing", typingHandler);
      socket.current.off("user_online", onlineHandler);
      socket.current.off("user_offline", offlineHandler);
    };
  }, [selectedUser]);

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

  useEffect(() => {
    setIsTyping(false);
    if (!selectedUser) return;

    fetchMessages(selectedUser._id);
  }, [selectedUser]);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    socket.current.emit("typing", {
      receiver: selectedUser._id,
      typing: true,
    });

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.current.emit("typing", {
        receiver: selectedUser._id,
        typing: false,
      });
    }, 1000);
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
              key={user._id}
              className="flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-100"
            >
              <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {user.name[0]}
              </div>

              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500">
                  <button
                    onClick={() => setSelectedUser(user)}
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
            <p className="text-sm text-green-600">
              {selectedUser?.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">

          {messages.map((msg) => {
            const mine = String(msg.sender) === String(currentUser.id);
            return (
              <div
                key={msg._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-sm ${mine
                    ? "bg-blue-600 text-white"
                    : "bg-white border"}`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2">
                <span className="text-sm text-gray-500">Typing</span>

                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Input */}
        <div className="bg-white border-t p-4 flex gap-3">

          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
            onClick={() => {
              if (message.trim() !== "") {
                socket.current?.emit("send_message", { receiver: selectedUser._id, message });
                setMessage("");
                // Optionally, you can also add the sent message to the messages state
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { content: message, sender: currentUser.id, receiver: selectedUser._id, _id: Date.now() }
                ]);
                socket.current.emit("typing", {
                  receiver: selectedUser._id,
                  typing: false,
                });
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