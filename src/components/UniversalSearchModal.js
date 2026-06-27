import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Portal,
  Spinner,
  Stack,
  SimpleGrid,
  Tag,
  TagLabel,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import {
  FiArrowRight,
  FiBell,
  FiClipboard,
  FiCalendar,
  FiGrid,
  FiPhone,
  FiX,
  FiUsers,
} from "react-icons/fi";
import moment from "moment";

import { usePermissionContext } from "../contexts/PermissionContext";
import { fetchData } from "../utils/fetchData";
import { filterPersonnelData } from "../utils/filterUtils";

const SEARCH_HISTORY_KEY = "universal-search-history";

const getSearchHistoryStorageKey = () => {
  const rawUserId = String(localStorage.getItem("userId") ?? "").trim();
  const rawUsername = String(localStorage.getItem("username") ?? "").trim().toLowerCase();

  const userKey =
    rawUserId && rawUserId !== "null" && rawUserId !== "undefined"
      ? rawUserId
      : rawUsername;

  return `${SEARCH_HISTORY_KEY}:${userKey || "anonymous"}`;
};

const FILE_ORGANIZER_PATTERNS = [
  "/shelvespage",
  "/file-organizer/shelves",
  "/containers/:shelfId",
  "/file-organizer/shelves/:shelfId/containers",
  "/containers/:containerId/folders",
  "/shelves/:shelfId/containers/:containerId/folders/:folderId/documents",
  "/file-organizer/qrcode",
  "/file-organizer/scancode",
  "/file-organizer/tree",
  "/file-organizer/search",
];

const CATEGORY_CONFIG = [
  {
    key: "personnels",
    label: "Personnel",
    permission: "personnels.view",
    icon: FiUsers,
    accent: "blue.500",
    softBg: "blue.50",
    route: "/user",
    emptyHint: "Try a name, reference number, email address, section, or role.",
  },
  {
    key: "phone-directory",
    label: "Phone Directory",
    permission: "phonedirectory.view",
    icon: FiPhone,
    accent: "cyan.500",
    softBg: "cyan.50",
    route: "/managements/phonedirectory",
    emptyHint: "Try a name, extension, location, phone model, or DECT number.",
  },
  {
    key: "apps",
    label: "Apps",
    permission: "apps.view",
    icon: FiGrid,
    accent: "orange.500",
    softBg: "orange.50",
    route: "/application",
    emptyHint: "Try an app name, URL, type, or enabled/disabled status.",
  },
  {
    key: "suguan",
    label: "Suguan",
    permission: "suguan.view",
    icon: FiClipboard,
    accent: "teal.500",
    softBg: "teal.50",
    route: "/add-suguan",
    emptyHint: "Try a person name, congregation, district, role, or date.",
  },
  {
    key: "events",
    label: "Events",
    permission: "events.view",
    icon: FiCalendar,
    accent: "purple.500",
    softBg: "purple.50",
    route: "/add-events",
    emptyHint: "Try an event title, location, recurrence, or schedule date.",
  },
  {
    key: "reminders",
    label: "Reminders",
    permission: "reminders.view",
    icon: FiBell,
    accent: "pink.500",
    softBg: "pink.50",
    route: "/reminders",
    emptyHint: "Try a title, description, note, or reminder date.",
  },
];

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const lowerText = (value) => normalizeText(value).toLowerCase();

const splitQuery = (value) => lowerText(value)
  .split(" ")
  .filter(Boolean);

const joinDefined = (values, separator = " ") =>
  values.filter(Boolean).map((value) => String(value)).join(separator);

const applyAccessFilter = (key, items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  if (key === "personnels" || key === "suguan" || key === "reminders") {
    return filterPersonnelData(items);
  }

  return items;
};

const formatDate = (value, fallback = "N/A") => {
  if (!value) return fallback;
  const date = moment(value);
  return date.isValid() ? date.format("MMM D, YYYY") : fallback;
};

const formatTime = (value, fallback = "N/A") => {
  if (!value) return fallback;
  const time = moment(value, ["HH:mm:ss", "HH:mm", moment.ISO_8601], true);
  return time.isValid() ? time.format("h:mm A") : fallback;
};

const buildQueryRoute = (path, query, extraParams = {}) => {
  const params = new URLSearchParams();
  if (query?.trim()) params.set("search", query.trim());

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

const highlightParts = (text, terms, highlightBg) => {
  const clean = normalizeText(text);
  if (!clean || !terms.length) {
    return clean;
  }

  const escapedTerms = terms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const parts = clean.split(regex);

  return parts.map((part, index) => {
    if (terms.some((term) => part.toLowerCase() === term.toLowerCase())) {
      return (
        <Box
          as="mark"
          key={`${part}-${index}`}
          bg={highlightBg}
          color="inherit"
          px="1"
          borderRadius="sm"
        >
          {part}
        </Box>
      );
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
};

const includesAllTerms = (value, terms) => {
  const haystack = lowerText(value);
  return terms.every((term) => haystack.includes(term));
};

const getRelativePriority = (sourceIndex, title, query) => {
  const normalizedTitle = lowerText(title);
  const normalizedQuery = lowerText(query);

  let score = sourceIndex * 1000 + normalizedTitle.length;

  if (normalizedTitle.startsWith(normalizedQuery)) {
    score -= 250;
  }

  if (normalizedTitle.includes(normalizedQuery)) {
    score -= 150;
  }

  return score;
};

const buildPersonnelResult = (item, query, sourceIndex) => {
  const title = normalizeText(
    joinDefined([
      item.fullname && String(item.fullname).toLowerCase() !== "n/a"
        ? item.fullname
        : null,
      item.givenName || item.givenname,
      item.middlename,
      item.sn || item.surname_husband || item.personnel_surname_husband,
      item.suffix,
    ]),
  );

  const subtitle = joinDefined([
    item.personnel_type,
    item.work_email_address || item.email_address || item.mail || item.email,
    item.personnel_local_congregation_assignment_name ||
      item.registered_local_congregation ||
      item.local_congregation,
  ], " • ");

  const meta = [
    item.reference_number ? `Ref ${item.reference_number}` : null,
    item.personnel_id ? `ID ${item.personnel_id}` : null,
    item.personnel_district_assignment_name ||
    item.registered_district_id
      ? `District ${item.personnel_district_assignment_name || item.registered_district_id}`
      : null,
    item.section || item.personnel_section_name,
    item.subsection || item.personnel_subsection_name,
    item.designation_name || item.personnel_designation_name || item.role,
    item.username,
  ].filter(Boolean);

  const searchText = joinDefined([
    title,
    subtitle,
    meta.join(" "),
    item.nickname,
    item.gender,
    item.civil_status,
    item.bloodtype,
    item.personnel_district_assignment_name,
    item.personnel_local_congregation_assignment_name,
    item.personnel_section_name,
    item.personnel_subsection_name,
    item.personnel_designation_name,
    item.mail,
    item.email,
    item.date_of_birth ? moment(item.date_of_birth).format("MMMM D, YYYY") : "",
  ]);

  return {
    id: `personnels-${item.personnel_id || item.ID || item.id}`,
    sourceKey: "personnels",
    sourceLabel: "Personnel",
    title: title || item.username || `Personnel ${item.personnel_id || item.ID || item.id}`,
    subtitle: subtitle || item.email_address || item.work_email_address || "Personnel record",
    meta,
    icon: FiUsers,
    accent: "blue.500",
    route: buildQueryRoute("/user", query),
    searchText,
    score: getRelativePriority(sourceIndex, title || item.username || "", query),
    raw: item,
  };
};

const buildPhoneResult = (item, query, sourceIndex) => {
  const title = normalizeText(item.name || "Phone Contact");
  const subtitle = joinDefined([
    item.location,
    item.phone_name,
  ], " • ");

  const meta = [
    item.prefix && item.extension ? `Ext ${item.prefix}-${item.extension}` : null,
    item.dect_number ? `DECT ${item.dect_number}` : null,
    item.is_active === false || item.is_active === 0 ? "Inactive" : "Active",
  ].filter(Boolean);

  const searchText = joinDefined([
    title,
    subtitle,
    meta.join(" "),
    item.prefix,
    item.extension,
    item.dect_number,
  ]);

  return {
    id: `phone-directory-${item.id}`,
    sourceKey: "phone-directory",
    sourceLabel: "Phone Directory",
    title,
    subtitle: subtitle || "Phone directory entry",
    meta,
    icon: FiPhone,
    accent: "cyan.500",
    route: buildQueryRoute("/managements/phonedirectory", query),
    searchText,
    score: getRelativePriority(sourceIndex, title, query),
    raw: item,
  };
};

const buildAppResult = (item, query, sourceIndex) => {
  const active = item.is_active !== false && item.is_active !== 0 && item.is_active !== "0";
  const title = normalizeText(item.name || "App");
  const subtitle = joinDefined([
    item.description,
    item.url,
  ], " • ");

  const meta = [
    item.app_type_name,
    active ? "Enabled" : "Disabled",
  ].filter(Boolean);

  const searchText = joinDefined([
    title,
    subtitle,
    meta.join(" "),
    item.url,
    item.description,
    item.extension,
    item.dect_number,
    item.phone_name,
    item.filename,
  ]);

  return {
    id: `apps-${item.id}`,
    sourceKey: "apps",
    sourceLabel: "Apps",
    title,
    subtitle: subtitle || "Application",
    meta,
    icon: FiGrid,
    accent: active ? "orange.500" : "gray.400",
    route: buildQueryRoute("/application", query),
    searchText,
    score: getRelativePriority(sourceIndex, title, query),
    raw: item,
  };
};

const buildSuguanResult = (item, query, sourceIndex) => {
  const title = normalizeText(item.name || "Suguan");
  const dateLabel = formatDate(item.date);
  const timeLabel = formatTime(item.time);
  const weekLabel = item.date && moment(item.date).isValid()
    ? `Week ${moment(item.date).isoWeek()}`
    : null;
  const subtitle = joinDefined([
    item.local_congregation,
    item.personnel_name || item.personnel_id ? `Personnel ${item.personnel_id}` : null,
  ], " • ");

  const meta = [
    weekLabel,
    moment(item.date).isValid() ? moment(item.date).format("ddd") : null,
    dateLabel !== "N/A" ? dateLabel : null,
    timeLabel !== "N/A" ? timeLabel : null,
    item.gampanin_name || item.gampanin_id ? `Role ${item.gampanin_name || item.gampanin_id}` : null,
    item.district_name || item.district_id ? `District ${item.district_name || item.district_id}` : null,
  ].filter(Boolean);

  const searchText = joinDefined([
    title,
    subtitle,
    meta.join(" "),
    item.local_congregation,
    item.district_id,
    item.section_id,
    item.subsection_id,
    item.gampanin_name,
    item.gampanin_id,
    item.personnel_id,
    item.date ? moment(item.date).format("YYYY-MM-DD") : "",
    item.date ? moment(item.date).format("MMMM D, YYYY") : "",
  ]);

  return {
    id: `suguan-${item.id}`,
    sourceKey: "suguan",
    sourceLabel: "Suguan",
    title,
    subtitle: subtitle || "Weekly assignment",
    meta,
    icon: FiClipboard,
    accent: "teal.500",
    route: buildQueryRoute("/add-suguan", query, {
      date: item.date ? moment(item.date).format("YYYY-MM-DD") : "",
    }),
    searchText,
    score: getRelativePriority(sourceIndex, title, query),
    raw: item,
  };
};

const buildEventResult = (item, query, sourceIndex) => {
  const title = normalizeText(item.eventName || "Event");
  const subtitle = item.location?.name || item.locationName || item.location || "Event schedule";
  const dateLabel = formatDate(item.date);
  const timeLabel = formatTime(item.time);

  const meta = [
    item.recurrence && item.recurrence !== "none" ? item.recurrence : "One-time",
    dateLabel !== "N/A" ? dateLabel : null,
    timeLabel !== "N/A" ? timeLabel : null,
  ].filter(Boolean);

  const searchText = joinDefined([
    title,
    subtitle,
    meta.join(" "),
    item.date ? moment(item.date).format("YYYY-MM-DD") : "",
    item.date ? moment(item.date).format("MMMM D, YYYY") : "",
    item.time,
  ]);

  return {
    id: `events-${item.id}`,
    sourceKey: "events",
    sourceLabel: "Events",
    title,
    subtitle,
    meta,
    icon: FiCalendar,
    accent: "purple.500",
    route: buildQueryRoute("/add-events", query, {
      searchDate: item.date ? moment(item.date).format("YYYY-MM-DD") : "",
    }),
    searchText,
    score: getRelativePriority(sourceIndex, title, query),
    raw: item,
  };
};

const buildReminderResult = (item, query, sourceIndex) => {
  const title = normalizeText(item.title || "Reminder");
  const subtitle = joinDefined([
    item.description,
    item.message,
  ], " • ");
  const dateLabel = formatDate(item.reminder_date);
  const timeLabel = formatTime(item.time);

  const reminderDate = item.reminder_date ? moment(item.reminder_date) : null;
  const today = moment().startOf("day");
  const statusLabel = reminderDate && reminderDate.isBefore(today, "day")
    ? "Past due"
    : reminderDate && reminderDate.isSame(today, "day")
      ? "Today"
      : "Upcoming";

  const meta = [
    dateLabel !== "N/A" ? dateLabel : null,
    timeLabel !== "N/A" ? timeLabel : null,
    statusLabel,
  ].filter(Boolean);

  const searchText = joinDefined([
    title,
    subtitle,
    meta.join(" "),
    item.description,
    item.message,
    item.reminder_date ? moment(item.reminder_date).format("YYYY-MM-DD") : "",
  ]);

  return {
    id: `reminders-${item.id}`,
    sourceKey: "reminders",
    sourceLabel: "Reminders",
    title,
    subtitle: subtitle || "Reminder note",
    meta,
    icon: FiBell,
    accent: "pink.500",
    route: buildQueryRoute("/reminders", query),
    searchText,
    score: getRelativePriority(sourceIndex, title, query),
    raw: item,
  };
};

const ResultCard = ({
  result,
  terms,
  highlightBg,
  onClick,
  cardBg,
  cardBorder,
  cardHoverBg,
  titleColor,
  subtitleColor,
  metaTextColor,
}) => {
  const accent = result.accent;
  const accentTone = accent.split(".")[0];
  const iconBg = useColorModeValue(`${accentTone}.50`, "whiteAlpha.100");
  const badgeBg = useColorModeValue(`${accentTone}.100`, "whiteAlpha.200");

  return (
    <Box
      borderWidth="1px"
      borderColor={cardBorder}
      borderRadius="2xl"
      bg={cardBg}
      p={4}
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-2px)",
        bg: cardHoverBg,
        borderColor: accent,
        boxShadow: "lg",
      }}
      onClick={onClick}
    >
      <HStack align="start" spacing={4}>
        <Box
          p={3}
          borderRadius="xl"
          bg={iconBg}
          color={accent}
          flexShrink={0}
        >
          <Icon as={result.icon} boxSize={5} />
        </Box>

        <VStack align="start" spacing={2} flex="1" minW={0}>
          <HStack spacing={2} flexWrap="wrap" minW={0}>
            <Text fontWeight="800" color={titleColor} noOfLines={1}>
              {highlightParts(result.title, terms, highlightBg)}
            </Text>
            <Badge
              bg={badgeBg}
              color={accent}
              borderRadius="full"
              px={2.5}
              py={0.5}
              textTransform="none"
            >
              {result.sourceLabel}
            </Badge>
            {result.meta.includes("Disabled") && (
              <Badge colorScheme="red" variant="subtle" borderRadius="full">
                Disabled
              </Badge>
            )}
          </HStack>

          <Text fontSize="sm" color={subtitleColor} noOfLines={2} lineHeight="1.6">
            {highlightParts(result.subtitle, terms, highlightBg)}
          </Text>

          <HStack spacing={2} flexWrap="wrap" pt={1}>
            {result.meta.slice(0, 4).map((meta, index) => (
              <Tag
                key={`${result.id}-meta-${index}`}
                size="sm"
                variant="subtle"
                colorScheme="gray"
                borderRadius="full"
              >
                <TagLabel color={metaTextColor}>{meta}</TagLabel>
              </Tag>
            ))}
          </HStack>
        </VStack>

        <Icon
          as={FiArrowRight}
          boxSize={4}
          color={accent}
          mt={1}
          flexShrink={0}
          opacity={0.85}
        />
      </HStack>
    </Box>
  );
};

const SearchSummaryCard = ({
  config,
  count,
  onClick,
  cardBg,
  cardBorder,
  subtitleColor,
}) => {
  const accent = config.accent;
  const textColor = useColorModeValue("gray.800", "white");
  const iconBg = useColorModeValue(config.softBg, "whiteAlpha.100");
  return (
    <Box
      borderWidth="1px"
      borderColor={cardBorder}
      borderRadius="2xl"
      bg={cardBg}
      p={4}
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
      onClick={onClick}
    >
      <HStack spacing={3} align="start">
        <Box
          p={3}
          borderRadius="xl"
          bg={iconBg}
          color={accent}
        >
          <Icon as={config.icon} boxSize={5} />
        </Box>
        <VStack align="start" spacing={0} minW={0} flex="1">
          <Text fontWeight="800" color={textColor}>
            {config.label}
          </Text>
          <Text fontSize="sm" color={subtitleColor}>
            {count} matching record{count === 1 ? "" : "s"}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

const UniversalSearchModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission, isPermissionsLoading } = usePermissionContext();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const inputRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  const panelBg = useColorModeValue("white", "gray.800");
  const panelBorder = useColorModeValue("gray.200", "gray.700");
  const bodyBg = useColorModeValue("gray.50", "gray.900");
  const sectionBg = useColorModeValue("white", "gray.800");
  const titleColor = useColorModeValue("gray.900", "white");
  const subtitleColor = useColorModeValue("gray.600", "gray.300");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const cardHoverBg = useColorModeValue("orange.50", "whiteAlpha.100");
  const highlightBg = useColorModeValue("yellow.200", "yellow.400");
  const commandBadgeBg = useColorModeValue("whiteAlpha.300", "whiteAlpha.200");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.200", "gray.600");

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [recentQueries, setRecentQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedData, setLoadedData] = useState({
    personnels: [],
    "phone-directory": [],
    apps: [],
    suguan: [],
    events: [],
    reminders: [],
  });

  const isAuthenticated = Boolean(localStorage.getItem("authToken"));
  const groupId = localStorage.getItem("groupId");
  const isAuthRoute =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/enroll" ||
    location.pathname.startsWith("/enrollment/");
  const isFileOrganizerRoute = FILE_ORGANIZER_PATTERNS.some((pattern) =>
    matchPath({ path: pattern, end: false }, location.pathname),
  );
  const isSearchEnabled =
    isAuthenticated &&
    Boolean(groupId) &&
    !isAuthRoute &&
    !isFileOrganizerRoute &&
    !isPermissionsLoading;
  const searchHistoryStorageKey = getSearchHistoryStorageKey();

  const accessibleCategories = useMemo(
    () => CATEGORY_CONFIG.filter((category) => hasPermission(category.permission)),
    [hasPermission],
  );

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(searchHistoryStorageKey) || "[]");
      setRecentQueries(Array.isArray(stored) ? stored : []);
    } catch (error) {
      console.warn("Failed to load universal search history:", error);
      setRecentQueries([]);
    }
  }, [searchHistoryStorageKey]);

  const saveQueryHistory = useCallback((nextQuery) => {
    const clean = normalizeText(nextQuery);
    if (!clean) return;

    const updated = [
      clean,
      ...recentQueries.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 6);

    setRecentQueries(updated);
    localStorage.setItem(searchHistoryStorageKey, JSON.stringify(updated));
  }, [recentQueries, searchHistoryStorageKey]);

  const loadData = useCallback(async () => {
    if (!isSearchEnabled || !accessibleCategories.length) {
      setLoadedData({
        personnels: [],
        "phone-directory": [],
        apps: [],
        suguan: [],
        events: [],
        reminders: [],
      });
      return;
    }

    setIsLoading(true);
    try {
      const requests = accessibleCategories.map((category) => {
        switch (category.key) {
          case "personnels":
            return fetchData("users", null, null, null, { fast: 1 });
          case "phone-directory":
            return fetchData("phone-directory");
          case "apps":
            return fetchData("apps");
          case "suguan":
            return fetchData("suguan");
          case "events":
            return fetchData("events");
          case "reminders":
            return fetchData("reminders");
          default:
            return Promise.resolve([]);
        }
      });

      const settled = await Promise.allSettled(requests);
      const nextData = {
        personnels: [],
        "phone-directory": [],
        apps: [],
        suguan: [],
        events: [],
        reminders: [],
      };
      const failedLabels = [];

      settled.forEach((result, index) => {
        const category = accessibleCategories[index];
        if (result.status === "fulfilled") {
          const value = Array.isArray(result.value) ? result.value : [];
          nextData[category.key] = applyAccessFilter(category.key, value);
        } else {
          failedLabels.push(category.label);
        }
      });

      setLoadedData(nextData);

      if (failedLabels.length > 0) {
        toast({
          title: failedLabels.length === accessibleCategories.length
            ? "Search data unavailable"
            : "Partial search data loaded",
          description: failedLabels.length === accessibleCategories.length
            ? "We could not load the search datasets right now."
            : `Some datasets could not be loaded: ${failedLabels.join(", ")}.`,
          status: failedLabels.length === accessibleCategories.length ? "error" : "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessibleCategories, isSearchEnabled, toast]);

  useEffect(() => {
    if (!isOpen || !isSearchEnabled) {
      return undefined;
    }

    loadData();
    return undefined;
  }, [isOpen, isSearchEnabled, loadData]);

  useEffect(() => {
    if (!isSearchEnabled) return undefined;

    const onKeyDown = (event) => {
      const shortcutPressed =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (!shortcutPressed) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      if (!isOpen) {
        lastActiveElementRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        onOpen();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select?.();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, isSearchEnabled, onOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const raf = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select?.();
    });

    return () => window.cancelAnimationFrame(raf);
  }, [isOpen]);

  const normalizeSearchQuery = lowerText(query);
  const searchTerms = splitQuery(query);

  const records = useMemo(() => {
    if (!searchTerms.length) return [];

    const sourceOrder = accessibleCategories.reduce((acc, category, index) => {
      acc[category.key] = index;
      return acc;
    }, {});

    const builders = {
      personnels: buildPersonnelResult,
      "phone-directory": buildPhoneResult,
      apps: buildAppResult,
      suguan: buildSuguanResult,
      events: buildEventResult,
      reminders: buildReminderResult,
    };

    const searchData = {
      personnels: loadedData.personnels,
      "phone-directory": loadedData["phone-directory"],
      apps: loadedData.apps,
      suguan: loadedData.suguan,
      events: loadedData.events,
      reminders: loadedData.reminders,
    };

    const results = [];

    accessibleCategories.forEach((category) => {
      const items = Array.isArray(searchData[category.key]) ? searchData[category.key] : [];
      const builder = builders[category.key];
      if (!builder) return;

      const sourceIndex = sourceOrder[category.key] ?? 0;

      items.forEach((item) => {
        if (category.key === "personnels" && item?.personnel_id == null) {
          return;
        }

        const result = builder(item, query, sourceIndex);
        if (!includesAllTerms(result.searchText, searchTerms)) {
          return;
        }

        results.push(result);
      });
    });

    return results.sort((a, b) => a.score - b.score || a.title.localeCompare(b.title));
  }, [accessibleCategories, loadedData, query, searchTerms]);

  const filteredRecords = useMemo(() => {
    if (activeCategory === "all") {
      return records;
    }

    return records.filter((record) => record.sourceKey === activeCategory);
  }, [activeCategory, records]);

  const recordsByCategory = useMemo(() => {
    const grouped = {};
    filteredRecords.forEach((record) => {
      if (!grouped[record.sourceKey]) {
        grouped[record.sourceKey] = [];
      }
      grouped[record.sourceKey].push(record);
    });
    return grouped;
  }, [filteredRecords]);

  const availableFilters = useMemo(() => {
    const counts = {};
    const countSource = searchTerms.length
      ? records
      : accessibleCategories.flatMap((category) => {
          const items = Array.isArray(loadedData[category.key]) ? loadedData[category.key] : [];
          return items.map(() => category.key);
        });

    countSource.forEach((entry) => {
      const key = typeof entry === "string" ? entry : entry.sourceKey;
      counts[key] = (counts[key] || 0) + 1;
    });

    return [
      { key: "all", label: "All", icon: SearchIcon, count: records.length, accent: "gray.600" },
      ...accessibleCategories.map((category) => ({
        key: category.key,
        label: category.label,
        icon: category.icon,
        count: counts[category.key] || 0,
        accent: category.accent,
      })),
    ];
  }, [accessibleCategories, loadedData, records, searchTerms.length]);

  const firstResult = filteredRecords[0];

  const closeModal = useCallback(() => {
    saveQueryHistory(query);
    onClose();
    setQuery("");
    setActiveCategory("all");

    if (
      lastActiveElementRef.current instanceof HTMLElement &&
      lastActiveElementRef.current.isConnected &&
      typeof lastActiveElementRef.current.focus === "function"
    ) {
      window.requestAnimationFrame(() => {
        lastActiveElementRef.current.focus();
      });
    }
  }, [onClose, query, saveQueryHistory]);

  useEffect(() => {
    if (isOpen && !isSearchEnabled) {
      closeModal();
    }
  }, [closeModal, isOpen, isSearchEnabled]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape, true);
    return () => document.removeEventListener("keydown", handleEscape, true);
  }, [closeModal, isOpen]);

  const openFirstResult = useCallback(() => {
    if (!firstResult) return;
    saveQueryHistory(query);
    closeModal();
    navigate(firstResult.route);
  }, [closeModal, firstResult, navigate, query, saveQueryHistory]);

  const handleResultClick = useCallback((result) => {
    saveQueryHistory(query);
    closeModal();
    navigate(result.route);
  }, [closeModal, navigate, query, saveQueryHistory]);

  const handleSearchSubmit = useCallback((event) => {
    if (event.key !== "Enter") return;
    saveQueryHistory(query);
    if (firstResult) {
      event.preventDefault();
      openFirstResult();
    }
  }, [firstResult, openFirstResult, query, saveQueryHistory]);

  const handleOpenHistory = useCallback((term) => {
    setQuery(term);
    setActiveCategory("all");
  }, []);

  const totals = useMemo(() => {
    return accessibleCategories.reduce(
      (acc, category) => {
        acc.total += (loadedData[category.key] || []).length;
        return acc;
      },
      { total: 0 },
    );
  }, [accessibleCategories, loadedData]);

  if (!isSearchEnabled) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        zIndex={100011}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 6 }}
        onClick={closeModal}
      >
        <Box
          position="absolute"
          inset={0}
          bg="blackAlpha.500"
          backdropFilter="blur(8px)"
          zIndex={0}
        />

        <Box
          position="relative"
          zIndex={1}
          w="full"
          maxW="6xl"
          maxH="88vh"
          bg={panelBg}
          border="1px solid"
          borderColor={panelBorder}
          borderRadius="3xl"
          boxShadow="2xl"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          onClick={(event) => event.stopPropagation()}
        >
          <Flex
            px={{ base: 4, md: 6 }}
            py={{ base: 4, md: 5 }}
            bgGradient="linear(to-r, orange.500, teal.500, blue.500)"
            color="white"
            align="flex-start"
            justify="space-between"
            gap={4}
            flexWrap="wrap"
          >
            <VStack align="start" spacing={1} minW={0} flex="1">
              <Text fontSize="2xl" fontWeight="900" lineHeight="1">
                Universal Search
              </Text>
              <Text fontSize="sm" opacity={0.95} maxW="xl">
                Search personnel, phone directory entries, apps, suguan, events, and reminders from one place.
              </Text>
            </VStack>

            <HStack spacing={2} align="center" flexShrink={0}>
              <Badge
                bg={commandBadgeBg}
                color="white"
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="0.75rem"
                letterSpacing="0.06em"
              >
                Ctrl + K
              </Badge>
              <IconButton
                type="button"
                onClick={closeModal}
                variant="ghost"
                color="white"
                aria-label="Close universal search"
                icon={<FiX />}
                _hover={{ bg: "whiteAlpha.200" }}
                size="sm"
              />
            </HStack>
          </Flex>

          <Box bg={bodyBg} p={{ base: 4, md: 6 }} flex="1" overflowY="auto" minH={0}>
            <VStack spacing={5} align="stretch">
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={mutedText} />
                </InputLeftElement>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleSearchSubmit}
                  placeholder="Search people, extensions, apps, schedules, and notes..."
                  bg={inputBg}
                  borderColor={inputBorder}
                  borderRadius="2xl"
                  _focus={{
                    borderColor: "orange.400",
                    boxShadow: "0 0 0 1px rgba(249, 115, 22, 0.4)",
                  }}
                />
              </InputGroup>

              <HStack
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                spacing={4}
                flexWrap="wrap"
              >
                <Text fontSize="sm" color={subtitleColor}>
                  Type a name, location, title, or status. Press Enter to open the first match.
                </Text>
                <Text fontSize="sm" color={subtitleColor}>
                  {records.length} match{records.length === 1 ? "" : "es"} across {accessibleCategories.length} source{accessibleCategories.length === 1 ? "" : "s"}
                </Text>
              </HStack>

              <Wrap spacing={2}>
                {availableFilters.map((filter) => (
                  <WrapItem key={filter.key}>
                    <Button
                      size="sm"
                      variant={activeCategory === filter.key ? "solid" : "outline"}
                      colorScheme={activeCategory === filter.key ? "orange" : "gray"}
                      bg={activeCategory === filter.key ? undefined : panelBg}
                      borderRadius="full"
                      leftIcon={<Icon as={filter.icon} />}
                      onClick={() => setActiveCategory(filter.key)}
                    >
                      <HStack spacing={2}>
                        <Text>{filter.label}</Text>
                        <Badge
                          bg={activeCategory === filter.key ? "whiteAlpha.300" : "gray.100"}
                          color={activeCategory === filter.key ? "white" : "gray.700"}
                          borderRadius="full"
                          px={2}
                        >
                          {filter.count}
                        </Badge>
                      </HStack>
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>

              <Divider borderColor={panelBorder} />

              {isLoading ? (
                <Flex py={16} justify="center" align="center">
                  <VStack spacing={3}>
                    <Spinner size="xl" color="orange.500" thickness="4px" />
                    <Text color={subtitleColor} fontWeight="600">
                      Loading search sources...
                    </Text>
                  </VStack>
                </Flex>
              ) : !normalizeSearchQuery ? (
                <Stack spacing={4}>
                  <Box
                    bg={sectionBg}
                    borderWidth="1px"
                    borderColor={panelBorder}
                    borderRadius="2xl"
                    p={{ base: 4, md: 5 }}
                  >
                    <HStack justify="space-between" align="start" spacing={4} mb={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="900" color={titleColor} fontSize="lg">
                          Search history
                        </Text>
                        <Text fontSize="sm" color={subtitleColor}>
                          Jump back into searches you used recently.
                        </Text>
                      </VStack>
                      <Text fontSize="sm" color={subtitleColor}>
                        {totals.total} records loaded
                      </Text>
                    </HStack>

                    {recentQueries.length > 0 ? (
                      <Wrap spacing={2}>
                        {recentQueries.map((term) => (
                          <WrapItem key={term}>
                            <Tag
                              size="lg"
                              borderRadius="full"
                              variant="subtle"
                              colorScheme="orange"
                              cursor="pointer"
                              onClick={() => handleOpenHistory(term)}
                            >
                              <TagLabel>{term}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    ) : (
                      <Text fontSize="sm" color={mutedText}>
                        Your recent searches will appear here after you start using the command palette.
                      </Text>
                    )}
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                    {accessibleCategories.map((category) => {
                      const count = (loadedData[category.key] || []).length;
                      return (
                        <SearchSummaryCard
                          key={category.key}
                          config={category}
                          count={count}
                          cardBg={cardBg}
                          cardBorder={cardBorder}
                          subtitleColor={subtitleColor}
                          onClick={() => {
                            closeModal();
                            navigate(category.route);
                          }}
                        />
                      );
                    })}
                  </SimpleGrid>

                  <Box
                    bg={sectionBg}
                    borderWidth="1px"
                    borderColor={panelBorder}
                    borderRadius="2xl"
                    p={{ base: 4, md: 5 }}
                  >
                    <Text fontWeight="900" color={titleColor} mb={2}>
                      What you can search
                    </Text>
                    <Wrap spacing={2}>
                      {accessibleCategories.map((category) => (
                        <WrapItem key={`hint-${category.key}`}>
                          <Tag
                            colorScheme="gray"
                            variant="outline"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            <TagLabel>{category.emptyHint}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                </Stack>
              ) : filteredRecords.length > 0 ? (
                <Stack spacing={5}>
                  {activeCategory === "all" ? (
                    accessibleCategories.map((category) => {
                      const grouped = recordsByCategory[category.key] || [];
                      if (!grouped.length) return null;

                      return (
                        <Box key={category.key}>
                          <HStack justify="space-between" mb={3}>
                            <HStack spacing={2}>
                              <Icon as={category.icon} color={category.accent} />
                              <Text fontWeight="900" color={titleColor}>
                                {category.label}
                              </Text>
                            </HStack>
                            <Badge colorScheme="gray" variant="subtle" borderRadius="full">
                              {grouped.length}
                            </Badge>
                          </HStack>

                          <VStack spacing={3} align="stretch">
                            {grouped.map((result) => (
                              <ResultCard
                                key={result.id}
                                result={result}
                                terms={searchTerms}
                                highlightBg={highlightBg}
                                onClick={() => handleResultClick(result)}
                                cardBg={cardBg}
                                cardBorder={cardBorder}
                                cardHoverBg={cardHoverBg}
                                titleColor={titleColor}
                                subtitleColor={subtitleColor}
                                metaTextColor={mutedText}
                              />
                            ))}
                          </VStack>
                        </Box>
                      );
                    })
                  ) : (
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <Text fontWeight="900" color={titleColor}>
                          {accessibleCategories.find((category) => category.key === activeCategory)?.label || "Matches"}
                        </Text>
                        <Badge colorScheme="gray" variant="subtle" borderRadius="full">
                          {filteredRecords.length}
                        </Badge>
                      </HStack>

                      <VStack spacing={3} align="stretch">
                        {filteredRecords.map((result) => (
                          <ResultCard
                            key={result.id}
                            result={result}
                            terms={searchTerms}
                            highlightBg={highlightBg}
                            onClick={() => handleResultClick(result)}
                            cardBg={cardBg}
                            cardBorder={cardBorder}
                            cardHoverBg={cardHoverBg}
                            titleColor={titleColor}
                            subtitleColor={subtitleColor}
                            metaTextColor={mutedText}
                          />
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Box
                  bg={sectionBg}
                  borderWidth="1px"
                  borderColor={panelBorder}
                  borderRadius="2xl"
                  p={{ base: 5, md: 6 }}
                  textAlign="center"
                >
                  <Text fontWeight="900" color={titleColor} fontSize="lg" mb={2}>
                    No matches found
                  </Text>
                  <Text color={subtitleColor} lineHeight="1.7">
                    Try a different name, extension, title, or status. You can also switch
                    categories above to narrow the search.
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};

export default UniversalSearchModal;
