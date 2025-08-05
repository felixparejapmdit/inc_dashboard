// utils/handleError.js
export function handleError(error, toast, fallbackMessage = "Something went wrong") {
  console.error(error);
  toast({
    title: "Error",
    description:
      error?.response?.data?.errors?.[0]?.message || fallbackMessage,
    status: "error",
    duration: 5000,
    isClosable: true,
  });
}
