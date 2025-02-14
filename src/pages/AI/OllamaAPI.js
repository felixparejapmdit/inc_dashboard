import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Input,
  Textarea,
  useToast,
  Heading,
  Select,
  Progress,
} from "@chakra-ui/react";

const OLLAMA_HOST = "http://172.18.121.50"; // Replace with your Ollama server IP

const OllamaAPI = () => {
  const [models, setModels] = useState([]);
  const [response, setResponse] = useState("");
  const [prompt, setPrompt] = useState("");
  const [modelName, setModelName] = useState("");
  const [trainingData, setTrainingData] = useState(""); // Holds formatted JSON data
  const [modelDescription, setModelDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0); // Track progress

  const toast = useToast();

  // ✅ Fetch available models
  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/tags`);
      const data = await res.json();

      if (Array.isArray(data.models)) {
        setModels(data.models);
      } else {
        toast({
          title: "Invalid response format",
          description: "Expected an array but got something else.",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching models",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  // ✅ Load JSON File from database_export.json
  const loadTrainingData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Validate the structure
        if (!jsonData.personnels || !Array.isArray(jsonData.personnels)) {
          throw new Error(
            "Invalid JSON structure. Expected 'personnels' array."
          );
        }

        // Format JSON for training (Adjust based on actual structure)
        const formattedData = jsonData.personnels
          .map((item) => {
            return `Question: What is the name of personnel with ID ${
              item.personnel_id
            }?\nAnswer: ${item.givenname} ${item.middlename || ""} ${
              item.surname_husband || ""
            }\n`;
          })
          .join("\n");

        setTrainingData(formattedData);

        toast({
          title: "Training data loaded successfully!",
          status: "success",
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Error loading JSON",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      }
    };

    reader.readAsText(file);
  };

  // ✅ Create and Train Model with JSON Data
  const trainModel = async () => {
    if (!modelName.trim()) {
      toast({
        title: "Model name is required!",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    if (!trainingData || trainingData.length < 10) {
      toast({
        title: "Training data is required and should not be empty!",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    setTrainingProgress(10); // Start progress

    try {
      const res = await fetch(`${OLLAMA_HOST}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName,
          from: modelName,
          description: modelDescription || `Fine-tuned ${modelName}`,
          data: trainingData.trim(),
        }),
      });

      const textResponse = await res.text();

      if (textResponse.includes("status")) {
        setTrainingProgress(50); // Midway progress

        toast({
          title: "Training started successfully!",
          description: "Wait for training to complete.",
          status: "success",
          duration: 3000,
        });

        setResponse(textResponse);

        // Simulate training completion
        setTimeout(() => {
          setTrainingProgress(100); // Training done
          toast({
            title: "Training completed!",
            status: "success",
            duration: 3000,
          });
        }, 5000); // Simulate 5-second progress completion
      } else {
        try {
          const data = JSON.parse(textResponse);
          if (data.error) {
            throw new Error(data.error);
          }

          setResponse(JSON.stringify(data, null, 2));
          setTrainingProgress(100); // Mark as completed

          toast({
            title: "Model trained successfully!",
            status: "success",
            duration: 3000,
          });

          fetchModels();
        } catch (jsonError) {
          throw new Error(`Unexpected response: ${textResponse}`);
        }
      }
    } catch (error) {
      toast({
        title: "Error training model",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      setTrainingProgress(0); // Reset on error
    }

    setLoading(false);
  };

  // ✅ Generate a response using the selected model
  const generateCompletion = async () => {
    if (!modelName.trim()) {
      toast({
        title: "Model selection required!",
        description: "Please select a model from the dropdown.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Prompt is required!",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName, // ✅ Now uses the selected model
          prompt: prompt,
          stream: false,
        }),
      });

      const data = await res.json();
      setResponse(data.response || "No response received.");
    } catch (error) {
      toast({
        title: "Error generating response",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  // ✅ Ensure the model is pulled before running
  const pullModel = async () => {
    if (!modelName.trim()) {
      toast({
        title: "Model name is required!",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName.trim() }),
      });

      const data = await res.json();
      toast({
        title: "Model pulled successfully!",
        status: "success",
        duration: 3000,
      });

      fetchModels(); // Refresh model list
    } catch (error) {
      toast({
        title: "Error pulling model",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  // ✅ Create a new model
  const createModel = async () => {
    if (!modelName.trim() || !trainingData.trim()) {
      toast({
        title: "Model name and training data are required!",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName,
          from: "llama3.1",
          description: modelDescription || "Custom trained model",
          data: trainingData,
        }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      toast({
        title: "Model created successfully!",
        status: "success",
        duration: 3000,
      });

      fetchModels(); // ✅ Refresh the model list
    } catch (error) {
      toast({
        title: "Error creating model",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  // ✅ Handle generic POST API calls
  const handlePostRequest = async (endpoint, body = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      toast({
        title: `Error calling ${endpoint}`,
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  // ✅ Delete a model from Ollama
  const handleDeleteModel = async () => {
    if (!modelName.trim()) {
      toast({
        title: "Model name is required!",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/delete`, {
        method: "DELETE", // ✅ Use DELETE method instead of POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName.trim() }), // ✅ Ensure correct request format
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Model deleted successfully!",
        status: "success",
        duration: 3000,
      });

      fetchModels(); // ✅ Refresh the model list
    } catch (error) {
      toast({
        title: "Error deleting model",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Ollama API Interface
      </Heading>

      {/* ✅ List Models */}
      <Button colorScheme="blue" onClick={fetchModels} isLoading={loading}>
        List Available Models
      </Button>

      <VStack align="start" mt={4}>
        {models.length > 0 ? (
          models.map((model, index) => (
            <Text
              key={index}
              fontSize="md"
              p={2}
              bg="gray.100"
              borderRadius="md"
            >
              {model.name}
            </Text>
          ))
        ) : (
          <Text>No models found</Text>
        )}
      </VStack>

      {/* ✅ Prompt Input */}
      <Textarea
        placeholder="Enter your question or command..."
        mt={6}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <Button
        colorScheme="green"
        mt={4}
        onClick={generateCompletion}
        isLoading={loading}
      >
        Generate Completion
      </Button>

      {/* ✅ Select Model Name for API Actions */}
      <Select
        placeholder="Select model name"
        mt={4}
        value={modelName} // ✅ Keeps the selected value
        onChange={(e) => setModelName(e.target.value)}
      >
        {models.map((model, index) => (
          <option key={index} value={model.name}>
            {model.name}
          </option>
        ))}
      </Select>

      {/* ✅ File Upload for JSON Data */}
      <Input type="file" accept=".json" onChange={loadTrainingData} mt={4} />

      {/* ✅ Show Preview of Training Data */}
      {trainingData && (
        <Textarea
          value={trainingData}
          readOnly
          mt={4}
          placeholder="Training data preview..."
          size="sm"
          height="150px"
        />
      )}

      {/* ✅ Train Model Button */}
      <Input
        placeholder="Enter model name"
        mt={4}
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
      />

      <Button
        colorScheme="purple"
        mt={4}
        onClick={trainModel}
        isLoading={loading}
      >
        Train Model with JSON Data
      </Button>

      {trainingProgress > 0 && (
        <Progress
          value={trainingProgress}
          size="sm"
          colorScheme="green"
          mt={4}
          hasStripe
          isAnimated
        />
      )}

      {/* ✅ API Action Buttons */}
      {/* ✅ Create Model Section */}
      <Heading size="md" mt={6}>
        Create a New Model
      </Heading>

      <Input
        placeholder="Enter model name"
        mt={2}
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
      />

      <Textarea
        placeholder="Enter model description (optional)"
        mt={2}
        value={modelDescription}
        onChange={(e) => setModelDescription(e.target.value)}
      />

      <Textarea
        placeholder="Enter training data..."
        mt={2}
        value={trainingData}
        onChange={(e) => setTrainingData(e.target.value)}
      />

      <Button
        colorScheme="purple"
        mt={4}
        onClick={createModel}
        isLoading={loading}
      >
        Create Model
      </Button>

      <Button
        colorScheme="yellow"
        mt={4}
        onClick={() => handlePostRequest("show", { model: modelName })}
      >
        Show Model Info
      </Button>

      <Button
        colorScheme="orange"
        mt={4}
        onClick={() => handlePostRequest("copy", { model: modelName })}
      >
        Copy Model
      </Button>

      <Button colorScheme="red" mt={4} onClick={handleDeleteModel}>
        Delete Model
      </Button>

      <Button
        colorScheme="blue"
        mt={4}
        onClick={() => handlePostRequest("pull", { model: modelName })}
      >
        Pull Model
      </Button>

      <Button
        colorScheme="blue"
        mt={4}
        onClick={() => handlePostRequest("push", { model: modelName })}
      >
        Push Model
      </Button>

      <Button
        colorScheme="pink"
        mt={4}
        onClick={() => handlePostRequest("embed", { model: modelName })}
      >
        Generate Embeddings
      </Button>

      <Button colorScheme="gray" mt={4} onClick={() => handlePostRequest("ps")}>
        List Running Models
      </Button>

      <Button
        colorScheme="teal"
        mt={4}
        onClick={() => handlePostRequest("version")}
      >
        Get Ollama Version
      </Button>

      {/* ✅ Response Display */}
      {response && (
        <Box mt={4} p={4} bg="gray.200" borderRadius="md">
          <Text fontWeight="bold">API Response:</Text>
          <Text whiteSpace="pre-wrap">{response}</Text>
        </Box>
      )}
    </Box>
  );
};

export default OllamaAPI;
