import React from 'react';
import { Box, Heading, Text, VStack, Button, Icon } from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Catches the error after a descendant component throws it
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  // Logs the error information
  componentDidCatch(error, errorInfo) {
    // CRITICAL: Log the error to the console or an external service (Sentry, etc.)
    console.error("--- APPLICATION CRASH DETECTED ---", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI for the user
      return (
        <Box 
            bg="red.50" 
            p={8} 
            borderRadius="xl" 
            boxShadow="2xl" 
            minHeight="80vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            margin="20px"
        >
          <VStack spacing={6} textAlign="center" maxW="lg">
            <Icon as={FiAlertTriangle} boxSize={16} color="red.700" />
            
            <Heading as="h1" size="xl" color="red.800">
              Application Error!
            </Heading>
            
            <Text fontSize="lg" color="gray.700" fontWeight="semibold">
              Isang malaking pagkakamali ang nangyari. Ang pahinang ito ay pansamantalang hindi gumagana.
            </Text>
            
            <Text fontSize="md" color="gray.600">
              (An application error occurred. Please refresh or try again later.)
            </Text>

            <Button
              leftIcon={<Icon as={FiRefreshCw} />}
              colorScheme="red"
              size="lg"
              mt={4}
              onClick={() => window.location.reload()}
            >
              I-refresh ang Pahina (Refresh Page)
            </Button>
            
            {/* Optional: Show Network Specific Detail if applicable */}
            {this.state.error && this.state.error.message.includes('Network') && (
                <Text mt={2} fontSize="sm" color="red.500">
                    *Tignan ang iyong internet connection. (Check your network connection.)
                </Text>
            )}

            {/* Optional: Show detailed error info in development only */}
            {process.env.NODE_ENV === 'development' && (
                <Box mt={4} p={3} bg="gray.100" borderRadius="md" textAlign="left" w="100%" overflowX="auto">
                    <Text fontWeight="bold">Developer Error Trace:</Text>
                    <pre style={{whiteSpace: 'pre-wrap', fontSize: '10px'}}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;