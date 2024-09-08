<<<<<<< HEAD
// pages/_app.js
import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "../src/theme";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={customTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
=======
// pages/_app.js
import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "../src/theme";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={customTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
>>>>>>> eca7ff6edd729f62aa7d1be16f8396a60cc124e5
