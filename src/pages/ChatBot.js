import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("http://localhost:5001/chat", {
        message: input,
      });

      const botMessage = { sender: "bot", text: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
    }

    setInput("");
  };

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      w="400px"
      h="500px"
      bg="gray.100"
      overflowY="auto"
    >
      <VStack align="stretch" spacing={4}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
            bg={msg.sender === "user" ? "blue.500" : "gray.300"}
            color={msg.sender === "user" ? "white" : "black"}
            p={2}
            borderRadius="md"
          >
            <Text>{msg.text}</Text>
          </Box>
        ))}
      </VStack>

      <HStack mt={4}>
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <IconButton icon={<FiSend />} onClick={sendMessage} />
      </HStack>
    </Box>
  );
};

export default ChatBot;
