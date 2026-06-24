import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import {
  Box, Flex, Text, Heading, Button, Input, Select, Textarea,
  Icon, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, useToast,
  VStack, HStack, SimpleGrid, Spinner, Tooltip, InputGroup, InputLeftElement,
  Avatar,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ReactSelect from "react-select";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiPrinter,
  FiList, FiGrid, FiCheckSquare, FiFileText, FiClock,
  FiPenTool, FiType, FiUpload, FiCalendar,
  FiImage, FiSave, FiRotateCcw, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { PieChart, Pie, Cell } from "recharts";
import { getAuthHeaders } from "../utils/apiHeaders";

const API = process.env.REACT_APP_API_URL || "";

const formatPrintHours = (hours) => {
  const value = Number.parseFloat(hours);
  if (!Number.isFinite(value) || value <= 0) return "0";

  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1).replace(/\.0$/, "");
};

const formatPrintHourLabel = (hours) => {
  const value = Number.parseFloat(hours);
  const numeric = Number.isFinite(value) && value > 0
    ? formatPrintHours(value)
    : "0";
  const unit = numeric === "1" || numeric === "0" ? "hr" : "hrs";
  return `${numeric} ${unit}`;
};

const formatR510Date = (date) => {
  if (!date) return "";
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return "";
  const month = value.getMonth() + 1;
  const day = value.getDate();
  const year = String(value.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const splitHoursMinutes = (hours) => {
  const numeric = Number.parseFloat(hours);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { hours: "", minutes: "0" };
  }

  const totalMinutes = Math.round(numeric * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    hours: wholeHours ? String(wholeHours) : "",
    minutes: minutes === 0 ? "0" : String(minutes).padStart(2, "0"),
  };
};

const isCompletedTask = (task) => (
  task?.status === "Completed" || task?.kanban_status === "Done"
);

const isDateInRange = (date, start, end) => Boolean(date && start && end && date >= start && date <= end);

const getSelectedWeekCompletionDate = (week) => {
  const today = todayISO();
  return isDateInRange(today, week?.start, week?.end) ? today : week?.start;
};

const MotionBox = motion.create(Box);

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:          "#F8F9FA",
  corpBlue:    "#1E3A5F",
  amber:       "#F59E0B",
  amberLight:  "#FEF3C7",
  emerald:     "#10B981",
  crimson:     "#DC2626",
  purple:      "#7C3AED",
  royalBlue:   "#2563EB",
  cardBorder:  "#F59E0B",
};

// ─── Category color map (name → design-spec color) ────────────────────────────
const CAT_COLORS = {
  "Office Task":          "#D97706",   // Warm Amber / Gold
  "Worship Service":      "#DC2626",   // Rich Crimson / Dark Red
  "Outside Office Task":  "#7C3AED",   // Modern Purple / Indigo
  "Personal Task":        "#2563EB",   // Vibrant Royal Blue
};

const REPORT_CATEGORY_ORDER = [
  "Worship Service",
  "Office Task",
  "Outside Office Task",
  "Personal Task",
];

const WEEKLY_BAR_STACK_ORDER = [
  "Office Task",
  "Personal Task",
  "Outside Office Task",
  "Worship Service",
];

const WEEK_RANGE_SIZE = 6;
const MIN_WEEK_OFFSET = -12;
const MAX_WEEK_OFFSET = 4;

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  Critical: { color: "#DC2626", label: "CRITICAL", bg: "#FEE2E2" },
  High:     { color: "#EA580C", label: "HIGH",     bg: "#FFEDD5" },
  Medium:   { color: "#D97706", label: "MEDIUM",   bg: "#FEF3C7" },
  Low:      { color: "#2563EB", label: "LOW",      bg: "#DBEAFE" },
};

// ─── Time Formatter ───────────────────────────────────────────────────────────
const fmtTime = (timeStr) => {
  if (!timeStr) return "—";
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1] || "0", 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

const calcTaskHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const [startH = 0, startM = 0, startS = 0] = String(startTime).split(":").map(Number);
  const [endH = 0, endM = 0, endS = 0] = String(endTime).split(":").map(Number);

  const startMinutes = (startH * 60) + startM + (startS / 60);
  const endMinutes = (endH * 60) + endM + (endS / 60);
  const diffMinutes = endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : (24 * 60 - startMinutes) + endMinutes;

  return diffMinutes / 60;
};

// ─── Status badge config ───────────────────────────────────────────────────────
const STATUS_CFG = {
  Active:    { bg: "#EFF6FF", color: "#1D4ED8", label: "ACTIVE" },
  Completed: { bg: "#D1FAE5", color: "#065F46", label: "COMPLETED" },
};

// ─── Kanban columns config ────────────────────────────────────────────────────
const KANBAN_CFG = {
  "New":                  { bg: "#F8F9FA", borderTop: "4px solid #9CA3AF", badgeBg: "gray.100",  badgeColor: "gray.700" },
  "Blocked":              { bg: "#FFF5F5", borderTop: "4px solid #E53E3E", badgeBg: "red.100",   badgeColor: "red.700" },
  "In Progress":          { bg: "#EBF8FF", borderTop: "4px solid #3182CE", badgeBg: "blue.100",  badgeColor: "blue.700" },
  "Waiting for approval": { bg: "#FFFDF5", borderTop: "4px solid #D69E2E", badgeBg: "orange.100", badgeColor: "orange.700" },
  "Done":                 { bg: "#F0FDF4", borderTop: "4px solid #38A169", badgeBg: "green.100",  badgeColor: "green.700" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const fmtDay  = (d) => DAYS[new Date(d + "T00:00:00").getDay()];
const todayISO = () => localISO(new Date());

// Use local date components to avoid UTC timezone day-shift (e.g. UTC+8 midnight = previous UTC day)
const localISO = (dt) => {
  const y  = dt.getFullYear();
  const m  = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const resolveMediaUrl = (assetPath) => {
  if (!assetPath) return "";
  if (/^(https?:|data:)/i.test(assetPath)) return assetPath;
  if (assetPath.startsWith("/")) return `${API}${assetPath}`;
  return `${API ? `${API}/` : "/"}${assetPath}`;
};

function getWeekBounds(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  const day = d.getDay();
  const monday = new Date(d); monday.setDate(d.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  return { start: localISO(monday), end: localISO(sunday) };
}

// Returns the ISO 8601 week number for a given Date
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // treat Sunday as 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function weekLabel({ start, end }) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end   + "T00:00:00");
  const weekNum = getISOWeek(s);
  const fmt = (dt) => dt.toLocaleDateString("en-PH", { month: "long", day: "numeric" });
  return `Week ${weekNum}, ${fmt(s)} to ${fmt(e)}`;
}

// ─── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: "#F3F4F6", color: "#374151", label: (status || "—").toUpperCase() };
  return (
    <Box
      as="span"
      bg={cfg.bg}
      color={cfg.color}
      fontSize="9px"
      fontWeight="900"
      letterSpacing="0.1em"
      px={3}
      py="3px"
      borderRadius="full"
      textTransform="uppercase"
      display="inline-block"
      whiteSpace="nowrap"
    >
      {cfg.label}
    </Box>
  );
}

// ─── Shared card style ─────────────────────────────────────────────────────────
const pillRow = {
  bg: "white",
  borderRadius: "2xl",
  boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  border: "1px solid #F3F4F6",
  px: 4,
  py: 3,
  transition: "all 0.15s",
  _hover: { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", borderColor: T.amber, transform: "translateY(-1px)" },
};

// ─── Column-header row ─────────────────────────────────────────────────────────
function ColHeaders({ cols }) {
  return (
    <Box px={5} py={2} bg="#F8F9FA" borderBottom="1px solid #F3F4F6">
      <Flex gap={3} align="center">
        {cols.map(({ label, flex }) => (
          <Text key={label} flex={flex} fontSize="9px" fontWeight="800" color="gray.400"
            textTransform="uppercase" letterSpacing="0.12em">
            {label}
          </Text>
        ))}
      </Flex>
    </Box>
  );
}

// ─── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ title, action }) {
  return (
    <Flex align="center" justify="space-between" px={5} py={4} borderBottom="1px solid #F3F4F6">
      <Text fontWeight="900" color={T.corpBlue} fontSize="sm" letterSpacing="0.08em" textTransform="uppercase">
        {title}
      </Text>
      {action}
    </Flex>
  );
}

// ─── Task Modal ────────────────────────────────────────────────────────────────
function TaskModal({ isOpen, onClose, categories, onSaved, initial, currentWeek }) {
  const toast = useToast();
  const blank = useMemo(() => ({
    title: "",
    category_id: "",
    description: "",
    local_congregations: "",
    task_date: todayISO(),
    start_time: "",
    end_time: "",
    status: "Active",
    priority: "Medium",
  }), []);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextForm = initial ? { ...blank, ...initial } : { ...blank };
    const initialCategoryName = categories.find(
      (category) => String(category.category_id) === String(nextForm.category_id)
    )?.category_name || "";

    if (initialCategoryName === "Worship Service") {
      nextForm.local_congregations = nextForm.local_congregations || "";
    } else {
      nextForm.local_congregations = nextForm.local_congregations || "";
    }

    setForm(nextForm);
  }, [blank, categories, initial, isOpen]); // eslint-disable-line

  const selectedCategoryName = categories.find(
    (category) => String(category.category_id) === String(form.category_id)
  )?.category_name || "";
  const showWorshipLocalCongregations = selectedCategoryName === "Worship Service";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "category_id") {
        const nextCategoryName = categories.find(
          (category) => String(category.category_id) === String(value)
        )?.category_name || "";
        if (nextCategoryName !== "Worship Service") {
          next.local_congregations = "";
        }
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.category_id || !form.task_date) {
      toast({ title: "Please fill in all required fields.", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const currentDate = todayISO();
    const isCurrentWeekView = Boolean(
      currentWeek?.start &&
      currentWeek?.end &&
      isDateInRange(currentDate, currentWeek.start, currentWeek.end)
    );
    const isCarryoverTask = Boolean(
      initial?.task_id &&
      initial?.task_date &&
      currentWeek?.start &&
      initial.task_date < currentWeek.start
    );

    if (
      initial?.task_id &&
      isCarryoverTask &&
      isCurrentWeekView &&
      initial?.status !== "Completed" &&
      form.status === "Completed" &&
      form.task_date !== currentDate
    ) {
      toast({
        title: "Update the task date.",
        description: "Carried-over tasks marked as Completed must use today's date.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    try {
      const savePayload = {
        ...form,
        local_congregations: showWorshipLocalCongregations ? (form.local_congregations || "") : null,
        kanban_status: form.status === "Completed"
          ? "Done"
          : form.kanban_status === "Done"
            ? "New"
            : form.kanban_status || "New",
      };

      if (
        form.status === "Completed" &&
        currentWeek?.start &&
        !isDateInRange(form.task_date, currentWeek.start, currentWeek.end)
      ) {
        savePayload.task_date = getSelectedWeekCompletionDate(currentWeek);
      }

      if (initial?.task_id) {
        await axios.put(`${API}/api/dar/tasks/${initial.task_id}`, savePayload, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API}/api/dar/tasks`, savePayload, { headers: getAuthHeaders() });
      }
      toast({ title: initial ? "Task updated!" : "Task created!", status: "success", duration: 2000, isClosable: true });
      onSaved(); onClose();
    } catch (err) {
      toast({ title: "Failed to save task.", description: err.response?.data?.error || err.response?.data?.message || err.message, status: "error", duration: 3000, isClosable: true });
    } finally { setSaving(false); }
  };

  const fieldStyle = {
    borderRadius: "xl",
    borderColor: "gray.200",
    _focus: { borderColor: T.amber, boxShadow: `0 0 0 1px ${T.amber}` },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" border={`2px solid ${T.amber}`}>
        <ModalHeader bg={T.corpBlue} color="white" fontWeight="900" fontSize="md"
          letterSpacing="0.06em" textTransform="uppercase">
          {initial ? "✏️ Edit Task" : "➕ New Task"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={6} bg="white">
          <VStack spacing={4}>
            <SimpleGrid columns={2} spacing={4} w="full">
              <Box>
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Title *</Text>
                <Input name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Inventory Update" {...fieldStyle} />
              </Box>
              <Box>
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Category *</Text>
                <Select name="category_id" value={form.category_id} onChange={handleChange} {...fieldStyle}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                </Select>
              </Box>
            </SimpleGrid>
            <Box w="full">
              <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Description</Text>
              <Textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Optional details…" rows={3} {...fieldStyle} />
            </Box>
            {showWorshipLocalCongregations && (
              <Box w="full">
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">
                  Local Congregations
                </Text>
                <Textarea
                  name="local_congregations"
                  value={form.local_congregations}
                  onChange={handleChange}
                  placeholder="e.g. Cupang Muntinlupa, MMS, and other local congregations"
                  rows={3}
                  {...fieldStyle}
                />
              </Box>
            )}
            <SimpleGrid columns={3} spacing={4} w="full">
              <Box>
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Date *</Text>
                <Input type="date" name="task_date" value={form.task_date} onChange={handleChange} {...fieldStyle} />
              </Box>
              <Box>
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Start Time</Text>
                <Input type="time" name="start_time" value={form.start_time} onChange={handleChange} {...fieldStyle} />
              </Box>
              <Box>
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">End Time</Text>
                <Input type="time" name="end_time" value={form.end_time} onChange={handleChange} {...fieldStyle} />
              </Box>
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4} w="full">
              <Box>
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Priority</Text>
                <Select name="priority" value={form.priority || "Medium"} onChange={handleChange} {...fieldStyle}>
                  {["Critical", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </Box>
              <Box>
                <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Status</Text>
                <Select name="status" value={form.status} onChange={handleChange} {...fieldStyle}>
                  {["Active", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Box>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3} bg="white" borderTop="1px solid #F3F4F6">
          <Button onClick={onClose} variant="ghost" borderRadius="xl" color="gray.500">Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}
            bg={T.emerald} color="white" borderRadius="xl" fontWeight="900"
            _hover={{ bg: "#059669", transform: "translateY(-1px)" }}
            _active={{ bg: "#047857" }}
            boxShadow={`0 4px 14px ${T.emerald}55`}>
            Save Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ─── Log Modal ─────────────────────────────────────────────────────────────────
function LogModal({ isOpen, onClose, task, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ completed_time: "", hours_rendered: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(task?.logs?.[0]
      ? { completed_time: task.logs[0].completed_time || "", hours_rendered: task.logs[0].hours_rendered || "" }
      : { completed_time: "", hours_rendered: "" });
  }, [task, isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const sanitizedHours = parseFloat(form.hours_rendered) || 0.00;
      await axios.post(`${API}/api/dar/logs`, {
        task_id: task.task_id,
        completed_time: form.completed_time || null,
        hours_rendered: sanitizedHours
      }, { headers: getAuthHeaders() });
      toast({ title: "Log saved!", status: "success", duration: 2000, isClosable: true });
      onSaved(); onClose();
    } catch (err) {
      toast({ title: "Failed to save log.", description: err.response?.data?.error || err.response?.data?.message || err.message, status: "error", duration: 3000, isClosable: true });
    } finally { setSaving(false); }
  };

  const fieldStyle = { borderRadius: "xl", borderColor: "gray.200", _focus: { borderColor: T.amber, boxShadow: `0 0 0 1px ${T.amber}` } };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" border={`2px solid ${T.amber}`}>
        <ModalHeader bg={T.corpBlue} color="white" fontWeight="900" fontSize="md"
          letterSpacing="0.06em" textTransform="uppercase">
          ⏱️ Log Accomplishment
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={6} bg="white">
          <VStack spacing={4}>
            <Box w="full">
              <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Completed Time</Text>
              <Input type="time" value={form.completed_time}
                onChange={e => setForm(f => ({ ...f, completed_time: e.target.value }))} {...fieldStyle} />
            </Box>
            <Box w="full">
              <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Hours Rendered</Text>
              <Input type="number" step="0.25" min="0" max="24" value={form.hours_rendered}
                onChange={e => setForm(f => ({ ...f, hours_rendered: e.target.value }))}
                placeholder="e.g. 2.5" {...fieldStyle} />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3} bg="white" borderTop="1px solid #F3F4F6">
          <Button onClick={onClose} variant="ghost" borderRadius="xl" color="gray.500">Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}
            bg={T.emerald} color="white" borderRadius="xl" fontWeight="900"
            _hover={{ bg: "#059669" }} boxShadow={`0 4px 14px ${T.emerald}55`}>
            Save Log
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const SIGNATURE_COLORS = ["#111827", "#0F4C81", "#1E3A8A", "#4B5563", "#15803D", "#C2410C"];
const DAR_SIGNATURE_STORAGE_KEY = "daily-activity-report-signature";
const SIGNATURE_FONTS = [
  { label: "Classic", family: '"Brush Script MT", "Segoe Script", cursive' },
  { label: "Elegant", family: '"Lucida Handwriting", "Segoe Script", cursive' },
  { label: "Modern", family: '"Comic Sans MS", "Segoe Print", cursive' },
  { label: "Formal", family: 'Georgia, "Times New Roman", serif' },
];

function SignatureModal({ isOpen, onClose, onSave, initialSignature, signerName }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [mode, setMode] = useState("draw");
  const [drawColor, setDrawColor] = useState(SIGNATURE_COLORS[0]);
  const [typedName, setTypedName] = useState(signerName || "");
  const [typedColor, setTypedColor] = useState(SIGNATURE_COLORS[0]);
  const [typedFont, setTypedFont] = useState(SIGNATURE_FONTS[0]);
  const [typedSlant, setTypedSlant] = useState(0);
  const [uploadedSignature, setUploadedSignature] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTypedName(signerName || "");
    }
  }, [isOpen, signerName]);

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(rect.width * ratio, 1);
    canvas.height = Math.max(rect.height * ratio, 1);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
  }, []);

  useEffect(() => {
    if (!isOpen || mode !== "draw") return;
    const id = window.setTimeout(prepareCanvas, 80);
    return () => window.clearTimeout(id);
  }, [isOpen, mode, prepareCanvas]);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getCanvasPoint(event);
  };

  const draw = (event) => {
    if (!drawingRef.current || !canvasRef.current) return;
    event.preventDefault();

    const ctx = canvasRef.current.getContext("2d");
    const nextPoint = getCanvasPoint(event);
    const lastPoint = lastPointRef.current || nextPoint;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(nextPoint.x, nextPoint.y);
    ctx.stroke();

    lastPointRef.current = nextPoint;
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasDrawn(false);
  };

  const saveDrawnSignature = () => {
    if (!hasDrawn || !canvasRef.current) return;
    onSave(canvasRef.current.toDataURL("image/png"));
  };

  const createTypedSignature = useCallback((font = typedFont) => {
    const value = typedName.trim();
    if (!value) return "";

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 260;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = typedColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `88px ${font.family}`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.transform(1, 0, Number(typedSlant) / 100, 1, 0, 0);
    ctx.fillText(value, 0, 8);

    return canvas.toDataURL("image/png");
  }, [typedColor, typedFont, typedName, typedSlant]);

  const saveTypedSignature = (font = typedFont) => {
    const dataUrl = createTypedSignature(font);
    if (!dataUrl) return;
    onSave(dataUrl);
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setUploadedSignature(reader.result);
    reader.readAsDataURL(file);
  };

  const modeCards = [
    {
      id: "draw",
      icon: FiPenTool,
      title: "Draw Signature",
      text: "Use mouse, touchpad, phone, or tablet to draw your signature.",
    },
    {
      id: "type",
      icon: FiType,
      title: "Type Signature",
      text: "Type your name and choose a clean handwriting style.",
    },
    {
      id: "upload",
      icon: FiUpload,
      title: "Upload Signature",
      text: "Upload an existing PNG, JPG, or transparent signature image.",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(6px)" />
      <ModalContent borderRadius="3xl" overflow="hidden" bg="white">
        <ModalHeader bg="#EAF7FA" borderBottom="1px solid #D7EEF3" py={5}>
          <VStack align="start" spacing={1}>
            <Text color={T.corpBlue} fontSize="lg" fontWeight="900">
              Online Signature Maker and Generator
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="600">
              Draw, type, or upload your signature for the Daily Activity Report.
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton size="lg" top={4} />

        <ModalBody p={{ base: 4, md: 6 }}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
            {modeCards.map((card) => (
              <Button
                key={card.id}
                h="132px"
                whiteSpace="normal"
                borderRadius="2xl"
                border="1.5px solid"
                borderColor={mode === card.id ? "#4AA6B5" : "gray.200"}
                bg={mode === card.id ? "#F0FCFF" : "white"}
                boxShadow={mode === card.id ? "0 12px 30px rgba(74, 166, 181, 0.16)" : "sm"}
                onClick={() => setMode(card.id)}
                _hover={{ borderColor: "#4AA6B5", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <VStack spacing={2}>
                  <Icon as={card.icon} boxSize={8} color="#4AA6B5" />
                  <Text fontWeight="900" color={T.corpBlue}>{card.title}</Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="500" lineHeight="1.4">
                    {card.text}
                  </Text>
                </VStack>
              </Button>
            ))}
          </SimpleGrid>

          {mode === "draw" && (
            <VStack spacing={5} align="stretch">
              <Box
                border="1.5px solid #D7EEF3"
                borderRadius="2xl"
                bg="white"
                boxShadow="0 18px 45px rgba(15, 23, 42, 0.06)"
                p={4}
              >
                <Box position="relative" h={{ base: "220px", md: "280px" }}>
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      touchAction: "none",
                      cursor: "crosshair",
                    }}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                  />
                  <Box position="absolute" left="6%" right="6%" bottom="34px" borderBottom="1px solid #E5E7EB" pointerEvents="none" />
                </Box>
              </Box>

              <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                <HStack spacing={3}>
                  <Text fontSize="sm" fontWeight="800" color={T.corpBlue}>Color</Text>
                  {SIGNATURE_COLORS.map((color) => (
                    <Box
                      as="button"
                      key={color}
                      w="26px"
                      h="26px"
                      borderRadius="full"
                      bg={color}
                      border={drawColor === color ? "3px solid #BEE3EA" : "2px solid white"}
                      boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                      onClick={() => setDrawColor(color)}
                      aria-label={`Use ${color} signature color`}
                    />
                  ))}
                </HStack>
                <HStack>
                  <Button leftIcon={<FiRotateCcw />} variant="ghost" borderRadius="full" onClick={clearCanvas}>
                    Clear
                  </Button>
                  <Button
                    leftIcon={<FiSave />}
                    bg="#4AA6B5"
                    color="white"
                    borderRadius="full"
                    px={8}
                    isDisabled={!hasDrawn}
                    _hover={{ bg: "#3B94A3" }}
                    onClick={saveDrawnSignature}
                  >
                    Save
                  </Button>
                </HStack>
              </Flex>
            </VStack>
          )}

          {mode === "type" && (
            <VStack spacing={5} align="stretch">
              <Flex gap={3} align="center" justify="center" flexWrap="wrap">
                <Input
                  value={typedName}
                  onChange={(event) => setTypedName(event.target.value)}
                  placeholder="Type your name"
                  maxW="520px"
                  size="lg"
                  borderRadius="xl"
                  borderColor="#D7EEF3"
                  _focus={{ borderColor: "#4AA6B5", boxShadow: "0 0 0 1px #4AA6B5" }}
                />
                <Button
                  bg="#4AA6B5"
                  color="white"
                  borderRadius="full"
                  px={8}
                  _hover={{ bg: "#3B94A3" }}
                  onClick={() => saveTypedSignature()}
                  isDisabled={!typedName.trim()}
                >
                  Save Selected
                </Button>
              </Flex>

              <Flex justify="center" gap={5} flexWrap="wrap">
                <HStack spacing={3}>
                  <Text fontSize="sm" fontWeight="800" color={T.corpBlue}>Color</Text>
                  {SIGNATURE_COLORS.map((color) => (
                    <Box
                      as="button"
                      key={color}
                      w="26px"
                      h="26px"
                      borderRadius="full"
                      bg={color}
                      border={typedColor === color ? "3px solid #BEE3EA" : "2px solid white"}
                      boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                      onClick={() => setTypedColor(color)}
                      aria-label={`Use ${color} signature color`}
                    />
                  ))}
                </HStack>
                <HStack spacing={3}>
                  <Text fontSize="sm" fontWeight="800" color={T.corpBlue}>Slant</Text>
                  <Input
                    type="range"
                    min="-18"
                    max="24"
                    value={typedSlant}
                    onChange={(event) => setTypedSlant(event.target.value)}
                    w="180px"
                  />
                </HStack>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {SIGNATURE_FONTS.map((font) => (
                  <Box
                    key={font.label}
                    as="button"
                    type="button"
                    minH="150px"
                    borderRadius="2xl"
                    bg="white"
                    border="1.5px solid"
                    borderColor={typedFont.label === font.label ? "#4AA6B5" : "gray.100"}
                    boxShadow={typedFont.label === font.label ? "0 14px 32px rgba(74, 166, 181, 0.16)" : "sm"}
                    onClick={() => setTypedFont(font)}
                  >
                    <Text
                      color={typedColor}
                      fontSize={{ base: "34px", md: "42px" }}
                      fontFamily={font.family}
                      transform={`skewX(${typedSlant}deg)`}
                    >
                      {typedName || signerName || "Your Signature"}
                    </Text>
                    <Text mt={2} fontSize="xs" color="gray.400" fontWeight="700">
                      {font.label}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          )}

          {mode === "upload" && (
            <VStack spacing={5} align="stretch">
              <Box
                border="2px dashed #BEE3EA"
                borderRadius="2xl"
                bg="#F8FEFF"
                p={8}
                textAlign="center"
              >
                <Icon as={FiImage} boxSize={10} color="#4AA6B5" mb={3} />
                <Text fontWeight="900" color={T.corpBlue}>Upload Signature</Text>
                <Text fontSize="sm" color="gray.500" mt={1} mb={4}>
                  PNG, JPG, or JPEG works best. Transparent PNG is recommended.
                </Text>
                <Input type="file" accept="image/*" maxW="360px" mx="auto" onChange={handleUpload} />
              </Box>

              {uploadedSignature && (
                <Flex
                  align="center"
                  justify="space-between"
                  gap={4}
                  p={4}
                  border="1px solid #E5E7EB"
                  borderRadius="2xl"
                  bg="white"
                  flexWrap="wrap"
                >
                  <Box flex="1" minW="240px" textAlign="center">
                    <img
                      src={uploadedSignature}
                      alt="Uploaded signature preview"
                      style={{ maxHeight: "110px", maxWidth: "100%", objectFit: "contain" }}
                    />
                  </Box>
                  <Button
                    leftIcon={<FiSave />}
                    bg="#4AA6B5"
                    color="white"
                    borderRadius="full"
                    px={8}
                    _hover={{ bg: "#3B94A3" }}
                    onClick={() => onSave(uploadedSignature)}
                  >
                    Save Upload
                  </Button>
                </Flex>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter borderTop="1px solid #EEF2F7" bg="white" justifyContent="space-between" gap={3} flexWrap="wrap">
          <HStack minW={0}>
            <Text fontSize="xs" color="gray.500" fontWeight="700">Current signature:</Text>
            {initialSignature ? (
              <Box h="34px" maxW="140px">
                <img src={initialSignature} alt="Current signature" style={{ height: "34px", maxWidth: "140px", objectFit: "contain" }} />
              </Box>
            ) : (
              <Text fontSize="xs" color="gray.400">None saved</Text>
            )}
          </HStack>
          <Button onClick={onClose} variant="ghost" borderRadius="full">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DailyActivityReport() {
  const toast      = useToast();
  const taskModal  = useDisclosure();
  const logModal   = useDisclosure();
  const signatureModal = useDisclosure();

  const [tasks,      setTasks]      = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [reports,    setReports]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("list");
  const [printTarget, setPrintTarget] = useState("dar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [searchQ,    setSearchQ]    = useState("");
  const [filterCat,  setFilterCat]  = useState("");
  const [sortAZ,     setSortAZ]     = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [logTask,    setLogTask]    = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [assignedNumber, setAssignedNumber] = useState("");
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState(() => (
    typeof window !== "undefined"
      ? localStorage.getItem(DAR_SIGNATURE_STORAGE_KEY) || ""
      : ""
  ));

  const week = useMemo(() => getWeekBounds(weekOffset), [weekOffset]);

  const rollingWeeks = useMemo(() => (
    Array.from({ length: WEEK_RANGE_SIZE }, (_, index) => {
      const offset = weekOffset - ((WEEK_RANGE_SIZE - 1) - index);
      const bounds = getWeekBounds(offset);
      return {
        ...bounds,
        offset,
        label: `Week ${getISOWeek(new Date(`${bounds.start}T00:00:00`))}`,
        weekNumber: getISOWeek(new Date(`${bounds.start}T00:00:00`)),
      };
    })
  ), [weekOffset]);

  const historyWeekRange = useMemo(() => ({
    start: rollingWeeks[0]?.start || week.start,
    end: rollingWeeks[rollingWeeks.length - 1]?.end || week.end,
  }), [rollingWeeks, week.end, week.start]);

  const weekOptions = useMemo(() => {
    const opts = [];
    for (let i = MIN_WEEK_OFFSET; i <= MAX_WEEK_OFFSET; i++) {
      const w = getWeekBounds(i);
      opts.push({
        offset: i,
        label: weekLabel(w),
      });
    }
    return opts;
  }, []);

  const getTaskKanbanStatus = (t) => {
    if (isCompletedTask(t)) return "Done";
    if (t.kanban_status && t.kanban_status !== "Done") return t.kanban_status;
    return "New";
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
  };

  const handleDrop = async (e, targetKanbanStatus) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData("text/plain");
    if (!taskIdStr) return;
    const taskId = parseInt(taskIdStr, 10);
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return;

    const newStatus = targetKanbanStatus === "Done" ? "Completed" : "Active";
    const originalKanbanStatus = task.kanban_status || "New";
    const originalStatus = task.status || "Active";
    const originalTaskDate = task.task_date;
    const shouldMoveIntoSelectedWeek = targetKanbanStatus === "Done" &&
      !isDateInRange(task.task_date, week.start, week.end);
    const nextTaskDate = shouldMoveIntoSelectedWeek
      ? getSelectedWeekCompletionDate(week)
      : task.task_date;

    setDragOverCol(null);
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, kanban_status: targetKanbanStatus, status: newStatus, task_date: nextTaskDate }
          : t
      )
    );

    void axios.put(
      `${API}/api/dar/tasks/${taskId}`,
      {
        kanban_status: targetKanbanStatus,
        status: newStatus,
        task_date: nextTaskDate
      },
      { headers: getAuthHeaders() }
    ).then(() => {
      toast({
        title: "Task moved.",
        status: "success",
        duration: 1200,
        isClosable: true,
      });
    }).catch((err) => {
      setTasks(prev =>
        prev.map(t =>
          t.task_id === taskId
            ? { ...t, kanban_status: originalKanbanStatus, status: originalStatus, task_date: originalTaskDate }
            : t
        )
      );
      toast({
        title: "Failed to move task.",
        description: err.response?.data?.error || err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const userId = useMemo(() => {
    try {
      const t = localStorage.getItem("token");
      if (!t) return null;
      const p = JSON.parse(atob(t.split(".")[1]));
      return p.id || p.sub || null;
    } catch { return null; }
  }, []);

  const currentPersonnelId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const storedValue = localStorage.getItem("user_id") || localStorage.getItem("personnel_id") || "";
    const trimmedValue = String(storedValue).trim();
    return trimmedValue && trimmedValue !== "null" && trimmedValue !== "undefined" ? trimmedValue : "";
  }, []);

  const loggedInUserName = useMemo(() => {
    const fullName = typeof window !== "undefined"
      ? localStorage.getItem("userFullName")
      : "";
    const username = typeof window !== "undefined"
      ? localStorage.getItem("username")
      : "";

    return (fullName && fullName.trim()) || (username && username.trim()) || "User";
  }, []);

  const currentGroupName = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("groupName") || "";
  }, []);

  const currentDesignationName = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("designation_name") || "";
  }, []);

  const currentSectionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("section_id") || "";
  }, []);

  const currentSubsectionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("subsection_id") || "";
  }, []);

  const canSwitchDarUser = useMemo(() => {
    const groupName = normalizeText(currentGroupName);
    const designationName = normalizeText(currentDesignationName);
    return groupName === "admin" || groupName === "vip" || designationName === "team leader";
  }, [currentDesignationName, currentGroupName]);

  const [selectedDarUserId, setSelectedDarUserId] = useState(() => String(userId || ""));
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);

  const selectedDarUser = useMemo(() => {
    const selectedId = String(selectedDarUserId || userId || "");
    if (!selectedId) return null;

    const match = teamMembers.find((member) => String(member.userId) === selectedId);
    if (match) return match;

    if (selectedId === String(userId || "")) {
      return {
        userId: selectedId,
        fullname: loggedInUserName,
        username: typeof window !== "undefined" ? localStorage.getItem("username") || "" : "",
      };
    }

    return null;
  }, [loggedInUserName, selectedDarUserId, teamMembers, userId]);

  const selectedDarUserName = selectedDarUser?.fullname
    || selectedDarUser?.username
    || loggedInUserName;

  const activeDarUserId = String(selectedDarUser?.userId || selectedDarUserId || userId || "");

  const teamMemberOptions = useMemo(() => (
    teamMembers.map((member) => ({
      value: member.userId,
      label: `${member.fullname}${member.username ? ` (${member.username})` : ""}`,
      fullname: member.fullname,
      username: member.username,
      avatar: member.avatar,
      groupName: member.groupName,
    }))
  ), [teamMembers]);

  const selectedTeamMemberOption = useMemo(() => (
    teamMemberOptions.find((option) => option.value === activeDarUserId) || null
  ), [activeDarUserId, teamMemberOptions]);

  useEffect(() => {
    let isMounted = true;

    const fetchHeaderAvatar = async () => {
      const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";
      if (!username) {
        if (isMounted) {
          setHeaderAvatarUrl("/default-avatar.png");
        }
        return;
      }

      try {
        const userResponse = await axios.get(
          `${API}/api/users/logged-in`,
          {
            params: { username },
            headers: getAuthHeaders(),
          }
        );

        const userData = userResponse.data || {};
        let avatarUrl = "";

        if (userData.personnel_id) {
          try {
            const imageResponse = await axios.get(`${API}/api/personnel_images/2x2/${userData.personnel_id}`);
            const imageData = imageResponse.data;
            if (imageData?.success && imageData?.data?.image_url) {
              avatarUrl = resolveMediaUrl(imageData.data.image_url);
            }
          } catch (imageError) {
            console.error("Error fetching profile image:", imageError);
          }
        }

        if (!avatarUrl && userData.avatar) {
          avatarUrl = resolveMediaUrl(userData.avatar);
        }

        if (!avatarUrl) {
          const gender = String(userData.gender || "").toLowerCase();
          avatarUrl = gender === "female"
            ? "/female-avatar.png"
            : gender === "male"
              ? "/male-avatar.png"
              : "/default-avatar.png";
        }

        if (isMounted) {
          setHeaderAvatarUrl(avatarUrl);
        }
      } catch (error) {
        console.error("Error fetching logged-in user data:", error);
        if (isMounted) {
          setHeaderAvatarUrl("/default-avatar.png");
        }
      }
    };

    fetchHeaderAvatar();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!canSwitchDarUser) {
      setTeamMembers([]);
      setTeamMembersLoading(false);
      return;
    }

    let isMounted = true;

    const normalizeMember = (user) => {
      const userIdValue = String(user.user_id ?? user.ID ?? user.id ?? "").trim();
      if (!userIdValue) return null;

      const fullname = String(user.fullname || user.fullName || user.username || "").trim();
      const cleanFullname = fullname && normalizeText(fullname) !== "n/a" ? fullname : "";

      return {
        userId: userIdValue,
        personnelId: String(user.personnel_id ?? "").trim(),
        fullname: cleanFullname || user.username || `User ${userIdValue}`,
        username: user.username || "",
        groupName: user.groupname || user.groupName || "",
        sectionId: String(user.personnel_section_id ?? "").trim(),
        subsectionId: String(user.personnel_subsection_id ?? "").trim(),
        designationName: user.personnel_designation_name || "",
        departmentName: user.personnel_department_name || "",
        avatar: user.avatar || "",
      };
    };

    const fetchTeamMembers = async () => {
      setTeamMembersLoading(true);
      try {
        const response = await axios.get(`${API}/api/users`, {
          params: { fast: 1 },
          headers: getAuthHeaders(),
        });

        const rawUsers = Array.isArray(response.data) ? response.data : [];
        const normalizedUsers = rawUsers
          .map(normalizeMember)
          .filter(Boolean)
          .filter((member) => member.personnelId);

        const normalizedGroup = normalizeText(currentGroupName);
        const normalizedDesignation = normalizeText(currentDesignationName);
        const currentUserIdValue = String(userId || "");
        const currentSectionValue = String(currentSectionId || "");
        const currentSubsectionValue = String(currentSubsectionId || "");
        const isAdminLike = normalizedGroup === "admin" || normalizedGroup === "vip";
        const isTeamLeader = normalizedDesignation === "team leader";

        const filteredUsers = normalizedUsers.filter((member) => {
          if (member.userId === currentUserIdValue) return true;
          if (isAdminLike) return true;
          if (isTeamLeader) {
            const subsectionMatch = Boolean(
              currentSubsectionValue &&
              member.subsectionId &&
              String(member.subsectionId) === currentSubsectionValue
            );
            const sectionMatch = !currentSectionValue
              || (member.sectionId && String(member.sectionId) === currentSectionValue);
            return subsectionMatch && sectionMatch;
          }
          return false;
        });

        const selfEntry = normalizedUsers.find((member) => member.userId === currentUserIdValue);
        const mergedUsers = selfEntry && !filteredUsers.some((member) => member.userId === selfEntry.userId)
          ? [selfEntry, ...filteredUsers]
          : filteredUsers;

        const uniqueUsers = Array.from(
          new Map(mergedUsers.map((member) => [member.userId, member])).values()
        ).sort((a, b) => a.fullname.localeCompare(b.fullname, undefined, { sensitivity: "base" }));

        if (isMounted) {
          setTeamMembers(uniqueUsers);
          if (uniqueUsers.length > 0 && !uniqueUsers.some((member) => member.userId === currentUserIdValue)) {
            setSelectedDarUserId(uniqueUsers[0].userId);
          }
        }
      } catch (error) {
        console.error("Error fetching selectable DAR users:", error);
        if (isMounted) {
          setTeamMembers([]);
        }
      } finally {
        if (isMounted) {
          setTeamMembersLoading(false);
        }
      }
    };

    fetchTeamMembers();

    return () => {
      isMounted = false;
    };
  }, [canSwitchDarUser, currentDesignationName, currentGroupName, currentSectionId, currentSubsectionId, userId]);

  useEffect(() => {
    let isMounted = true;

    const fetchAssignedNumber = async () => {
      if (!currentPersonnelId) {
        setAssignedNumber("");
        return;
      }

      try {
        const response = await axios.get(`${API}/api/personnels/${currentPersonnelId}`, {
          headers: getAuthHeaders(),
        });

        if (isMounted) {
          setAssignedNumber(response.data?.assigned_number ?? "");
        }
      } catch (error) {
        if (isMounted) {
          setAssignedNumber("");
        }
        console.error("Failed to load assigned number:", error);
      }
    };

    fetchAssignedNumber();

    return () => {
      isMounted = false;
    };
  }, [currentPersonnelId]);

  const handleSaveSignature = useCallback((dataUrl) => {
    if (!dataUrl) return;

    setSignatureDataUrl(dataUrl);
    localStorage.setItem(DAR_SIGNATURE_STORAGE_KEY, dataUrl);
    toast({
      title: "Signature saved.",
      description: "Your signature will now appear on the printed DAR.",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
    signatureModal.onClose();
  }, [signatureModal, toast]);

  const handlePrint = useCallback((target) => {
    setPrintTarget(target);
    window.setTimeout(() => window.print(), 80);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params  = { user_id: activeDarUserId, week_start: week.start, week_end: week.end };
      const historyParams = { user_id: activeDarUserId, week_start: historyWeekRange.start, week_end: historyWeekRange.end };
      const headers = getAuthHeaders();
      const historyTaskRequest = axios
        .get(`${API}/api/dar/tasks`, { params: historyParams, headers })
        .then((response) => response.data)
        .catch(() => []);
      const [tRes, lRes, rRes, cRes, historyData] = await Promise.all([
        axios.get(`${API}/api/dar/tasks`,      { params, headers }),
        axios.get(`${API}/api/dar/logs`,       { params, headers }),
        axios.get(`${API}/api/dar/reports`,    { params, headers }),
        axios.get(`${API}/api/dar/categories`, { headers }),
        historyTaskRequest,
      ]);
      setTasks(tRes.data);
      setLogs(lRes.data);
      setReports(rRes.data);
      setCategories(cRes.data);
      setHistoryTasks(historyData);
    } catch (err) {
      toast({ title: "Failed to load data.", description: err.response?.data?.error || err.response?.data?.message || err.message, status: "error", duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [activeDarUserId, historyWeekRange.end, historyWeekRange.start, week, toast]);

  useEffect(() => { load(); }, [load]);

  // Category helpers (spec color takes priority over DB hex)
  const catColor = (id) => {
    const cat = categories.find(c => c.category_id === id);
    if (!cat) return "#6B7280";
    return CAT_COLORS[cat.category_name] || cat.color_hex || "#6B7280";
  };
  const catName = (id) => categories.find(c => c.category_id === id)?.category_name || "—";

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`${API}/api/dar/tasks/${id}`, { headers: getAuthHeaders() });
      toast({ title: "Task deleted.", status: "info", duration: 2000, isClosable: true });
      load();
    } catch (err) {
      toast({ title: "Delete failed.", description: err.response?.data?.error || err.response?.data?.message || err.message, status: "error", duration: 2000, isClosable: true });
    }
  };

  const filteredTasks = useMemo(() => {
    let t = [...tasks];
    if (searchQ)   t = t.filter(x => x.title.toLowerCase().includes(searchQ.toLowerCase()) || (x.description || "").toLowerCase().includes(searchQ.toLowerCase()));
    if (filterCat) t = t.filter(x => String(x.category_id) === filterCat);
    if (sortAZ)    t.sort((a, b) => a.title.localeCompare(b.title));
    return t;
  }, [tasks, searchQ, filterCat, sortAZ]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(week.start + "T00:00:00");
      d.setDate(d.getDate() + i);
      // Use localISO to avoid UTC day-shift in UTC+ timezones
      days.push(localISO(d));
    }
    return days;
  }, [week]);

  const getTaskReportDate = useCallback((task) => (
    isDateInRange(task?.task_date, week.start, week.end)
      ? task.task_date
      : getSelectedWeekCompletionDate(week)
  ), [week]);

  const completedTasksForReport = useMemo(() => (
    tasks.filter((task) => isCompletedTask(task) && weekDays.includes(getTaskReportDate(task)))
  ), [getTaskReportDate, tasks, weekDays]);

  const getTaskCategoryName = useCallback((task) => (
    normalizeText(
      task?.category?.category_name
      || categories.find((category) => String(category.category_id) === String(task?.category_id))?.category_name
      || ""
    )
  ), [categories]);

  const renderedHoursByTaskId = useMemo(() => {
    const map = new Map();
    logs.forEach((log) => {
      const taskId = String(log.task_id ?? log.task?.task_id ?? "").trim();
      if (!taskId) return;
      const parsedHours = Number.parseFloat(log.hours_rendered ?? 0);
      map.set(taskId, Number.isFinite(parsedHours) ? parsedHours : 0);
    });
    return map;
  }, [logs]);

  const getRenderedHoursForTask = useCallback((task) => {
    const taskId = String(task?.task_id ?? "").trim();
    if (!taskId) return 0;

    const loggedHours = renderedHoursByTaskId.get(taskId);
    if (Number.isFinite(loggedHours) && loggedHours > 0) {
      return loggedHours;
    }

    const fallbackHours = calcTaskHours(task?.start_time, task?.end_time);
    return Number.isFinite(fallbackHours) ? fallbackHours : 0;
  }, [renderedHoursByTaskId]);

  const activeCnt   = tasks.filter(t => !isCompletedTask(t)).length;
  const completeCnt = tasks.filter(isCompletedTask).length;
  const renderedHoursTotal = useMemo(() => (
    completedTasksForReport.reduce((sum, task) => sum + getRenderedHoursForTask(task), 0)
  ), [completedTasksForReport, getRenderedHoursForTask]);

  const catBreakdown = useMemo(() => categories.map(c => {
    const categoryId = String(c.category_id);
    const categoryTasks = completedTasksForReport.filter((task) => String(task.category_id) === categoryId);

    return {
      name: c.category_name,
      count: tasks.filter((task) => String(task.category_id) === categoryId).length,
      hours: categoryTasks.reduce((sum, task) => sum + getRenderedHoursForTask(task), 0),
      color: CAT_COLORS[c.category_name] || c.color_hex || "#6B7280",
    };
  }), [categories, tasks, completedTasksForReport, getRenderedHoursForTask]);

  const reportCategoryMetrics = useMemo(() => {
    const byName = new Map(catBreakdown.map((entry) => [entry.name, entry]));
    return REPORT_CATEGORY_ORDER.map((name) => (
      byName.get(name) || {
        name,
        count: 0,
        hours: 0,
        color: CAT_COLORS[name] || "#6B7280",
      }
    ));
  }, [catBreakdown]);

  const weeklyBreakdown = useMemo(() => (
    rollingWeeks.map((weekItem) => {
      const weekTasks = historyTasks.filter((task) => isDateInRange(task.task_date, weekItem.start, weekItem.end));
      const byCategory = WEEKLY_BAR_STACK_ORDER.map((name) => {
        const count = weekTasks.filter((task) => {
          const categoryName = getTaskCategoryName(task);
          return categoryName === normalizeText(name);
        }).length;
        return {
          name,
          count,
          color: CAT_COLORS[name] || "#6B7280",
        };
      });
      const total = byCategory.reduce((sum, item) => sum + item.count, 0);

      return {
        ...weekItem,
        total,
        byCategory,
      };
    })
  ), [getTaskCategoryName, historyTasks, rollingWeeks]);

  const maxWeeklyTotal = useMemo(() => (
    Math.max(...weeklyBreakdown.map((weekItem) => weekItem.total), 1)
  ), [weeklyBreakdown]);

  const weeklyRangeLabel = useMemo(() => {
    if (!weeklyBreakdown.length) return "";
    const startWeek = weeklyBreakdown[0]?.weekNumber;
    const endWeek = weeklyBreakdown[weeklyBreakdown.length - 1]?.weekNumber;
    if (!startWeek && !endWeek) return "";
    if (startWeek === endWeek) return `Week ${startWeek}`;
    return `Week ${startWeek} to Week ${endWeek}`;
  }, [weeklyBreakdown]);

  const headerReferenceDate = useMemo(() => {
    const today = todayISO();
    return isDateInRange(today, week.start, week.end) ? today : week.start;
  }, [week.end, week.start]);
  const headerWeekNumber = getISOWeek(new Date(`${week.start}T00:00:00`));
  const headerWeekDay = fmtDay(headerReferenceDate);
  const headerWeekDate = fmtDate(headerReferenceDate);

  const getDayReport = (date) => reports.find(r => r.report_date === date);
  const saveReport   = async (date, field, value) => {
    const ex = getDayReport(date);
    const payload = { user_id: activeDarUserId, report_date: date, accomplishments: ex?.accomplishments || "", remarks: ex?.remarks || "", personnel_remarks: ex?.personnel_remarks || "", [field]: value };
    await axios.post(`${API}/api/dar/reports`, payload, { headers: getAuthHeaders() });
    load();
  };

  // ─── Tab config ───────────────────────────────────────────────────────────────
  const TABS = [
    { id: "list",       icon: FiList,        label: "List View",  activeColor: T.corpBlue },
    { id: "card",       icon: FiGrid,        label: "Card View",  activeColor: T.purple   },
    { id: "accomplish", icon: FiCheckSquare, label: "Accomplish", activeColor: T.crimson  },
    { id: "report",     icon: FiFileText,    label: "Report",     activeColor: "#D97706"  },
  ];

  // ─── Shared input focus ring ───────────────────────────────────────────────────
  const reportTextarea = {
    size: "sm",
    rows: 3,
    borderRadius: "xl",
    fontSize: "xs",
    border: "1px dashed",
    borderColor: "gray.200",
    _focus: { border: `1.5px solid ${T.amber}`, boxShadow: `0 0 0 1px ${T.amber}` },
  };

  const printTaskHours = useMemo(() => {
    return new Map(
      tasks
        .filter(isCompletedTask)
        .map((task) => [task.task_id, calcTaskHours(task.start_time, task.end_time)])
    );
  }, [tasks]);

  const formatPrintAccomplishments = useCallback((text, dayTasks = []) => {
    const lines = String(text)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const normalizedTasks = dayTasks.map((task) => ({
      title: String(task.title || "").trim().toLowerCase(),
      task_id: task.task_id,
    }));

    const matchedTaskIds = new Set();
    const linesWithHours = lines.map((line) => {
      const clean = line.replace(/^[•\-*\s]+/, "").trim();
      const lower = clean.toLowerCase();

      const matchedTask = normalizedTasks.find(
        (task) => task.title && (lower === task.title || lower.includes(task.title) || task.title.includes(lower))
      );

      if (!matchedTask) return clean;
      matchedTaskIds.add(matchedTask.task_id);

      const taskHours = printTaskHours.get(matchedTask.task_id);
      const hoursLabel = formatPrintHours(taskHours);
      return hoursLabel ? `${clean} (${hoursLabel}hrs)` : clean;
    });

    const missingTaskLines = dayTasks
      .filter((task) => !matchedTaskIds.has(task.task_id))
      .map((task) => {
        const hoursLabel = formatPrintHours(printTaskHours.get(task.task_id));
        return hoursLabel ? `${task.title} (${formatPrintHourLabel(hoursLabel)})` : task.title;
      });

    return [...linesWithHours, ...missingTaskLines]
      .filter(Boolean)
      .map((line) => `• ${line}`)
      .join("\n");
  }, [printTaskHours]);

  const formatReportAccomplishments = useCallback((text, dayTasks = []) => {
    const lines = String(text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const normalizedLines = lines.map((line) => line.replace(/^[•\-*\s]+/, "").trim().toLowerCase());
    const missingTaskLines = dayTasks
      .filter((task) => {
        const title = String(task.title || "").trim().toLowerCase();
        return title && !normalizedLines.some(
          (line) => line === title || line.includes(title) || title.includes(line)
        );
      })
      .map((task) => `• ${task.title}`);

    return [...lines, ...missingTaskLines].join("\n");
  }, []);

  const printRows = useMemo(() => {
    return weekDays.map((date) => {
      const rpt = reports.find((r) => r.report_date === date);
      const dayTasks = completedTasksForReport.filter(
        (task) => getTaskReportDate(task) === date
      );
      const dayHours = dayTasks.reduce(
        (sum, task) => sum + Number.parseFloat(printTaskHours.get(task.task_id) || 0),
        0
      );
      const defaultAccomplishments = dayTasks
        .map((t) => {
          const hoursLabel = formatPrintHours(printTaskHours.get(t.task_id));
          return `• ${t.title} (${formatPrintHourLabel(hoursLabel)})`;
        })
        .join("\n");

      return {
        date,
        dayLabel: fmtDay(date),
        dayHoursLabel: formatPrintHourLabel(dayHours),
        accomplishments:
          formatPrintAccomplishments(rpt?.accomplishments, dayTasks) ||
          defaultAccomplishments ||
          "",
        remarks: rpt?.remarks || "",
        personnelRemarks: rpt?.personnel_remarks || "",
      };
    });
  }, [completedTasksForReport, getTaskReportDate, reports, weekDays, printTaskHours, formatPrintAccomplishments]);

  const printMeta = useMemo(() => {
    const totalHours = Array.from(printTaskHours.values()).reduce(
      (sum, hours) => sum + Number.parseFloat(hours || 0),
      0
    );

    return {
      name: selectedDarUserName,
      totalHours: Number.isFinite(totalHours) ? totalHours.toFixed(1) : "0.0",
      department: selectedDarUser?.departmentName || "Admin - TRG",
      weekNumber: getISOWeek(new Date(`${week.start}T00:00:00`)),
      petsangSaklaw: `${week.start} – ${week.end}`,
    };
  }, [printTaskHours, selectedDarUser?.departmentName, selectedDarUserName, week]);

  const r510aData = useMemo(() => {
    const categoryById = new Map(
      categories.map((category) => [category.category_id, String(category.category_name || "")])
    );
    const categoryName = (task) => normalizeText(categoryById.get(task.category_id) || "");
    const categoryKey = (task) => categoryName(task);
    const isWorshipTask = (task) => categoryKey(task) === "worship service";
    const isOfficeTask = (task) => categoryKey(task) === "office task";
    const isOutsideTask = (task) => categoryKey(task) === "outside office task";
    const isPersonalTask = (task) => categoryKey(task) === "personal task";
    const isSpecialTask = (task) => isOfficeTask(task) || isOutsideTask(task) || isPersonalTask(task);
    const taskHours = (task) => Number.parseFloat(printTaskHours.get(task.task_id) || 0);
    const uniqueDayCount = (items) => new Set(items.map((item) => item.task_date).filter(Boolean)).size;
    const sumHours = (items) => items.reduce((sum, item) => sum + taskHours(item), 0);

    const completedTasks = [...completedTasksForReport]
      .sort((a, b) => `${getTaskReportDate(a) || ""}`.localeCompare(`${getTaskReportDate(b) || ""}`));

    const worshipTasks = completedTasks.filter(isWorshipTask);
    const officeTasks = completedTasks.filter(isOfficeTask);
    const specialTasks = completedTasks.filter(isSpecialTask);
    const churchTasks = completedTasks.filter((task) => !isPersonalTask(task));
    const rowsSource = specialTasks;
    const specialRows = Array.from({ length: 27 }, (_, index) => {
      const task = rowsSource[index];
      if (!task) {
        return { date: "", detail: "", hours: "", minutes: "" };
      }

      const split = splitHoursMinutes(taskHours(task));
      return {
        date: formatR510Date(getTaskReportDate(task)),
        detail: task.title || task.description || "",
        hours: split.hours,
        minutes: split.minutes,
      };
    });

    const firstWorship = worshipTasks[0];
    const firstWorshipDay = firstWorship ? fmtDay(getTaskReportDate(firstWorship)) : "";
    const firstWorshipTime = firstWorship?.start_time ? fmtTime(firstWorship.start_time) : "";
    const dailyTotals = weekDays.map((date, index) => {
      const dayHours = churchTasks
        .filter((task) => getTaskReportDate(task) === date)
        .reduce((sum, task) => sum + taskHours(task), 0);
      const split = splitHoursMinutes(dayHours);

      return {
        date,
        label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
        hours: split.hours,
        minutes: split.minutes,
      };
    });

    return {
      assignedNo: assignedNumber ?? "",
      uri: "Regular",
      date: formatR510Date(week.end),
      worship: {
        count: worshipTasks.length ? String(worshipTasks.length) : "",
        dayCount: worshipTasks.length ? String(uniqueDayCount(worshipTasks)) : "",
        hours: splitHoursMinutes(sumHours(worshipTasks)).hours,
        minutes: splitHoursMinutes(sumHours(worshipTasks)).minutes,
        local: firstWorship?.local_congregations || "",
        day: firstWorshipDay,
        time: firstWorshipTime === "—" ? "" : firstWorshipTime,
      },
      office: {
        count: officeTasks.length ? String(officeTasks.length) : "0",
        dayCount: officeTasks.length ? String(uniqueDayCount(officeTasks)) : "",
        hours: splitHoursMinutes(sumHours(officeTasks)).hours,
        minutes: splitHoursMinutes(sumHours(officeTasks)).minutes,
      },
      specialRows,
      dailyTotals,
    };
  }, [assignedNumber, categories, completedTasksForReport, getTaskReportDate, printTaskHours, week.end, weekDays]);

  return (
    <>
    <Box className="no-print" minH="100vh" bg={T.bg} p={{ base: 3, md: 6 }}>

      {/* ── Page Header ── */}
      <Box
        bg="white"
        borderRadius="3xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 14px 40px rgba(15, 23, 42, 0.08)"
        px={{ base: 3, md: 4 }}
        py={{ base: 3, md: 4 }}
        mb={4}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "stretch", lg: "center" }}
          justify="space-between"
          gap={3}
        >
          <Box flex="1" minW={0}>
            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "3xl", xl: "4xl" }}
              fontWeight="900"
              color="#C05621"
              letterSpacing="0.04em"
              lineHeight="1.05"
              textTransform="uppercase"
            >
              DAILY ACTIVITY REPORT
            </Heading>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              color="gray.500"
              fontWeight="600"
              lineHeight="1.5"
              mt={1.5}
            >
              Track tasks, log hours, and generate your weekly DAR.
            </Text>
          </Box>

          <Flex
            gap={2}
            flexShrink={0}
            align="center"
            justify={{ base: "flex-start", xl: "flex-end" }}
            flexWrap="wrap"
          >
            <HStack
              spacing={2}
              px={3}
              py={2}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.100"
              bg="gray.50"
              minW="0"
            >
              <Avatar
                size="sm"
                name={loggedInUserName}
                src={headerAvatarUrl || undefined}
                bg="#D1D5DB"
                color="gray.700"
                border="2px solid white"
                boxShadow="0 4px 12px rgba(15, 23, 42, 0.08)"
              />
              <Box minW={0}>
                <Text fontSize="sm" fontWeight="900" color="gray.800" lineHeight="1.05" noOfLines={1}>
                  {loggedInUserName}
                </Text>
                <Text fontSize="xs" fontWeight="700" color="#2563EB" lineHeight="1.05" noOfLines={1}>
                  {printMeta.department}
                </Text>
              </Box>
            </HStack>

            <HStack
              spacing={2}
              px={3}
              py={2}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.100"
              bg="#F8FAFC"
              minW="0"
            >
              <Box
                w="32px"
                h="32px"
                borderRadius="full"
                bg="#EFF6FF"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={FiCalendar} color={T.crimson} boxSize={3.5} />
              </Box>
              <Box lineHeight="1.05">
                <Text fontSize="sm" fontWeight="900" color={T.crimson} lineHeight="1.05">
                  {headerWeekDay}
                </Text>
                <Text fontSize="xs" color="gray.600" fontWeight="600" lineHeight="1.05">
                  {headerWeekDate}
                </Text>
              </Box>
            </HStack>

            <HStack
              spacing={1.5}
              align="center"
              px={2.5}
              py={1.5}
              borderRadius="2xl"
              border="1px solid"
              borderColor="#FECACA"
              bg="#FFF1F2"
              minW="0"
            >
              <IconButton
                aria-label="Previous week"
                icon={<FiChevronLeft />}
                size="xs"
                variant="ghost"
                color={T.crimson}
                bg="white"
                borderRadius="full"
                isDisabled={weekOffset <= MIN_WEEK_OFFSET}
                onClick={() => setWeekOffset((current) => Math.max(MIN_WEEK_OFFSET, current - 1))}
                _hover={{ bg: "#FFE4E6" }}
              />
              <Box textAlign="center" minW="52px" lineHeight="1">
                <Text
                  fontSize="9px"
                  fontWeight="900"
                  color={T.crimson}
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                  lineHeight="1.1"
                >
                  Week
                </Text>
                <Text fontSize="md" fontWeight="900" color={T.crimson} lineHeight="1.05">
                  {headerWeekNumber}
                </Text>
              </Box>
              <IconButton
                aria-label="Next week"
                icon={<FiChevronRight />}
                size="xs"
                variant="ghost"
                color={T.crimson}
                bg="white"
                borderRadius="full"
                isDisabled={weekOffset >= MAX_WEEK_OFFSET}
                onClick={() => setWeekOffset((current) => Math.min(MAX_WEEK_OFFSET, current + 1))}
                _hover={{ bg: "#FFE4E6" }}
              />
            </HStack>

            {canSwitchDarUser && (
              <HStack
                spacing={2}
                px={2.5}
                py={2}
                borderRadius="2xl"
                border="1px solid"
                borderColor="orange.100"
                bg="#FFF7ED"
                flexShrink={0}
                minW={{ base: "100%", md: "280px", xl: "300px" }}
              >
                <Text
                  fontSize="9px"
                  fontWeight="900"
                  color="#C05621"
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                  whiteSpace="nowrap"
                  flexShrink={0}
                >
                  Viewing DAR of:
                </Text>
                <Box flex="1" minW={0}>
                  <ReactSelect
                    isSearchable
                    isClearable={false}
                    isDisabled={teamMembersLoading}
                    menuPlacement="auto"
                    maxMenuHeight={220}
                    placeholder={teamMembersLoading ? "Loading team members..." : "Search team members..."}
                    options={teamMemberOptions}
                    value={selectedTeamMemberOption}
                    onChange={(option) => setSelectedDarUserId(option?.value || "")}
                    noOptionsMessage={() => "No member found"}
                    formatOptionLabel={(option) => (
                      <Box>
                        <Text fontSize="sm" fontWeight="700" lineHeight="1.1" color="gray.800">
                          {option.fullname}
                        </Text>
                        <Text fontSize="10px" color="gray.500" lineHeight="1.1">
                          {option.username || option.groupName || "Member"}
                        </Text>
                      </Box>
                    )}
                    styles={{
                      container: (base) => ({
                        ...base,
                        width: "100%",
                      }),
                      control: (base, state) => ({
                        ...base,
                        minHeight: "30px",
                        borderRadius: "9999px",
                        borderColor: state.isFocused ? "#F59E0B" : "#FCD9A5",
                        boxShadow: state.isFocused ? "0 0 0 1px #F59E0B" : "none",
                        backgroundColor: "white",
                        cursor: "pointer",
                        "&:hover": { borderColor: "#F59E0B" },
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: "0 8px",
                      }),
                      input: (base) => ({
                        ...base,
                        margin: 0,
                        padding: 0,
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#9CA3AF",
                        fontSize: "12px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#374151",
                        fontSize: "12px",
                        fontWeight: 700,
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 20,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#C05621"
                          : state.isFocused
                            ? "#FFF7ED"
                            : "white",
                        color: state.isSelected ? "white" : "#1F2937",
                        fontSize: "12px",
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: 4,
                        color: "#C05621",
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                    }}
                  />
                </Box>
              </HStack>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* ── Analytics Cards ── */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box
          bg="white"
          borderRadius="2xl"
          p={5}
          boxShadow="sm"
          border={`1.5px solid ${T.amber}`}
          overflow="hidden"
        >
          <Text
            fontSize="9px"
            fontWeight="900"
            color={T.amber}
            textTransform="uppercase"
            letterSpacing="0.12em"
            mb={4}
          >
            Task Summary
          </Text>
          <Flex align="stretch" justify="space-between" minH="140px">
            <Box
              flex="1"
              textAlign="center"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              minW={0}
            >
              <Text fontSize={{ base: "4xl", md: "5xl", xl: "6xl" }} fontWeight="900" color={T.corpBlue} lineHeight="0.95">
                {activeCnt}
              </Text>
              <Text fontSize="10px" color="#16A34A" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em" mt={2}>
                Active Task
              </Text>
            </Box>
            <Box w="1px" bg={T.amber} mx={4} />
            <Box
              flex="1"
              textAlign="center"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              minW={0}
            >
              <Text fontSize={{ base: "4xl", md: "5xl", xl: "6xl" }} fontWeight="900" color={T.corpBlue} lineHeight="0.95">
                {completeCnt}
              </Text>
              <Text fontSize="10px" color={T.corpBlue} fontWeight="900" textTransform="uppercase" letterSpacing="0.1em" mt={2}>
                Complete Tasks
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box
          bg="white"
          borderRadius="2xl"
          p={5}
          boxShadow="sm"
          border={`1.5px solid ${T.amber}`}
          overflow="hidden"
        >
          <Flex align="center" justify="space-between" gap={3} mb={4}>
            <Text
              fontSize="9px"
              fontWeight="900"
              color={T.amber}
              textTransform="uppercase"
              letterSpacing="0.12em"
            >
              Category Breakdown
            </Text>
            <Text
              fontSize="9px"
              fontWeight="900"
              color="#C05621"
              textTransform="uppercase"
              letterSpacing="0.12em"
              noOfLines={1}
            >
              {weeklyRangeLabel}
            </Text>
          </Flex>
          <Flex gap={4} align="stretch" minH="152px">
            <SimpleGrid columns={2} spacingX={5} spacingY={4} flex="0.95" alignContent="center">
              {reportCategoryMetrics.map((c) => (
                <Box key={c.name} minW={0}>
                  <Text
                    fontSize="9px"
                    fontWeight="900"
                    color="gray.700"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    noOfLines={1}
                  >
                    {c.name}
                  </Text>
                  <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="900" color={T.corpBlue} lineHeight="0.95" mt={1}>
                    {c.count}
                  </Text>
                  <Box w="28px" h="2px" bg={c.color} mt={1.5} />
                </Box>
              ))}
            </SimpleGrid>
            <Box w="1px" bg={T.amber} />
            <Box flex="1.25" display="flex" flexDirection="column" justifyContent="space-between" minW={0}>
              <Flex align="flex-end" justify="space-between" gap={2} flex="1" px={1} pt={1} pb={1}>
                {weeklyBreakdown.map((weekItem) => {
                  const barHeight = weekItem.total > 0
                    ? Math.max(20, Math.round((weekItem.total / maxWeeklyTotal) * 84))
                    : 0;
                  const stackedSegments = WEEKLY_BAR_STACK_ORDER
                    .map((name) => weekItem.byCategory.find((entry) => entry.name === name))
                    .filter((entry) => entry && entry.count > 0);

                  return (
                    <Box key={weekItem.label} textAlign="center" flex="1" minW="0">
                      <Box h="92px" display="flex" alignItems="flex-end" justifyContent="center">
                        {weekItem.total > 0 ? (
                          <Box
                            w="14px"
                            h={`${barHeight}px`}
                            display="flex"
                            flexDirection="column-reverse"
                            justifyContent="flex-start"
                            gap="0"
                            overflow="hidden"
                          >
                            {stackedSegments.map((segment, index) => {
                              const segmentHeight = Math.max(4, Math.round((segment.count / weekItem.total) * barHeight));
                              const isBottomSegment = index === 0;
                              const isTopSegment = index === stackedSegments.length - 1;

                              return (
                                <Box
                                  key={segment.name}
                                  h={`${segmentHeight}px`}
                                  bg={segment.color}
                                  borderBottomRadius={isBottomSegment ? "full" : 0}
                                  borderTopRadius={isTopSegment ? "full" : 0}
                                  boxShadow={`0 6px 16px ${segment.color}33`}
                                />
                              );
                            })}
                          </Box>
                        ) : (
                          <Box
                            w="14px"
                            h="14px"
                            borderRadius="full"
                            border="1px dashed"
                            borderColor="gray.200"
                          />
                        )}
                      </Box>
                      <Text
                        fontSize="8px"
                        mt={2}
                        fontWeight="800"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        noOfLines={1}
                      >
                        {weekItem.label}
                      </Text>
                    </Box>
                  );
                })}
              </Flex>
              <HStack justify="center" spacing={3} flexWrap="wrap" mt={2}>
                {reportCategoryMetrics.map((c) => (
                  <HStack key={c.name} spacing={1}>
                    <Box w="7px" h="7px" borderRadius="full" bg={c.color} />
                    <Text fontSize="9px" fontWeight="700" color="gray.600" noOfLines={1}>
                      {c.name}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </Box>
          </Flex>
        </Box>

        <Box
          bg="white"
          borderRadius="2xl"
          p={5}
          boxShadow="sm"
          border={`1.5px solid ${T.amber}`}
          overflow="hidden"
        >
          <Text
            fontSize="9px"
            fontWeight="900"
            color={T.amber}
            textTransform="uppercase"
            letterSpacing="0.12em"
            mb={4}
          >
            Rendered Hours
          </Text>
          <Flex gap={4} align="center" minH="122px">
            <Box flex="1">
              {reportCategoryMetrics.map((c) => (
                <Flex key={c.name} align="center" justify="space-between" mb={1.5}>
                  <HStack spacing={1.5} minW={0}>
                    <Box w="7px" h="7px" borderRadius="full" bg={c.color} flexShrink={0} />
                    <Text fontSize="10px" color="gray.500" noOfLines={1}>
                      {c.name}
                    </Text>
                  </HStack>
                  <Text fontSize="10px" fontWeight="800" color={T.corpBlue}>
                    {c.hours.toFixed(1)}h
                  </Text>
                </Flex>
              ))}
            </Box>
            <Box position="relative" flexShrink={0}>
              <PieChart width={96} height={96}>
                <Pie
                  data={reportCategoryMetrics.filter((c) => c.hours > 0)}
                  dataKey="hours"
                  innerRadius={28}
                  outerRadius={44}
                  paddingAngle={3}
                >
                  {reportCategoryMetrics.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%,-50%)"
                textAlign="center"
                pointerEvents="none"
              >
                <Text fontSize="11px" fontWeight="900" color={T.corpBlue} lineHeight="1.1">
                  {renderedHoursTotal.toFixed(1)}
                </Text>
                <Text fontSize="7px" color="gray.400" fontWeight="600">
                  HOURS
                </Text>
              </Box>
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* ── Tab Bar + Filters ── */}
      <Box bg="white" borderRadius="2xl" boxShadow="sm" border={`2px solid ${T.amber}`} mb={5}>
        <Flex align="center" justify="space-between" flexWrap="wrap" p={3} gap={3}>

          {/* Pill Tabs */}
          <HStack spacing={2} flexWrap="wrap">
            {TABS.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                size="sm"
                borderRadius="full"
                fontWeight="800"
                fontSize="xs"
                letterSpacing="0.04em"
                leftIcon={<tab.icon size={13} />}
                bg={activeTab === tab.id ? tab.activeColor : "white"}
                color={activeTab === tab.id ? "white" : "gray.500"}
                border={activeTab === tab.id ? "none" : "1.5px solid #E5E7EB"}
                boxShadow={activeTab === tab.id ? `0 4px 12px ${tab.activeColor}55` : "none"}
                transition="all 0.2s"
                _hover={{
                  bg: activeTab === tab.id ? tab.activeColor : "#F9FAFB",
                  transform: "translateY(-1px)",
                }}
              >
                {tab.label}
              </Button>
            ))}
            <Button
              onClick={signatureModal.onOpen}
              size="sm"
              borderRadius="full"
              fontWeight="900"
              fontSize="xs"
              letterSpacing="0.04em"
              leftIcon={<FiPenTool size={13} />}
              bg={signatureDataUrl ? T.emerald : "#EAF7FA"}
              color={signatureDataUrl ? "white" : "#317F8B"}
              border={signatureDataUrl ? "none" : "1.5px solid #BEE3EA"}
              boxShadow={signatureDataUrl ? `0 4px 12px ${T.emerald}55` : "none"}
              _hover={{
                bg: signatureDataUrl ? "#059669" : "#DDF4F8",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s"
            >
              Sign
            </Button>
          </HStack>

          {/* Filters */}
          <HStack spacing={2} flexWrap="wrap">
            <Select size="sm" w="220px" borderRadius="full" borderColor="gray.200"
              fontSize="xs" fontWeight="600" color="gray.600"
              value={weekOffset} onChange={e => setWeekOffset(parseInt(e.target.value, 10))}>
              {weekOptions.map(opt => (
                <option key={opt.offset} value={opt.offset}>{opt.label}</option>
              ))}
            </Select>
            <Button
              size="sm" onClick={() => setSortAZ(v => !v)} borderRadius="full"
              fontSize="xs" fontWeight="800"
              bg={sortAZ ? T.corpBlue : "white"}
              color={sortAZ ? "white" : "gray.500"}
              border={sortAZ ? "none" : "1.5px solid #E5E7EB"}
              _hover={{ bg: sortAZ ? "#16325B" : "#F9FAFB" }}
            >A–Z</Button>
            <Select size="sm" w="170px" borderRadius="full" borderColor="gray.200"
              fontSize="xs" fontWeight="600" color="gray.600"
              value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.category_id} value={String(c.category_id)}>{c.category_name}</option>)}
            </Select>
            <InputGroup size="sm" w="190px">
              <InputLeftElement pointerEvents="none"><FiSearch color="#9CA3AF" size={13} /></InputLeftElement>
              <Input borderRadius="full" placeholder="Search tasks…" borderColor="gray.200"
                fontSize="xs" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </InputGroup>
          </HStack>
        </Flex>
      </Box>

      {/* ── Tab Content ── */}
      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color={T.amber} thickness="4px" />
        </Flex>
      ) : (
        <>
          {/* ──────────────── LIST VIEW ──────────────── */}
          {activeTab === "list" && (
            <Box bg="white" borderRadius="2xl" boxShadow="sm" border={`2px solid ${T.amber}`} overflow="hidden">
              <SectionHead
                title="Ongoing Activities"
                action={
                  <Button size="sm" leftIcon={<FiPlus />}
                    bg={T.emerald} color="white" borderRadius="full" fontWeight="900" fontSize="xs"
                    boxShadow={`0 4px 12px ${T.emerald}55`}
                    _hover={{ bg: "#059669", transform: "translateY(-1px)" }} _active={{ bg: "#047857" }}
                    onClick={() => { setEditTask(null); taskModal.onOpen(); }}>
                    New Task
                  </Button>
                }
              />
              <ColHeaders cols={[
                { label: "Category",    flex: "1.2" },
                { label: "Title",       flex: "2"   },
                { label: "Description", flex: "2.5" },
                { label: "Date",        flex: "1.2" },
                { label: "Start",       flex: "1"   },
                { label: "End",         flex: "1"   },
                { label: "Status",      flex: "1.2" },
                { label: "",            flex: "0.8" },
              ]} />

              <VStack spacing={2} px={4} py={3} align="stretch">
                {filteredTasks.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="sm" fontWeight="600" color="gray.300">No tasks found for this week.</Text>
                  </Box>
                ) : filteredTasks.map(t => (
                  <Box key={t.task_id} {...pillRow} borderLeft={`4px solid ${catColor(t.category_id)}`}>
                    <Flex gap={3} align="center">
                      <Box flex="1.2">
                        <HStack spacing={1.5}>
                          <Box w="8px" h="8px" borderRadius="full" bg={catColor(t.category_id)} flexShrink={0} />
                          <Text fontSize="xs" fontWeight="700" color="gray.500" noOfLines={1}>{catName(t.category_id)}</Text>
                        </HStack>
                      </Box>
                      <Box flex="2">
                        <Text fontWeight="900" fontSize="sm" color={catColor(t.category_id)} noOfLines={1}>{t.title}</Text>
                      </Box>
                      <Box flex="2.5">
                        <Text fontSize="xs" color="gray.400" noOfLines={2}>{t.description || "—"}</Text>
                      </Box>
                      <Box flex="1.2">
                        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">{fmtDate(t.task_date)}</Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.500">{fmtTime(t.start_time)}</Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.500">{fmtTime(t.end_time)}</Text>
                      </Box>
                      <Box flex="1.2">
                        {isCompletedTask(t) ? (
                          <Box color="emerald" fontSize="md" fontWeight="bold">
                            <FiCheckSquare size={18} color={T.emerald} />
                          </Box>
                        ) : (
                          <StatusBadge status={t.status} />
                        )}
                      </Box>
                      <Box flex="0.8">
                        <HStack spacing={1} justify="flex-end">
                          <Tooltip label="Edit">
                            <IconButton size="xs" icon={<FiEdit2 />} borderRadius="lg" aria-label="edit"
                              bg={T.amberLight} color={T.amber}
                              _hover={{ bg: T.amber, color: "white" }}
                              onClick={() => { setEditTask(t); taskModal.onOpen(); }} />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton size="xs" icon={<FiTrash2 />} borderRadius="lg" aria-label="delete"
                              bg="#FEE2E2" color={T.crimson}
                              _hover={{ bg: T.crimson, color: "white" }}
                              onClick={() => deleteTask(t.task_id)} />
                          </Tooltip>
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* ──────────────── CARD VIEW (Kanban Board) ──────────────── */}
          {activeTab === "card" && (
            <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} w="full" alignSelf="stretch">
              {Object.keys(KANBAN_CFG).map(colId => {
                const cfg = KANBAN_CFG[colId];
                const colTasks = filteredTasks.filter(t => getTaskKanbanStatus(t) === colId);
                const isOver = dragOverCol === colId;
                return (
                  <MotionBox
                    key={colId}
                    layout
                    initial={false}
                    bg={isOver ? "gray.50" : "white"}
                    borderRadius="2xl"
                    boxShadow="sm"
                    border={`2px solid ${T.amber}`}
                    borderTop={cfg.borderTop}
                    overflow="hidden"
                    transition={{ layout: { duration: 0.18, ease: "easeOut" } }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverCol(colId); }}
                    onDragLeave={() => setDragOverCol(null)}
                    onDrop={(e) => { setDragOverCol(null); handleDrop(e, colId); }}
                    minH="400px"
                  >
                    {/* Column Header */}
                    <Box p={3} borderBottom="1px solid #F3F4F6">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="xs" fontWeight="900" color={T.corpBlue} letterSpacing="0.04em">
                          {colId}
                        </Text>
                        <Box
                          bg={cfg.badgeBg}
                          color={cfg.badgeColor}
                          fontSize="10px"
                          fontWeight="900"
                          px={2}
                          py="2px"
                          borderRadius="full"
                          minW="20px"
                          textAlign="center"
                        >
                          {colTasks.length}
                        </Box>
                      </Flex>
                    </Box>

                    {/* Column Cards */}
                    <VStack p={3} spacing={3} align="stretch">
                      {colTasks.length === 0 ? (
                        <Text fontSize="xs" color="gray.300" textAlign="center" py={6}>
                          Drop tasks here
                        </Text>
                      ) : (
                        colTasks.map(t => (
                          <MotionBox
                            key={t.task_id}
                            layout
                            initial={false}
                            p={3}
                            bg="#F8F9FA"
                            borderRadius="xl"
                            borderLeft={`4px solid ${catColor(t.category_id)}`}
                            boxShadow="sm"
                            cursor="grab"
                            draggable
                            onDragStart={(e) => handleDragStart(e, t.task_id)}
                            transition={{ layout: { duration: 0.15, ease: "easeOut" } }}
                            _hover={{ boxShadow: "md", bg: "white", transform: "translateY(-1px)" }}
                            onClick={() => { setEditTask(t); taskModal.onOpen(); }}
                          >
                            <Text fontSize="xs" fontWeight="900" color={catColor(t.category_id)} noOfLines={2}>
                              {t.title}
                            </Text>
                            {t.description && (
                              <Text fontSize="9px" color="gray.400" noOfLines={2} mt={1}>
                                {t.description}
                              </Text>
                            )}
                            <Flex justify="space-between" align="center" mt={2} flexWrap="wrap" gap={1}>
                              <HStack spacing={1}>
                                <Box
                                  as="span"
                                  px={1.5}
                                  py="2px"
                                  borderRadius="md"
                                  bg={PRIORITY_CFG[t.priority || "Medium"].bg}
                                  color={PRIORITY_CFG[t.priority || "Medium"].color}
                                  fontSize="7px"
                                  fontWeight="900"
                                >
                                  {t.priority || "Medium"}
                                </Box>
                                <Text fontSize="8px" color="gray.400" fontWeight="600">
                                  {catName(t.category_id)}
                                </Text>
                              </HStack>
                              {t.start_time && (
                                <Text fontSize="8px" color="gray.400" fontWeight="500">
                                  {fmtTime(t.start_time)}
                                </Text>
                              )}
                            </Flex>
                          </MotionBox>
                        ))
                      )}
                    </VStack>
                  </MotionBox>
                );
              })}
            </SimpleGrid>
          )}

          {/* ──────────────── ACCOMPLISH VIEW ──────────────── */}
          {activeTab === "accomplish" && (
            <Box bg="white" borderRadius="2xl" boxShadow="sm" border={`2px solid ${T.amber}`} overflow="hidden">
              <SectionHead title="Accomplish Task" />
              <ColHeaders cols={[
                { label: "Category",    flex: "1.2" },
                { label: "Title",       flex: "2"   },
                { label: "Description", flex: "2"   },
                { label: "Date",        flex: "1.2" },
                { label: "Completed",   flex: "1.2" },
                { label: "Hours",       flex: "1.2" },
                { label: "",            flex: "1"   },
              ]} />

              <VStack spacing={2} px={4} py={3} align="stretch">
                {filteredTasks.filter(isCompletedTask).length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="sm" fontWeight="600" color="gray.300">No accomplished tasks found for this week.</Text>
                  </Box>
                ) : filteredTasks.filter(isCompletedTask).map(t => {
                  const log = logs.find(l => l.task_id === t.task_id);
                  return (
                    <Box key={t.task_id} {...pillRow} borderLeft={`4px solid ${catColor(t.category_id)}`}>
                      <Flex gap={3} align="center">
                        <Box flex="1.2">
                          <HStack spacing={1.5}>
                            <Box w="8px" h="8px" borderRadius="full" bg={catColor(t.category_id)} />
                            <Text fontSize="xs" fontWeight="700" color="gray.500" noOfLines={1}>{catName(t.category_id)}</Text>
                          </HStack>
                        </Box>
                        <Box flex="2">
                          <Text fontWeight="900" fontSize="sm" color={catColor(t.category_id)} noOfLines={1}>{t.title}</Text>
                        </Box>
                        <Box flex="2">
                          <Text fontSize="xs" color="gray.400" noOfLines={2}>{t.description || "—"}</Text>
                        </Box>
                        <Box flex="1.2">
                          <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">{fmtDate(t.task_date)}</Text>
                        </Box>
                        <Box flex="1.2">
                          <HStack spacing={1}>
                            <FiClock size={11} color={T.amber} />
                            <Text fontSize="xs" color="gray.600" fontWeight="600">{log?.completed_time || "—"}</Text>
                          </HStack>
                        </Box>
                        <Box flex="1.2">
                          {log?.hours_rendered > 0 ? (
                            <Box as="span" bg={T.emerald} color="white" fontSize="10px" fontWeight="900"
                              px={2} py="3px" borderRadius="full" display="inline-block">
                              {parseFloat(log.hours_rendered).toFixed(2)}h
                            </Box>
                          ) : (
                            <Text fontSize="xs" color="gray.300">—</Text>
                          )}
                        </Box>
                        <Box flex="1">
                          <Button size="xs" bg={T.amber} color="white" borderRadius="full"
                            fontWeight="900" fontSize="10px" _hover={{ bg: "#D97706" }}
                            onClick={() => { setLogTask({ ...t, logs: logs.filter(l => l.task_id === t.task_id) }); logModal.onOpen(); }}>
                            Log
                          </Button>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          )}

          {/* ──────────────── REPORT VIEW ──────────────── */}
          {activeTab === "report" && (
            <Box>
              <Box bg="white" borderRadius="2xl" boxShadow="sm" border={`2px solid ${T.amber}`} overflow="hidden">
                <SectionHead title={`Daily Activity Report — ${weekLabel(week)}`} />

                {/* Report column headers */}
                <Box px={5} py={3} bg={T.corpBlue}>
                  <Flex gap={4}>
                    {[
                      { label: "Araw",                  flex: "1.2" },
                      { label: "Natapus na Gawain",     flex: "3"   },
                      { label: "Remarks",               flex: "2"   },
                      { label: "Remarks ng Personnel",  flex: "2"   },
                    ].map(({ label, flex }) => (
                      <Text key={label} flex={flex} fontSize="9px" fontWeight="900"
                        color={T.amber} textTransform="uppercase" letterSpacing="0.12em">
                        {label}
                      </Text>
                    ))}
                  </Flex>
                </Box>

                {/* Report rows as pill containers */}
                <VStack spacing={2} px={4} py={3} align="stretch">
                  {weekDays.map(date => {
                    const rpt       = getDayReport(date);
                    const dayTasks  = completedTasksForReport.filter(t => getTaskReportDate(t) === date);
                    const defaultAc = formatReportAccomplishments(rpt?.accomplishments, dayTasks);
                    return (
                      <Box key={`${activeDarUserId || "self"}-${date}-${rpt?.updated_at || "new"}`} {...pillRow} borderLeft={`4px solid ${T.amber}`}>
                        <Flex gap={4} align="flex-start">
                          <Box flex="1.2" pt={1}>
                            <Text fontWeight="900" fontSize="sm" color={T.corpBlue}>{fmtDay(date)}</Text>
                            <Text fontSize="xs" color="gray.400">{fmtDate(date)}</Text>
                          </Box>
                          <Box flex="3">
                            <Textarea {...reportTextarea}
                              key={`accomplishments-${date}-${dayTasks.map(t => t.task_id).join("-")}-${rpt?.updated_at || ""}`}
                              defaultValue={defaultAc}
                              onBlur={e => saveReport(date, "accomplishments", e.target.value)}
                              placeholder="Ilagay ang mga natapus na gawain…" />
                          </Box>
                          <Box flex="2">
                            <Textarea {...reportTextarea}
                              key={`remarks-${activeDarUserId || "self"}-${date}-${rpt?.updated_at || ""}`}
                              defaultValue={rpt?.remarks || ""}
                              onBlur={e => saveReport(date, "remarks", e.target.value)}
                              placeholder="Admin remarks…" />
                          </Box>
                          <Box flex="2">
                            <Textarea {...reportTextarea}
                              key={`personnel-remarks-${activeDarUserId || "self"}-${date}-${rpt?.updated_at || ""}`}
                              defaultValue={rpt?.personnel_remarks || ""}
                              onBlur={e => saveReport(date, "personnel_remarks", e.target.value)}
                              placeholder="Sariling remarks…" />
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>

              <Flex justify="center" mt={6} gap={3} flexWrap="wrap">
                <Button
                  leftIcon={<FiPrinter />}
                  bg={T.emerald} color="white" size="lg"
                  borderRadius="2xl" fontWeight="900" px={12}
                  boxShadow={`0 8px 25px ${T.emerald}55`}
                  _hover={{ transform: "translateY(-3px)", boxShadow: `0 12px 30px ${T.emerald}77` }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  onClick={() => handlePrint("dar")}>
                  PRINT DAR
                </Button>
                <Button
                  leftIcon={<FiPrinter />}
                  bg={T.corpBlue} color="white" size="lg"
                  borderRadius="2xl" fontWeight="900" px={12}
                  boxShadow={`0 8px 25px ${T.corpBlue}44`}
                  _hover={{ transform: "translateY(-3px)", boxShadow: `0 12px 30px ${T.corpBlue}66` }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  onClick={() => handlePrint("r510a")}>
                  PRINT R5-10A
                </Button>
              </Flex>

            </Box>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <TaskModal isOpen={taskModal.isOpen} onClose={taskModal.onClose}
        categories={categories} onSaved={load} initial={editTask} currentWeek={week} />
      <LogModal isOpen={logModal.isOpen} onClose={logModal.onClose}
        task={logTask} onSaved={load} />
      <SignatureModal
        isOpen={signatureModal.isOpen}
        onClose={signatureModal.onClose}
        onSave={handleSaveSignature}
        initialSignature={signatureDataUrl}
        signerName={loggedInUserName}
      />
    </Box>

    <Box
      id="dar-print-area"
      className={`dar-print-sheet ${printTarget === "dar" ? "is-print-active" : ""}`}
      aria-hidden="true"
    >
      <Box className="dar-print-shell">
        <Box className="dar-print-body">
          <Box className="dar-print-header">
            <Text className="dar-print-title">
              ULAT UKOL SA NATAPOS NA GAWAIN NG NAGLILINGKOD SA TANGGAPAN
            </Text>
            <table className="dar-print-meta">
              <colgroup>
                <col className="meta-label meta-name-label" />
                <col className="meta-value meta-name-value" />
                <col className="meta-label meta-hours-label" />
                <col className="meta-value meta-hours-value" />
                <col className="meta-label meta-dept-label" />
                <col className="meta-value meta-dept-value" />
                <col className="meta-label meta-week-label" />
                <col className="meta-value meta-week-value" />
                <col className="meta-label meta-date-label" />
                <col className="meta-value meta-date-value" />
              </colgroup>
              <tbody>
                <tr>
                  <th>Pangalan:</th>
                  <td>{printMeta.name}</td>
                  <th>Total Hrs:</th>
                  <td>{printMeta.totalHours}</td>
                  <th>Dept:</th>
                  <td>{printMeta.department}</td>
                  <th>Wk #:</th>
                  <td>{printMeta.weekNumber}</td>
                  <th>Petsang Saklaw:</th>
                  <td>{printMeta.petsangSaklaw}</td>
                </tr>
              </tbody>
            </table>
          </Box>

          <table className="dar-print-table">
            <thead>
              <tr>
                <th className="col-day">Araw</th>
                <th className="col-work">Gawain</th>
                <th className="col-ref">Reference</th>
                <th className="col-remarks">Remarks ng Section Chief / Department Head</th>
                <th className="col-personnel">Remarks ng Personnel</th>
              </tr>
            </thead>
            <tbody>
              {printRows.map((row) => (
                <tr key={row.date}>
                  <td className="cell-day">
                    <strong>{row.dayLabel}</strong>
                    <span>({row.dayHoursLabel})</span>
                  </td>
                  <td className="cell-work">{row.accomplishments || "—"}</td>
                  <td className="cell-ref">• Manual</td>
                  <td className="cell-remarks">{row.remarks || ""}</td>
                  <td className="cell-personnel">{row.personnelRemarks || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box className="dar-print-signature">
          <Box className="dar-print-lagda">
            <Text className="dar-print-note">Lagda:</Text>
            {signatureDataUrl && (
              <img
                className="dar-print-user-signature"
                src={signatureDataUrl}
                alt=""
              />
            )}
            <Box className="dar-print-line" />
            <Text className="dar-print-name">{printMeta.name}</Text>
          </Box>

          <Box className="dar-print-noted">
            <Text className="dar-print-note">Noted by:</Text>
            <Box className="dar-print-signature-row">
              <Box className="dar-print-signature-line" />
              <Text className="dar-print-signature-name">Ronald T. de Guzman</Text>
              <Text className="dar-print-signature-title">Section Chief</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>

    <Box
      id="r510a-print-area"
      className={`r510a-print-sheet ${printTarget === "r510a" ? "is-print-active" : ""}`}
      aria-hidden="true"
    >
      <Box className="r510a-print-shell">
        <Box className="r510a-heading">
          <Text className="r510a-code">R5-10A</Text>
          <Box className="r510a-title-wrap">
            <Text className="r510a-main-title">LINGGUHANG ULAT NG MGA NAG-OOPISINANG</Text>
            <Text className="r510a-sub-title">MINISTRO/MANGGAGAWA NA WALANG DESTINONG LOKAL</Text>
          </Box>
        </Box>

        <table className="r510a-form">
          <colgroup>
            <col className="r510a-col-a" />
            <col className="r510a-col-b" />
            <col className="r510a-col-c" />
            <col className="r510a-col-d" />
            <col className="r510a-col-day" />
            <col className="r510a-col-hrs" />
            <col className="r510a-col-mins" />
          </colgroup>
          <tbody>
            <tr className="r510a-meta-row">
              <td className="r510a-meta-cell">
                <span>ASSIGNED NO.</span>
                <strong>{r510aData.assignedNo}</strong>
              </td>
              <td className="r510a-meta-cell r510a-name-cell" colSpan={3}>
                <span>PANGALAN</span>
                <strong>{printMeta.name}</strong>
              </td>
              <td className="r510a-meta-cell">
                <span>URI</span>
                <strong>{r510aData.uri}</strong>
              </td>
              <td className="r510a-meta-cell" colSpan={2}>
                <span>PETSA</span>
                <strong>{r510aData.date}</strong>
              </td>
            </tr>

            <tr className="r510a-blue-row">
              <th colSpan={4}>MGA GAMPANIN</th>
              <th>ARAW</th>
              <th colSpan={2}>
                <span>ORAS</span>
                <div className="r510a-hours-labels">
                  <b>HRS</b>
                  <b>MINS</b>
                </div>
              </th>
            </tr>

            <tr className="r510a-section-row r510a-d-row">
              <td colSpan={4} className="r510a-duty-cell">
                <div className="r510a-section-title">D. PANGANGASIWA NG PAGSAMBA</div>
                <div className="r510a-two-col-lines">
                  <span>Blg. ng pinangasiwaang pagsamba</span>
                  <span className="r510a-entry-line">{r510aData.worship.count}</span>
                  <span>Malayong suguan</span>
                  <span className="r510a-entry-line">{r510aData.worship.count}</span>
                  <span>Malaking lokal</span>
                  <span className="r510a-entry-line">{r510aData.worship.count}</span>
                </div>
                <div className="r510a-worship-meta">
                  <div className="r510a-worship-meta-label">Mga lokal na pinangasiwaan:</div>
                  <div className="r510a-worship-meta-values">
                    <strong>{r510aData.worship.local}</strong>
                    <strong>{r510aData.worship.day}</strong>
                    <strong>{r510aData.worship.time}</strong>
                  </div>
                </div>
              </td>
              <td className="r510a-center-cell">{r510aData.worship.dayCount}</td>
              <td className="r510a-center-cell">{r510aData.worship.hours}</td>
              <td className="r510a-center-cell">{r510aData.worship.minutes}</td>
            </tr>

            <tr className="r510a-section-row r510a-e-row">
              <td colSpan={4} className="r510a-duty-cell">
                <div className="r510a-section-title">E. PAG-OOPISINA SA CENTRAL/DISTRITO</div>
                <div className="r510a-office-lines">
                  <span>Blg. ng araw na nahuli sa pagpasok sa tanggapan</span>
                  <span className="r510a-entry-line">0</span>
                  <span>Blg. ng araw na lumiban</span>
                  <span className="r510a-entry-line">0</span>
                  <span>Blg. ng araw na umalis ng maaga sa tanggapan</span>
                  <span className="r510a-entry-line">0</span>
                  <span>Blg. ng tawag pansin na tinanggap</span>
                  <span className="r510a-entry-line">0</span>
                  <span>Blg. ng lokal na dinalaw/siniyasat</span>
                  <span className="r510a-entry-line">{r510aData.office.count}</span>
                </div>
              </td>
              <td className="r510a-center-cell">{r510aData.office.dayCount}</td>
              <td className="r510a-center-cell">{r510aData.office.hours}</td>
              <td className="r510a-center-cell">{r510aData.office.minutes}</td>
            </tr>

            <tr className="r510a-section-row r510a-f-row">
              <td colSpan={4} className="r510a-duty-cell r510a-special-cell">
                <div className="r510a-section-title">F. MGA NATATANGING GAMPANIN</div>
                <div className="r510a-section-subtitle">(ISINGAWA SA LABAS NG OPISINA O LABAS NG REGULAR NA OFFICE HOUR)</div>
                <table className="r510a-special-table">
                  <thead>
                    <tr>
                      <th>Petsa</th>
                      <th>Detalye</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r510aData.specialRows.map((row, index) => (
                      <tr key={`r510a-special-${index}`}>
                        <td>{row.date}</td>
                        <td>{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td className="r510a-cx-cell">Cx.</td>
              <td className="r510a-special-hours-cell">
                {r510aData.specialRows.map((row, index) => (
                  <div key={`r510a-hrs-${index}`} className="r510a-special-hour-line">{row.hours}</div>
                ))}
              </td>
              <td className="r510a-special-hours-cell">
                {r510aData.specialRows.map((row, index) => (
                  <div key={`r510a-mins-${index}`} className="r510a-special-hour-line">{row.minutes}</div>
                ))}
              </td>
            </tr>

            <tr className="r510a-g-row">
              <td colSpan={4} className="r510a-g-cell">
                <div className="r510a-section-title">G. ORAS NA NAGUGOL PARA SA IGLESIA</div>
                <table className="r510a-week-hours">
                  <tbody>
                    <tr>
                      <th>Araw</th>
                      {r510aData.dailyTotals.map((day) => (
                        <th key={`r510a-day-${day.date}`}>{day.label}</th>
                      ))}
                    </tr>
                    <tr>
                      <td>Hrs</td>
                      {r510aData.dailyTotals.map((day) => (
                        <td key={`r510a-hrs-total-${day.date}`}>{day.hours}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Mins</td>
                      {r510aData.dailyTotals.map((day) => (
                        <td key={`r510a-mins-total-${day.date}`}>{day.minutes}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </td>
              <td colSpan={3} className="r510a-sign-box">
                <div className="r510a-sign-area">
                  {signatureDataUrl && (
                    <img className="r510a-signature-img" src={signatureDataUrl} alt="" />
                  )}
                  <div className="r510a-sign-line"></div>
                  <div className="r510a-sign-name">{printMeta.name}</div>
                  <div className="r510a-sign-label">LAGDA</div>
                </div>
                <div className="r510a-check-grid">
                  <div>
                    <span>CHECKED BY</span>
                    <strong></strong>
                  </div>
                  <div>
                    <span>DATE</span>
                    <strong></strong>
                  </div>
                  <div>
                    <span>ENCODED BY</span>
                    <strong></strong>
                  </div>
                  <div>
                    <span>DATE</span>
                    <strong></strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    </Box>

      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          @page {
            size: ${printTarget === "r510a" ? "letter portrait" : "landscape"};
            margin: ${printTarget === "r510a" ? "7mm" : "10mm"};
          }

          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          .chakra-portal,
          [id^="chakra-toast-manager"] {
            display: none !important;
          }

          .dar-print-sheet,
          .r510a-print-sheet {
            display: none !important;
            visibility: hidden !important;
          }

          .dar-print-sheet.is-print-active,
          .r510a-print-sheet.is-print-active {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto;
            padding: 0;
            margin: 0;
            overflow: visible;
          }

          .dar-print-shell {
            display: flex;
            flex-direction: column;
            width: 100%;
            min-height: 0;
            padding: 0;
            box-sizing: border-box;
            min-height: calc(100vh - 20mm);
          }

          .dar-print-body {
            display: flex;
            flex-direction: column;
            flex: 1 0 auto;
            gap: 1mm;
          }

          .dar-print-header {
            margin-bottom: 0.75mm;
          }

          .dar-print-title {
            text-align: center;
            font-size: 10.25pt;
            font-weight: 700;
            letter-spacing: 0.01em;
            margin: 0 0 0.6mm 0;
            text-transform: uppercase;
          }

          .dar-print-meta {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 7.6pt;
            line-height: 1.12;
            margin-bottom: 1mm;
          }

          .dar-print-meta .meta-name-label { width: 8%; }
          .dar-print-meta .meta-name-value { width: 15%; }
          .dar-print-meta .meta-hours-label { width: 8%; }
          .dar-print-meta .meta-hours-value { width: 8%; }
          .dar-print-meta .meta-dept-label { width: 6%; }
          .dar-print-meta .meta-dept-value { width: 14%; }
          .dar-print-meta .meta-week-label { width: 5%; }
          .dar-print-meta .meta-week-value { width: 6%; }
          .dar-print-meta .meta-date-label { width: 12%; }
          .dar-print-meta .meta-date-value { width: 18%; }

          .dar-print-meta th,
          .dar-print-meta td {
            border: 0.3pt solid #bfbfbf;
            padding: 0.45mm 0.7mm;
            vertical-align: middle;
            word-break: normal;
            overflow-wrap: break-word;
            box-sizing: border-box;
          }

          .dar-print-meta th {
            background: #f7f7f7;
            text-align: right;
            font-weight: 700;
          }

          .dar-print-meta td {
            text-align: center;
            font-weight: 600;
            white-space: nowrap;
            overflow: visible;
          }

          .dar-print-meta td:last-child {
            font-size: 7.25pt;
            letter-spacing: -0.01em;
          }

          .dar-print-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 7.35pt;
            line-height: 1.12;
            margin-bottom: 1mm;
          }

          .dar-print-table th,
          .dar-print-table td {
            border: 0.3pt solid #bfbfbf;
            padding: 0.7mm 0.85mm;
            vertical-align: top;
            word-break: normal;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            overflow: visible;
            break-inside: avoid;
            page-break-inside: avoid;
            box-sizing: border-box;
          }

          .dar-print-table thead th {
            background: #f7f7f7;
            text-align: center;
            font-weight: 700;
            padding-top: 0.55mm;
            padding-bottom: 0.55mm;
            font-size: 7pt;
            line-height: 1.05;
          }

          .dar-print-table thead {
            display: table-header-group;
          }

          .dar-print-table tbody {
            display: table-row-group;
          }

          .dar-print-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .dar-print-table .col-day { width: 11%; }
          .dar-print-table .col-work { width: 44%; }
          .dar-print-table .col-ref { width: 11%; }
          .dar-print-table .col-remarks { width: 17%; }
          .dar-print-table .col-personnel { width: 17%; }

          .dar-print-table .cell-day {
            text-align: center;
            font-weight: 700;
            line-height: 1.12;
            white-space: nowrap;
            padding-left: 0.55mm;
            padding-right: 0.55mm;
          }

          .dar-print-table .cell-day span {
            font-weight: 600;
          }

          .dar-print-table .cell-work {
            white-space: pre-line;
            line-height: 1.14;
            padding: 0.85mm 1.15mm;
            text-align: left;
          }

          .dar-print-table .cell-ref {
            text-align: left;
            white-space: pre-line;
            line-height: 1.12;
          }

          .dar-print-table .cell-remarks,
          .dar-print-table .cell-personnel {
            line-height: 1.12;
            padding: 0.7mm 0.85mm;
          }

          .dar-print-signature {
            margin-top: auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: start;
            column-gap: 30mm;
            padding: 0 9mm 0;
            width: 100%;
            min-height: 29mm;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .dar-print-lagda,
          .dar-print-noted {
            width: 100%;
            position: relative;
            height: 29mm;
            display: block;
            --dar-sign-label-width: 19mm;
            --dar-sign-line-top: 17.8mm;
            --dar-sign-name-top: 14.25mm;
          }

          .dar-print-note {
            font-size: 8pt;
            font-weight: 700;
            margin: 0;
            position: absolute;
            left: 0;
            top: 16.2mm;
            line-height: 1;
          }

          .dar-print-user-signature {
            display: block;
            width: 42mm;
            max-width: 70%;
            height: 12.5mm;
            object-fit: contain;
            margin: 0;
            position: absolute;
            left: calc(var(--dar-sign-label-width) + ((100% - var(--dar-sign-label-width)) / 2));
            top: 6mm;
            z-index: 7;
            mix-blend-mode: multiply;
            transform: translateX(-50%) rotate(-5deg);
            transform-origin: center bottom;
          }

          .dar-print-line,
          .dar-print-signature-line {
            border-bottom: 0.4pt solid #111;
            margin: 0;
            position: absolute;
            top: var(--dar-sign-line-top);
            left: var(--dar-sign-label-width);
            right: 0;
            width: auto;
            transform: none;
            z-index: 5;
          }

          .dar-print-name {
            font-size: 8pt;
            font-weight: 500;
            margin: 0;
            position: absolute;
            top: var(--dar-sign-name-top);
            left: var(--dar-sign-label-width);
            right: 0;
            text-align: center;
            z-index: 6;
          }

          .dar-print-signature-row {
            display: block;
            position: relative;
            padding-top: 0;
            width: 100%;
            height: 29mm;
          }

          .dar-print-signature-name {
            font-size: 8pt;
            font-weight: 600;
            margin: 0;
            position: absolute;
            top: var(--dar-sign-name-top);
            left: var(--dar-sign-label-width);
            right: 0;
            text-align: center;
            z-index: 6;
          }

          .dar-print-signature-title {
            font-size: 7pt;
            margin: 0;
            position: absolute;
            top: 20mm;
            left: var(--dar-sign-label-width);
            right: 0;
            text-align: center;
            z-index: 6;
          }

          .r510a-print-shell {
            width: 100%;
            max-width: 195mm;
            margin: 0 auto;
            color: #000;
            font-family: Arial, Helvetica, sans-serif;
            box-sizing: border-box;
          }

          .r510a-heading {
            display: grid;
            grid-template-columns: 33mm 1fr;
            align-items: end;
            margin-bottom: 1mm;
          }

          .r510a-code {
            font-size: 22pt;
            font-weight: 900;
            line-height: 0.95;
            margin: 0;
            letter-spacing: -0.03em;
          }

          .r510a-title-wrap {
            text-align: center;
            padding-right: 18mm;
          }

          .r510a-main-title,
          .r510a-sub-title {
            margin: 0;
            font-size: 11pt;
            line-height: 1.05;
            font-weight: 900;
          }

          .r510a-form {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            border: 0.8pt solid #000;
            font-size: 7.2pt;
            line-height: 1.08;
          }

          .r510a-col-a { width: 19%; }
          .r510a-col-b { width: 19%; }
          .r510a-col-c { width: 19%; }
          .r510a-col-d { width: 18%; }
          .r510a-col-day { width: 10%; }
          .r510a-col-hrs { width: 7.5%; }
          .r510a-col-mins { width: 7.5%; }

          .r510a-form th,
          .r510a-form td {
            border: 0.6pt solid #000;
            padding: 0.75mm 1mm;
            vertical-align: top;
            box-sizing: border-box;
          }

          .r510a-meta-cell {
            height: 8.5mm;
            padding: 0.45mm 0.75mm !important;
          }

          .r510a-meta-cell span {
            display: block;
            font-size: 5.1pt;
            font-weight: 900;
            text-transform: uppercase;
            line-height: 1;
            margin-bottom: 0.5mm;
          }

          .r510a-meta-cell strong {
            display: block;
            text-align: center;
            font-family: "Times New Roman", Times, serif;
            font-size: 10pt;
            font-weight: 500;
            line-height: 1.05;
          }

          .r510a-name-cell strong {
            font-size: 10.5pt;
          }

          .r510a-blue-row th {
            background: #9dcaef !important;
            text-align: center;
            font-size: 7.4pt;
            font-weight: 900;
            padding: 0.6mm 0.7mm;
            line-height: 1;
          }

          .r510a-hours-labels {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            margin-top: 0.35mm;
            font-size: 5.6pt;
            font-weight: 900;
          }

          .r510a-section-row > td {
            padding-top: 0.75mm;
          }

          .r510a-d-row { height: 31mm; }
          .r510a-e-row { height: 23mm; }
          .r510a-f-row { height: 137mm; }
          .r510a-g-row { height: 20mm; }

          .r510a-duty-cell {
            padding: 0.8mm 1.6mm !important;
          }

          .r510a-section-title {
            font-size: 7.5pt;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 0.7mm;
            line-height: 1.05;
          }

          .r510a-section-subtitle {
            text-align: center;
            font-size: 6.2pt;
            font-weight: 800;
            margin: -0.25mm 0 1mm;
          }

          .r510a-two-col-lines {
            display: grid;
            grid-template-columns: 39mm 16mm 29mm 16mm;
            align-items: end;
            column-gap: 3mm;
            row-gap: 0.8mm;
            margin-left: 6mm;
            margin-bottom: 1.2mm;
          }

          .r510a-office-lines {
            display: grid;
            grid-template-columns: 63mm 18mm;
            align-items: end;
            column-gap: 4mm;
            row-gap: 0.45mm;
            margin-left: 6mm;
          }

          .r510a-entry-line {
            display: block;
            min-height: 3mm;
            border-bottom: 0.55pt solid #000;
            text-align: center;
            font-size: 8pt;
            font-weight: 700;
            line-height: 1.05;
          }

          .r510a-worship-meta {
            margin: 0.7mm 5mm 0.7mm 6mm;
          }

          .r510a-worship-meta-label {
            font-size: 7.5pt;
            font-weight: 700;
            line-height: 1.05;
            margin-bottom: 0.9mm;
          }

          .r510a-worship-meta-values {
            display: grid;
            grid-template-columns: 1.15fr 0.95fr 0.8fr;
            gap: 3mm;
          }

          .r510a-worship-meta-values strong {
            display: block;
            border-bottom: 0.55pt solid #000;
            min-height: 3.2mm;
            text-align: center;
            font-weight: 600;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

          .r510a-center-cell {
            text-align: center;
            font-size: 10pt;
            font-weight: 500;
            padding-top: 2.2mm !important;
          }

          .r510a-special-cell {
            padding-top: 0.7mm !important;
          }

          .r510a-special-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 2.5mm 0;
            table-layout: fixed;
            margin-top: 0.4mm;
          }

          .r510a-special-table th,
          .r510a-special-table td {
            border: none !important;
            border-bottom: 0.55pt solid #000 !important;
            padding: 0 1mm !important;
            height: 4.15mm;
            line-height: 1;
            vertical-align: middle;
          }

          .r510a-special-table th:first-child,
          .r510a-special-table td:first-child {
            width: 21mm;
            text-align: center;
          }

          .r510a-special-table th {
            font-size: 6pt;
            font-weight: 800;
            text-align: center;
          }

          .r510a-special-table td {
            font-size: 8pt;
            font-weight: 500;
          }

          .r510a-cx-cell {
            font-size: 7.5pt;
            font-weight: 900;
            padding-top: 1.3mm !important;
          }

          .r510a-special-hours-cell {
            padding: 9.4mm 2mm 0 !important;
          }

          .r510a-special-hour-line {
            height: 4.15mm;
            border-bottom: 0.55pt solid #000;
            text-align: center;
            font-size: 8pt;
            line-height: 4.15mm;
          }

          .r510a-g-cell {
            padding: 1mm 1.5mm !important;
          }

          .r510a-week-hours {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
          }

          .r510a-week-hours th,
          .r510a-week-hours td {
            border: none !important;
            padding: 0.2mm 1mm !important;
            text-align: center;
            line-height: 1;
            font-size: 7pt;
            font-weight: 800;
          }

          .r510a-week-hours td {
            border-bottom: 0.55pt solid #000 !important;
            font-size: 8pt;
            font-weight: 500;
            height: 3.6mm;
          }

          .r510a-week-hours th:first-child,
          .r510a-week-hours td:first-child {
            width: 12mm;
            border-bottom: none !important;
            text-align: left;
            font-size: 6.4pt;
            font-weight: 900;
          }

          .r510a-sign-box {
            padding: 0 !important;
          }

          .r510a-sign-area {
            position: relative;
            height: 11.7mm;
            border-bottom: 0.6pt solid #000;
          }

          .r510a-signature-img {
            position: absolute;
            left: 50%;
            top: -3.5mm;
            width: 38mm;
            height: 13mm;
            object-fit: contain;
            transform: translateX(-50%) rotate(-5deg);
            mix-blend-mode: multiply;
            z-index: 3;
          }

          .r510a-sign-line {
            position: absolute;
            left: 11mm;
            right: 2mm;
            top: 5.6mm;
            border-bottom: 0.55pt solid #000;
            z-index: 2;
          }

          .r510a-sign-name {
            position: absolute;
            left: 11mm;
            right: 2mm;
            top: 6.1mm;
            text-align: center;
            font-size: 6.8pt;
            font-weight: 500;
            z-index: 4;
          }

          .r510a-sign-label {
            position: absolute;
            left: 0.8mm;
            top: 6.3mm;
            font-size: 5.8pt;
            font-weight: 900;
          }

          .r510a-check-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            height: 8.3mm;
          }

          .r510a-check-grid > div {
            border-right: 0.6pt solid #000;
            border-bottom: 0.6pt solid #000;
            padding: 0.6mm;
            font-size: 5.4pt;
            font-weight: 900;
            text-transform: uppercase;
          }

          .r510a-check-grid > div:nth-child(2n) {
            border-right: none;
          }

          .r510a-check-grid strong {
            display: block;
            height: 2.8mm;
          }
        }

        .dar-print-sheet,
        .r510a-print-sheet {
          display: none;
        }
      `}</style>
    </>
  );
}
