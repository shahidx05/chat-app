import { useEffect, useState } from 'react'
import { io } from "socket.io-client";

const App = () => {
  const [input, setinput] = useState('')
  const socket = io("http://localhost:3000");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("hello", socket.id);
    });

    socket.on("welcome", (message) => {
      console.log(message);
    });

    socket.on("mess", (message) => {
      console.log(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [])

  return (
    <>
      <input className='bg-amber-50 border-amber-600' value={input} type="text"
        onChange={e => setinput(e.target.value)}
      />
      <button className='bg-amber-600 text-white' onClick={() => {
        socket.emit('message', input)
      }}>Send</button>
    </>
  )
}

export default App