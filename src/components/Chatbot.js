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
  useColorModeValue,
} from "@chakra-ui/react";
import { FiSend, FiMic, FiMessageCircle, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const chatboxRef = useRef(null);

  const API_URL = `${process.env.REACT_APP_API_URL}/api/chat`;

  // Updated theme colors (matching login page)
  const bgGradient = "linear(to-b, yellow.100, orange.200)";
  const chatBg = "yellow.50";
  const buttonColor = "orange.500";
  const inputBorder = "orange.400";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (chatboxRef.current && !chatboxRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    }
    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Append user message with markdown formatting support
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setIsTyping(true);

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
        {
          text: "Error connecting to AI. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

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
          colorScheme="orange"
          onClick={() => setIsChatOpen(true)}
          boxShadow="xl"
        />
      )}

      {isChatOpen && (
        <Box
          ref={chatboxRef}
          w="350px"
          h="450px"
          bgGradient={bgGradient}
          boxShadow="2xl"
          borderRadius="lg"
          p={4}
          display="flex"
          flexDirection="column"
        >
          {/* Chat Header */}
          <HStack justifyContent="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold" color="orange.700">
              Chat with AI
            </Text>
            <IconButton
              icon={<FiX />}
              size="sm"
              colorScheme="red"
              onClick={() => setIsChatOpen(false)}
            />
          </HStack>

          {/* Messages Section */}
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
                bg={msg.sender === "user" ? "orange.400" : "yellow.300"}
                alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                color="black"
                maxW="80%"
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </Box>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Box
                p={3}
                borderRadius="lg"
                bg="yellow.300"
                alignSelf="flex-start"
                color="black"
                maxW="80%"
                fontStyle="italic"
              >
                AI is typing...
              </Box>
            )}

            <div ref={chatEndRef}></div>
          </VStack>

          {/* Input Section */}
          <HStack mt={2}>
            <Input
              flex="1"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              borderColor={inputBorder}
              _focus={{ borderColor: "orange.600" }}
            />
            <IconButton
              icon={<FiSend />}
              colorScheme="orange"
              onClick={sendMessage}
              isDisabled={isTyping}
            />
            <IconButton
              icon={isListening ? <Spinner /> : <FiMic />}
              colorScheme="yellow"
              onClick={handleVoiceInput}
            />
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default Chatbot;
