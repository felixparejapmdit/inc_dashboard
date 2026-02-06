import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FiSend, FiMessageCircle, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const chatboxRef = useRef(null);

  const API_URL = `${process.env.REACT_APP_API_URL}/api/chat`;

  const headerGradient = "linear(to-r, orange.500, orange.400)";
  const shellGradient = "linear(to-b, orange.50, white)";
  const userBubbleGradient = "linear(to-br, orange.500, orange.400)";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
      let replyText =
        typeof data.reply === "string"
          ? data.reply
          : JSON.stringify(data.reply ?? "Error: No response from AI.");
      if (replyText.endsWith("undefined")) {
        replyText = replyText.replace(/undefined$/, "").trim();
      }

      displayAIMessageGradually(replyText);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Error connecting to AI. Please try again.",
          sender: "bot",
        },
      ]);
      setIsTyping(false);
    }
  };

  const displayAIMessageGradually = (text) => {
    let index = 0;
    setIsTyping(true);
    const interval = setInterval(() => {
      if (index < text.length) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.sender === "bot") {
            return [
              ...prev.slice(0, -1),
              { text: (lastMessage.text || "") + text[index], sender: "bot" },
            ];
          }
          return [...prev, { text: text[index], sender: "bot" }];
        });
        index += 1;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 40);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box position="fixed" bottom="30px" right="30px" zIndex="1000">
      {!isChatOpen && (
        <IconButton
          aria-label="Open chat"
          icon={<FiMessageCircle size="24px" />}
          isRound
          size="lg"
          w="60px"
          h="60px"
          bgGradient="linear(to-br, orange.400, orange.600)"
          color="white"
          onClick={() => setIsChatOpen(true)}
          boxShadow="0 12px 28px rgba(237, 137, 54, 0.45)"
          _hover={{ transform: "scale(1.08)", boxShadow: "0 18px 36px rgba(237, 137, 54, 0.55)" }}
          transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        />
      )}

      {isChatOpen && (
        <Box
          ref={chatboxRef}
          w={{ base: "92vw", sm: "420px" }}
          h={{ base: "75vh", sm: "560px" }}
          bgGradient={shellGradient}
          boxShadow="0 22px 55px rgba(0,0,0,0.18)"
          borderRadius="2xl"
          p={0}
          display="flex"
          flexDirection="column"
          overflow="hidden"
          border="1px solid"
          borderColor="orange.100"
          transition="all 0.3s ease"
        >
          <HStack
            justifyContent="space-between"
            p={4}
            bgGradient={headerGradient}
            color="white"
          >
            <HStack spacing={3}>
              <Box bg="whiteAlpha.300" p={2} borderRadius="lg">
                <FiMessageCircle size="20px" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="bold">
                  PMD Assistant
                </Text>
                <HStack spacing={1}>
                  <Box w="8px" h="8px" bg="green.300" borderRadius="full" />
                  <Text fontSize="xs" opacity={0.9}>
                    Online
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            <IconButton
              aria-label="Close chat"
              icon={<FiX />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
              onClick={() => setIsChatOpen(false)}
            />
          </HStack>

          <VStack
            flex="1"
            overflowY="auto"
            align="stretch"
            spacing={4}
            p={4}
            css={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#cbd5e0", borderRadius: "20px" },
            }}
          >
            <Text fontSize="xs" textAlign="center" color="gray.400" py={1}>
              Ask about Personnel, Family, or Project Data
            </Text>

            {messages.length === 0 && !isTyping && (
              <Box
                p={4}
                borderRadius="xl"
                bg="white"
                boxShadow="sm"
                border="1px dashed"
                borderColor="orange.200"
              >
                <Text fontSize="sm" color="gray.600">
                  Try asking: "Show personnel named Maria" or "List the fields in the Personnel model."
                </Text>
              </Box>
            )}

            {messages.map((msg, index) => (
              <Box
                key={index}
                p={3}
                borderRadius={msg.sender === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px"}
                bgGradient={msg.sender === "user" ? userBubbleGradient : "none"}
                bg={msg.sender === "user" ? undefined : "white"}
                boxShadow="sm"
                alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                color={msg.sender === "user" ? "white" : "gray.800"}
                maxW="85%"
                fontSize="0.95rem"
                border={msg.sender === "bot" ? "1px solid" : "none"}
                borderColor="gray.100"
              >
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </Box>
            ))}

            {isTyping && (
              <HStack
                spacing={2}
                p={3}
                bg="white"
                borderRadius="20px 20px 20px 4px"
                alignSelf="flex-start"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
              >
                <Spinner size="xs" color="orange.400" />
                <Text fontSize="sm" color="gray.500">
                  AI is thinking...
                </Text>
              </HStack>
            )}
            <div ref={chatEndRef}></div>
          </VStack>

          <Box p={4} borderTop="1px solid" borderColor="orange.100" bg="white">
            <HStack>
              <Input
                variant="filled"
                bg="orange.50"
                _focus={{ bg: "white", borderColor: "orange.400", boxShadow: "none" }}
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                borderRadius="full"
                py={6}
              />
              <IconButton
                aria-label="Send message"
                icon={<FiSend />}
                isRound
                bg="orange.500"
                color="white"
                _hover={{ bg: "orange.600", transform: "translateY(-1px)" }}
                onClick={sendMessage}
                isDisabled={isTyping || !input.trim()}
                boxShadow="lg"
                transition="all 0.2s ease"
              />
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Chatbot;
