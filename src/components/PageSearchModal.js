import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Badge,
  Box,
  Divider,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const IGNORE_SELECTOR =
  '[data-global-search-ignore="true"], [data-global-search-ignore], script, style, noscript, iframe';

const SEARCH_TARGET_SELECTOR = [
  "button",
  "a",
  '[role="button"]',
  '[role="link"]',
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "li",
  "td",
  "th",
  "tr",
  "article",
  "section",
  "main",
  "form",
  '[contenteditable="true"]',
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
].join(",");

const MAX_RESULTS = 30;
const SNIPPET_CHARS = 180;

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getQueryTerms = (query) =>
  normalizeText(query)
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

const isVisibleElement = (element) => {
  if (!element || !(element instanceof HTMLElement) || !element.isConnected) {
    return false;
  }

  if (element.closest(IGNORE_SELECTOR)) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  const computed = window.getComputedStyle(element);
  return (
    computed.display !== "none" &&
    computed.visibility !== "hidden" &&
    computed.opacity !== "0"
  );
};

const getSearchableText = (element) => {
  if (!element || !(element instanceof HTMLElement)) {
    return "";
  }

  const pieces = [];
  const textContent = normalizeText(element.textContent);
  if (textContent) {
    pieces.push(textContent);
  }

  const attrNames = [
    "aria-label",
    "title",
    "placeholder",
    "alt",
    "name",
    "data-search-label",
  ];

  attrNames.forEach((attrName) => {
    const value = element.getAttribute(attrName);
    if (value) {
      pieces.push(normalizeText(value));
    }
  });

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    const value = normalizeText(element.value);
    if (value) {
      pieces.push(value);
    }
  }

  return normalizeText(pieces.join(" "));
};

const getSearchTarget = (element) =>
  element.closest(SEARCH_TARGET_SELECTOR) || element;

const buildSnippet = (text, terms) => {
  const cleanText = normalizeText(text);
  if (!cleanText) {
    return "";
  }

  const firstTerm = terms[0];
  if (!firstTerm) {
    return cleanText.length > SNIPPET_CHARS
      ? `${cleanText.slice(0, SNIPPET_CHARS - 1)}…`
      : cleanText;
  }

  const lowerText = cleanText.toLowerCase();
  const index = lowerText.indexOf(firstTerm);

  if (index === -1) {
    return cleanText.length > SNIPPET_CHARS
      ? `${cleanText.slice(0, SNIPPET_CHARS - 1)}…`
      : cleanText;
  }

  const start = Math.max(0, index - 60);
  const end = Math.min(cleanText.length, index + firstTerm.length + 100);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < cleanText.length ? "…" : "";

  return `${prefix}${cleanText.slice(start, end)}${suffix}`;
};

const highlightText = (text, terms, highlightBg) => {
  const cleanText = normalizeText(text);
  if (!cleanText || !terms.length) {
    return cleanText;
  }

  const pattern = terms.map(escapeRegExp).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = cleanText.split(regex);

  return parts.map((part, index) => {
    if (terms.some((term) => part.toLowerCase() === term.toLowerCase())) {
      return (
        <Box
          as="mark"
          key={`${part}-${index}`}
          bg={highlightBg}
          px="1"
          borderRadius="sm"
          color="inherit"
        >
          {part}
        </Box>
      );
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
};

const searchVisiblePage = (query) => {
  const terms = getQueryTerms(query);
  if (!terms.length || typeof document === "undefined" || !document.body) {
    return [];
  }

  const matches = [];
  const seen = new Set();
  const textNodeFlag = window.NodeFilter?.SHOW_TEXT ?? 4;
  const walker = document.createTreeWalker(
    document.body,
    textNodeFlag,
  );

  const pushMatch = (element, kind) => {
    if (!(element instanceof HTMLElement) || seen.has(element)) {
      return;
    }

    if (!isVisibleElement(element)) {
      return;
    }

    const text = getSearchableText(element);
    const lowerText = text.toLowerCase();
    if (!text || !terms.every((term) => lowerText.includes(term))) {
      return;
    }

    seen.add(element);

    matches.push({
      id: `${kind}-${matches.length}-${lowerText.indexOf(terms[0])}`,
      element,
      kind,
      tag: element.tagName.toLowerCase(),
      snippet: buildSnippet(text, terms),
      score: lowerText.indexOf(terms[0]),
    });
  };

  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || !isVisibleElement(parent)) {
      continue;
    }

    const rawText = normalizeText(node.nodeValue);
    if (!rawText) {
      continue;
    }

    const lowerText = rawText.toLowerCase();
    if (!terms.every((term) => lowerText.includes(term))) {
      continue;
    }

    pushMatch(getSearchTarget(parent), "text");

    if (matches.length >= MAX_RESULTS * 2) {
      break;
    }
  }

  const attributeCandidates = document.querySelectorAll(
    [
      '[aria-label]',
      '[title]',
      '[placeholder]',
      '[alt]',
      "input",
      "textarea",
      "select",
      "button",
      '[role="button"]',
      '[role="link"]',
      '[contenteditable="true"]',
    ].join(","),
  );

  attributeCandidates.forEach((candidate) => {
    pushMatch(candidate, "control");
  });

  return matches
    .sort((a, b) => a.score - b.score || a.snippet.length - b.snippet.length)
    .slice(0, MAX_RESULTS);
};

const PageSearchModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const inputRef = useRef(null);
  const lastActiveElementRef = useRef(null);
  const highlightBg = useColorModeValue("orange.200", "orange.500");
  const panelBg = useColorModeValue("white", "gray.800");
  const panelBorder = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const bodyText = useColorModeValue("gray.700", "gray.200");
  const resultHover = useColorModeValue("orange.50", "whiteAlpha.100");
  const resultBorder = useColorModeValue("gray.100", "gray.700");
  const resultBadgeBg = useColorModeValue("orange.100", "orange.700");
  const resultBadgeColor = useColorModeValue("orange.700", "orange.100");
  const searchBg = useColorModeValue("white", "gray.700");
  const searchBorder = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("orange.500", "orange.300");
  const headerIconBg = useColorModeValue("orange.50", "orange.900");
  const infoPanelBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const commandBadgeBg = useColorModeValue("gray.100", "whiteAlpha.200");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const closeSearch = useCallback(
    (restoreFocus = true) => {
      onClose();
      setQuery("");
      setResults([]);
      setIsSearching(false);

      if (
        restoreFocus &&
        lastActiveElementRef.current instanceof HTMLElement &&
        lastActiveElementRef.current.isConnected &&
        typeof lastActiveElementRef.current.focus === "function"
      ) {
        window.requestAnimationFrame(() => {
          lastActiveElementRef.current.focus();
        });
      }
    },
    [onClose],
  );

  const openSearch = useCallback(() => {
    if (!isOpen) {
      lastActiveElementRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      onOpen();
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select?.();
  }, [isOpen, onOpen]);

  const activateResult = useCallback(
    (result) => {
      const target = result?.element;
      if (!(target instanceof HTMLElement)) {
        closeSearch();
        return;
      }

      closeSearch(false);

      window.requestAnimationFrame(() => {
        if (!target.isConnected) {
          return;
        }

        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });

        if (typeof target.focus === "function") {
          target.focus({ preventScroll: true });
        }

        const previousOutline = target.style.outline;
        const previousOutlineOffset = target.style.outlineOffset;
        const previousBoxShadow = target.style.boxShadow;

        target.style.outline = `3px solid ${accentColor}`;
        target.style.outlineOffset = "4px";
        target.style.boxShadow = `0 0 0 6px ${accentColor}22`;

        window.setTimeout(() => {
          if (!target.isConnected) {
            return;
          }

          target.style.outline = previousOutline;
          target.style.outlineOffset = previousOutlineOffset;
          target.style.boxShadow = previousBoxShadow;
        }, 1800);
      });
    },
    [accentColor, closeSearch],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (!isShortcut) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      openSearch();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [openSearch]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const raf = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select?.();
    });

    return () => window.cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setResults(searchVisiblePage(trimmed));
      setIsSearching(false);
    }, 140);

    return () => window.clearTimeout(timer);
  }, [isOpen, query, location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setResults([]);
    setQuery("");
  }, [location.pathname, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeSearch()}
      initialFocusRef={inputRef}
      size="4xl"
      scrollBehavior="inside"
      closeOnOverlayClick
      closeOnEsc
      motionPreset="scale"
    >
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(6px)" />
      <ModalContent
        bg={panelBg}
        borderColor={panelBorder}
        borderWidth="1px"
        borderRadius="2xl"
        boxShadow="2xl"
        data-global-search-ignore="true"
      >
        <ModalHeader pb={2}>
          <HStack spacing={3} align="center" justify="space-between">
            <HStack spacing={3} minW={0}>
              <Box
                p={2}
                borderRadius="xl"
                bg={headerIconBg}
                color={accentColor}
              >
                <Icon as={SearchIcon} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0} minW={0}>
                <Text fontSize="xl" fontWeight="800" lineHeight="1.1">
                  Page Search
                </Text>
                <Text fontSize="sm" color={mutedText} lineHeight="1.35">
                  Search visible text, buttons, labels, table content, and form
                  fields on the current page.
                </Text>
              </VStack>
            </HStack>
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              bg={commandBadgeBg}
              color={bodyText}
              fontSize="0.72rem"
              letterSpacing="0.04em"
            >
              Ctrl + K
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={mutedText} />
              </InputLeftElement>
              <Input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) {
                    event.preventDefault();
                    activateResult(results[0]);
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeSearch();
                  }
                }}
                placeholder="Type to search this page..."
                bg={searchBg}
                borderColor={searchBorder}
                _hover={{ borderColor: resultBadgeColor }}
                _focus={{
                  borderColor: resultBadgeColor,
                  boxShadow: `0 0 0 1px ${resultBadgeColor}`,
                }}
              />
            </InputGroup>

            <HStack justify="space-between" spacing={3} flexWrap="wrap">
              <Text fontSize="sm" color={mutedText}>
                Press <strong>Enter</strong> to jump to the first result or{" "}
                <strong>Esc</strong> to close.
              </Text>
              <Text fontSize="sm" color={mutedText}>
                Scope: current page only
              </Text>
            </HStack>

            <Divider borderColor={panelBorder} />

            <Box>
              {!query.trim() ? (
                <Box
                  p={6}
                  borderWidth="1px"
                  borderColor={resultBorder}
                  borderRadius="xl"
                  bg={infoPanelBg}
                >
                  <Text fontWeight="700" color={bodyText} mb={2}>
                    Search anything on the page
                  </Text>
                  <Text fontSize="sm" color={mutedText} lineHeight="1.7">
                    This search scans the visible page content, including
                    headings, cards, tables, buttons, inputs, and labels. It is
                    useful for quickly jumping to a specific field or section
                    without hunting through the page manually.
                  </Text>
                </Box>
              ) : isSearching ? (
                <HStack py={8} justify="center">
                  <Text color={mutedText}>Searching page content...</Text>
                </HStack>
              ) : results.length > 0 ? (
                <List spacing={3}>
                  {results.map((result) => (
                    <ListItem
                      key={result.id}
                      borderWidth="1px"
                      borderColor={resultBorder}
                      borderRadius="xl"
                      p={4}
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{
                        bg: resultHover,
                        borderColor: resultBadgeColor,
                        transform: "translateY(-1px)",
                      }}
                      onClick={() => activateResult(result)}
                    >
                      <HStack
                        align="start"
                        justify="space-between"
                        spacing={4}
                        w="100%"
                      >
                        <VStack align="start" spacing={2} minW={0} flex="1">
                          <HStack spacing={2} flexWrap="wrap">
                            <Badge
                              bg={resultBadgeBg}
                              color={resultBadgeColor}
                              textTransform="none"
                              borderRadius="full"
                              px={2.5}
                              py={0.5}
                            >
                              {result.kind === "control" ? "Control" : "Text"}
                            </Badge>
                            <Badge
                              variant="outline"
                              textTransform="uppercase"
                              letterSpacing="0.06em"
                              borderRadius="full"
                            >
                              {result.tag}
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="sm"
                            color={bodyText}
                            lineHeight="1.6"
                            noOfLines={3}
                          >
                            {highlightText(result.snippet, getQueryTerms(query), highlightBg)}
                          </Text>
                        </VStack>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  p={6}
                  borderWidth="1px"
                  borderColor={resultBorder}
                  borderRadius="xl"
                  bg={infoPanelBg}
                >
                  <Text fontWeight="700" color={bodyText} mb={2}>
                    No matches found
                  </Text>
                  <Text fontSize="sm" color={mutedText} lineHeight="1.7">
                    Try a shorter term, a different field name, or a section
                    title that appears on the page.
                  </Text>
                </Box>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PageSearchModal;
