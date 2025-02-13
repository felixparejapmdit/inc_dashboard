import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  IconButton,
  Spinner,
  useColorModeValue, // ✅ Use this to support dark/light mode
} from "@chakra-ui/react";
import { FiSend, FiMic, FiMessageCircle, FiX } from "react-icons/fi";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const API_URL = `${process.env.REACT_APP_API_URL}/api/chat`; // ✅ Make sure your server is running

  // ✅ Define theme colors before rendering
  const bgColor = useColorModeValue("white", "gray.800");
  const chatBg = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Function to send a message
  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to AI. Please try again.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Voice recognition input
  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("Voice recognition error. Try again.");
    };
  };

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex="1000">
      {!isChatOpen && (
        <IconButton
          icon={<FiMessageCircle />}
          isRound
          size="lg"
          colorScheme="blue"
          onClick={() => setIsChatOpen(true)}
          boxShadow="xl"
        />
      )}

      {isChatOpen && (
        <Box
          w="350px"
          h="450px"
          bg={bgColor}
          boxShadow="2xl"
          borderRadius="lg"
          p={4}
          display="flex"
          flexDirection="column"
        >
          {/* ✅ Chat Header */}
          <HStack justifyContent="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              Chat with AI
            </Text>
            <IconButton
              icon={<FiX />}
              size="sm"
              onClick={() => setIsChatOpen(false)}
            />
          </HStack>

          {/* ✅ Messages Section */}
          <VStack
            flex="1"
            overflowY="auto"
            align="stretch"
            spacing={2}
            bg={chatBg}
            p={2}
            borderRadius="md"
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                p={3}
                borderRadius="lg"
                bg={msg.sender === "user" ? "blue.500" : "gray.500"}
                alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                color="white"
                maxW="80%"
              >
                {msg.text}
              </Box>
            ))}
            <div ref={chatEndRef}></div>
          </VStack>

          {/* ✅ Input Section */}
          <HStack mt={2}>
            <Input
              flex="1"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <IconButton
              icon={isLoading ? <Spinner /> : <FiSend />}
              onClick={sendMessage}
              isDisabled={isLoading}
            />
            <IconButton
              icon={isListening ? <Spinner /> : <FiMic />}
              onClick={handleVoiceInput}
            />
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default Chatbot;
