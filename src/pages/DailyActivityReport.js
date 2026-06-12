import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Box, Flex, Text, Heading, Button, Input, Select, Textarea,
  IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, useToast,
  VStack, HStack, SimpleGrid, Spinner, Tooltip, InputGroup, InputLeftElement,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiPrinter,
  FiList, FiGrid, FiCheckSquare, FiFileText, FiClock,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { PieChart, Pie, Cell } from "recharts";
import { getAuthHeaders } from "../utils/apiHeaders";

const API = process.env.REACT_APP_API_URL || "";

const formatPrintHours = (hours) => {
  if (!Number.isFinite(hours) || hours <= 0) return "";
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
};

const MotionBox = motion(Box);

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
const todayISO = () => new Date().toISOString().split("T")[0];

// Use local date components to avoid UTC timezone day-shift (e.g. UTC+8 midnight = previous UTC day)
const localISO = (dt) => {
  const y  = dt.getFullYear();
  const m  = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
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
function TaskModal({ isOpen, onClose, categories, onSaved, initial }) {
  const toast = useToast();
  const blank = { title: "", category_id: "", description: "", task_date: todayISO(), start_time: "", end_time: "", status: "Active", priority: "Medium" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial ? { ...blank, ...initial } : blank); }, [initial, isOpen]); // eslint-disable-line

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.category_id || !form.task_date) {
      toast({ title: "Please fill in all required fields.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setSaving(true);
    try {
      if (initial?.task_id) {
        await axios.put(`${API}/api/dar/tasks/${initial.task_id}`, form, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API}/api/dar/tasks`, form, { headers: getAuthHeaders() });
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DailyActivityReport() {
  const toast      = useToast();
  const taskModal  = useDisclosure();
  const logModal   = useDisclosure();

  const [tasks,      setTasks]      = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [reports,    setReports]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [searchQ,    setSearchQ]    = useState("");
  const [filterCat,  setFilterCat]  = useState("");
  const [sortAZ,     setSortAZ]     = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [logTask,    setLogTask]    = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const week = useMemo(() => getWeekBounds(weekOffset), [weekOffset]);

  const weekOptions = useMemo(() => {
    const opts = [];
    for (let i = -12; i <= 4; i++) {
      const w = getWeekBounds(i);
      opts.push({
        offset: i,
        label: weekLabel(w),
      });
    }
    return opts;
  }, []);

  const getTaskKanbanStatus = (t) => {
    if (t.kanban_status) return t.kanban_status;
    return t.status === "Completed" ? "Done" : "New";
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

    setDragOverCol(null);
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, kanban_status: targetKanbanStatus, status: newStatus }
          : t
      )
    );

    void axios.put(
      `${API}/api/dar/tasks/${taskId}`,
      {
        kanban_status: targetKanbanStatus,
        status: newStatus
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
            ? { ...t, kanban_status: originalKanbanStatus, status: originalStatus }
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params  = { user_id: userId, week_start: week.start, week_end: week.end };
      const headers = getAuthHeaders();
      const [tRes, lRes, rRes, cRes] = await Promise.all([
        axios.get(`${API}/api/dar/tasks`,      { params, headers }),
        axios.get(`${API}/api/dar/logs`,       { params, headers }),
        axios.get(`${API}/api/dar/reports`,    { params, headers }),
        axios.get(`${API}/api/dar/categories`, { headers }),
      ]);
      setTasks(tRes.data); setLogs(lRes.data); setReports(rRes.data); setCategories(cRes.data);
    } catch (err) {
      toast({ title: "Failed to load data.", description: err.response?.data?.error || err.response?.data?.message || err.message, status: "error", duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [userId, week, toast]);

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

  const activeCnt   = tasks.filter(t => t.status === "Active").length;
  const completeCnt = tasks.filter(t => t.status === "Completed").length;
  const totalHours  = logs.reduce((s, l) => s + parseFloat(l.hours_rendered || 0), 0);

  const catBreakdown = useMemo(() => categories.map(c => ({
    name:  c.category_name,
    count: tasks.filter(t => t.category_id === c.category_id).length,
    hours: logs.filter(l => l.task?.category_id === c.category_id).reduce((s, l) => s + parseFloat(l.hours_rendered || 0), 0),
    color: CAT_COLORS[c.category_name] || c.color_hex || "#6B7280",
  })), [categories, tasks, logs]);

  const getDayReport = (date) => reports.find(r => r.report_date === date);
  const saveReport   = async (date, field, value) => {
    const ex = getDayReport(date);
    const payload = { user_id: userId, report_date: date, accomplishments: ex?.accomplishments || "", remarks: ex?.remarks || "", personnel_remarks: ex?.personnel_remarks || "", [field]: value };
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
      logs.map((log) => [log.task_id, Number.parseFloat(log.hours_rendered || 0)])
    );
  }, [logs]);

  const formatPrintAccomplishments = useCallback((text, dayTasks = []) => {
    if (!text) return "";

    const lines = String(text)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const normalizedTasks = dayTasks.map((task) => ({
      title: String(task.title || "").trim().toLowerCase(),
      task_id: task.task_id,
    }));

    const linesWithHours = lines.map((line) => {
      const clean = line.replace(/^[•\-*\s]+/, "").trim();
      const lower = clean.toLowerCase();

      const matchedTask = normalizedTasks.find(
        (task) => task.title && (lower === task.title || lower.includes(task.title) || task.title.includes(lower))
      );

      if (!matchedTask) return clean;

      const taskHours = printTaskHours.get(matchedTask.task_id);
      const hoursLabel = formatPrintHours(taskHours);
      return hoursLabel ? `${clean} (${hoursLabel}hrs)` : clean;
    });

    return linesWithHours.map((line) => `• ${line}`).join("\n");
  }, [printTaskHours]);

  const printRows = useMemo(() => {
    return weekDays.map((date) => {
      const rpt = reports.find((r) => r.report_date === date);
      const dayTasks = tasks.filter(
        (t) => t.task_date === date && t.status === "Completed"
      );
      const defaultAccomplishments = dayTasks
        .map((t) => {
          const hoursLabel = formatPrintHours(printTaskHours.get(t.task_id));
          return `• ${t.title}${hoursLabel ? ` (${hoursLabel}hrs)` : ""}`;
        })
        .join("\n");

      return {
        date,
        dayLabel: fmtDay(date),
        dateLabel: fmtDate(date),
        accomplishments:
          formatPrintAccomplishments(rpt?.accomplishments, dayTasks) ||
          defaultAccomplishments ||
          "",
        remarks: rpt?.remarks || "",
        personnelRemarks: rpt?.personnel_remarks || "",
      };
    });
  }, [tasks, reports, weekDays, printTaskHours, formatPrintAccomplishments]);

  const printMeta = useMemo(() => {
    const totalHours = logs.reduce(
      (sum, log) => sum + Number.parseFloat(log.hours_rendered || 0),
      0
    );

    return {
      name: "Pareja Felix",
      totalHours: Number.isFinite(totalHours) ? totalHours.toFixed(1) : "0.0",
      department: "Admin - TRG",
      weekNumber: getISOWeek(new Date(`${week.start}T00:00:00`)),
      petsangSaklaw: `${week.start} – ${week.end}`,
    };
  }, [logs, week]);

  return (
    <Box minH="100vh" bg={T.bg} p={{ base: 3, md: 6 }}>

      {/* ── Page Header ── */}
      <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" fontWeight="900" color={T.corpBlue} letterSpacing="tight" textTransform="uppercase">
            📋 Daily Activity Report
          </Heading>
          <Text color="gray.400" fontSize="sm" mt={1} fontWeight="500">
            Track tasks, log hours, and generate your weekly DAR.
          </Text>
        </Box>

        {/* Week navigator */}
        <HStack>
          <IconButton
            icon={<FiChevronLeft />} onClick={() => setWeekOffset(w => w - 1)}
            borderRadius="xl" aria-label="prev week"
            bg="white" border={`1.5px solid ${T.amber}`} color={T.corpBlue}
            _hover={{ bg: T.amberLight }}
          />
          <Box px={5} py={2} bg="white" borderRadius="xl" border={`1.5px solid ${T.amber}`}
            textAlign="center" minW="220px">
            <Text fontSize="9px" fontWeight="900" color={T.amber} textTransform="uppercase" letterSpacing="0.12em">Week</Text>
            <Text fontSize="sm" fontWeight="800" color={T.corpBlue}>{weekLabel(week)}</Text>
          </Box>
          <IconButton
            icon={<FiChevronRight />} onClick={() => setWeekOffset(w => w + 1)}
            borderRadius="xl" aria-label="next week"
            bg="white" border={`1.5px solid ${T.amber}`} color={T.corpBlue}
            _hover={{ bg: T.amberLight }}
          />
        </HStack>
      </Flex>

      {/* ── Analytics Cards ── */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>

        {/* Task Summary */}
        <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" border={`2px solid ${T.amber}`}>
          <Text fontSize="9px" fontWeight="900" color={T.amber} textTransform="uppercase" letterSpacing="0.12em" mb={4}>
            Task Summary
          </Text>
          <Flex justify="space-around" align="center">
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="900" color={T.royalBlue}>{activeCnt}</Text>
              <Text fontSize="9px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em">Active</Text>
            </Box>
            <Box w="1px" h="50px" bg="gray.100" />
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="900" color={T.emerald}>{completeCnt}</Text>
              <Text fontSize="9px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em">Completed</Text>
            </Box>
            <Box w="1px" h="50px" bg="gray.100" />
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="900" color={T.corpBlue}>{tasks.length}</Text>
              <Text fontSize="9px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em">Total</Text>
            </Box>
          </Flex>
        </Box>

        {/* Category Breakdown */}
        <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" border={`2px solid ${T.amber}`}>
          <Text fontSize="9px" fontWeight="900" color={T.amber} textTransform="uppercase" letterSpacing="0.12em" mb={4}>
            Category Breakdown
          </Text>
          <Flex gap={4} align="center">
            <Box flex="1">
              {catBreakdown.map(c => (
                <Flex key={c.name} align="center" justify="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Box w="9px" h="9px" borderRadius="full" bg={c.color} />
                    <Text fontSize="xs" color="gray.600" fontWeight="600" noOfLines={1}>{c.name}</Text>
                  </HStack>
                  <Box bg={c.color} color="white" fontSize="9px" fontWeight="900"
                    px={2} py="2px" borderRadius="full" minW="22px" textAlign="center">
                    {c.count}
                  </Box>
                </Flex>
              ))}
            </Box>
            <Box flexShrink={0}>
              <PieChart width={80} height={80}>
                <Pie data={catBreakdown.filter(c => c.count > 0)} dataKey="count"
                  innerRadius={20} outerRadius={38} paddingAngle={3}>
                  {catBreakdown.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </Box>
          </Flex>
        </Box>

        {/* Hours Rendered */}
        <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" border={`2px solid ${T.amber}`}>
          <Text fontSize="9px" fontWeight="900" color={T.amber} textTransform="uppercase" letterSpacing="0.12em" mb={4}>
            Hours Rendered
          </Text>
          <Flex gap={4} align="center">
            <Box position="relative" flexShrink={0}>
              <PieChart width={90} height={90}>
                <Pie data={catBreakdown.filter(c => c.hours > 0)} dataKey="hours"
                  innerRadius={26} outerRadius={42} paddingAngle={3}>
                  {catBreakdown.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
              <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)" textAlign="center" pointerEvents="none">
                <Text fontSize="11px" fontWeight="900" color={T.corpBlue} lineHeight="1.1">{totalHours.toFixed(1)}</Text>
                <Text fontSize="7px" color="gray.400" fontWeight="600">hrs</Text>
              </Box>
            </Box>
            <Box flex="1">
              {catBreakdown.map(c => (
                <Flex key={c.name} align="center" justify="space-between" mb={1.5}>
                  <HStack spacing={1}>
                    <Box w="7px" h="7px" borderRadius="full" bg={c.color} />
                    <Text fontSize="10px" color="gray.500" noOfLines={1}>{c.name}</Text>
                  </HStack>
                  <Text fontSize="10px" fontWeight="800" color={T.corpBlue}>{c.hours.toFixed(1)}h</Text>
                </Flex>
              ))}
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
                        {t.status === "Completed" ? (
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
                {filteredTasks.filter(t => t.status === "Completed").length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="sm" fontWeight="600" color="gray.300">No accomplished tasks found for this week.</Text>
                  </Box>
                ) : filteredTasks.filter(t => t.status === "Completed").map(t => {
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
            <Box id="dar-print-area">
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
                    const dayTasks  = tasks.filter(t => t.task_date === date && t.status === "Completed");
                    const defaultAc = dayTasks.map(t => `• ${t.title}`).join("\n");
                    return (
                      <Box key={date} {...pillRow} borderLeft={`4px solid ${T.amber}`}>
                        <Flex gap={4} align="flex-start">
                          <Box flex="1.2" pt={1}>
                            <Text fontWeight="900" fontSize="sm" color={T.corpBlue}>{fmtDay(date)}</Text>
                            <Text fontSize="xs" color="gray.400">{fmtDate(date)}</Text>
                          </Box>
                          <Box flex="3">
                            <Textarea {...reportTextarea}
                              defaultValue={rpt?.accomplishments || defaultAc}
                              onBlur={e => saveReport(date, "accomplishments", e.target.value)}
                              placeholder="Ilagay ang mga natapus na gawain…" />
                          </Box>
                          <Box flex="2">
                            <Textarea {...reportTextarea}
                              defaultValue={rpt?.remarks || ""}
                              onBlur={e => saveReport(date, "remarks", e.target.value)}
                              placeholder="Admin remarks…" />
                          </Box>
                          <Box flex="2">
                            <Textarea {...reportTextarea}
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

              <Flex justify="center" mt={6}>
                <Button
                  leftIcon={<FiPrinter />}
                  bg={T.emerald} color="white" size="lg"
                  borderRadius="2xl" fontWeight="900" px={12}
                  boxShadow={`0 8px 25px ${T.emerald}55`}
                  _hover={{ transform: "translateY(-3px)", boxShadow: `0 12px 30px ${T.emerald}77` }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  onClick={() => window.print()}>
                  PRINT DAR
                </Button>
              </Flex>

              <Box className="dar-print-sheet" aria-hidden="true">
                <Box className="dar-print-shell">
                  <Box className="dar-print-header">
                    <Text className="dar-print-title">
                      ULAT UKOL SA NATAPOS NA GAWAIN NG NAGLILINGKOD SA TANGGAPAN
                    </Text>
                    <table className="dar-print-meta">
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
                            <div>{row.dateLabel}</div>
                          </td>
                          <td className="cell-work">{row.accomplishments || "—"}</td>
                          <td className="cell-ref">• Manual</td>
                          <td className="cell-remarks">{row.remarks || ""}</td>
                          <td className="cell-personnel">{row.personnelRemarks || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Box className="dar-print-signature">
                    <Box className="dar-print-lagda">
                      <Text className="dar-print-note">Lagda:</Text>
                      <Box className="dar-print-line" />
                      <Text className="dar-print-name">Pareja Felix</Text>
                    </Box>

                    <Box className="dar-print-noted">
                      <Text className="dar-print-note">Noted by:</Text>
                      <Box className="dar-print-signature-row">
                        <Box className="dar-print-signature-line" />
                        <Text className="dar-print-signature-name">Ronald Te Guzman</Text>
                        <Text className="dar-print-signature-title">Section Chief</Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <TaskModal isOpen={taskModal.isOpen} onClose={taskModal.onClose}
        categories={categories} onSaved={load} initial={editTask} />
      <LogModal isOpen={logModal.isOpen} onClose={logModal.onClose}
        task={logTask} onSaved={load} />

      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 4.5mm;
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

          body * {
            visibility: hidden !important;
          }

          #dar-print-area,
          #dar-print-area * {
            visibility: visible !important;
          }

          #dar-print-area {
            position: static !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          #dar-print-area > *:not(.dar-print-sheet) {
            display: none !important;
          }

          .dar-print-sheet {
            display: block !important;
            visibility: visible !important;
            position: relative;
            width: 119%;
            max-width: 119%;
            height: auto;
            padding: 0;
            margin: 0;
            zoom: 0.84;
            overflow: hidden;
          }

          .dar-print-shell {
            display: flex;
            flex-direction: column;
            width: 100%;
            min-height: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .dar-print-header {
            margin-bottom: 1mm;
          }

          .dar-print-title {
            text-align: center;
            font-size: 11pt;
            font-weight: 700;
            letter-spacing: 0.01em;
            margin: 0 0 0.9mm 0;
            text-transform: uppercase;
          }

          .dar-print-meta {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8.5pt;
            margin-bottom: 0.8mm;
          }

          .dar-print-meta th,
          .dar-print-meta td {
            border: 0.3pt solid #bfbfbf;
            padding: 0.4mm 0.65mm;
            vertical-align: middle;
            word-break: break-word;
          }

          .dar-print-meta th {
            background: #f7f7f7;
            text-align: right;
            font-weight: 700;
            width: 10%;
          }

          .dar-print-meta td {
            text-align: center;
            font-weight: 600;
            white-space: nowrap;
          }

          .dar-print-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8.6pt;
            line-height: 1.0;
            margin-bottom: 0.8mm;
          }

          .dar-print-table th,
          .dar-print-table td {
            border: 0.3pt solid #bfbfbf;
            padding: 0.3mm 0.5mm;
            vertical-align: top;
            word-break: break-word;
            white-space: pre-wrap;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .dar-print-table thead th {
            background: #f7f7f7;
            text-align: center;
            font-weight: 700;
            padding-top: 0.45mm;
            padding-bottom: 0.45mm;
            font-size: 7.8pt;
            line-height: 1.0;
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

          .dar-print-table .col-day { width: 12%; }
          .dar-print-table .col-work { width: 42%; }
          .dar-print-table .col-ref { width: 12%; }
          .dar-print-table .col-remarks { width: 17%; }
          .dar-print-table .col-personnel { width: 17%; }

          .dar-print-table .cell-day {
            text-align: center;
            font-weight: 700;
          }

          .dar-print-table .cell-day div {
            margin-top: 0.1mm;
            font-weight: 500;
          }

          .dar-print-table .cell-work {
            white-space: pre-line;
            line-height: 1.0;
          }

          .dar-print-table .cell-ref {
            text-align: left;
            white-space: pre-line;
            line-height: 1.0;
          }

          .dar-print-signature {
            margin-top: 1mm;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: start;
            column-gap: 8mm;
            padding-top: 0.25mm;
            width: 100%;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .dar-print-lagda,
          .dar-print-noted {
            width: 100%;
            text-align: center;
          }

          .dar-print-note {
            font-size: 8.5pt;
            font-weight: 700;
            margin-bottom: 0.3mm;
          }

          .dar-print-line,
          .dar-print-signature-line {
            border-bottom: 0.4pt solid #111;
            width: 65%;
            margin: 0 auto 0.25mm auto;
          }

          .dar-print-name {
            font-size: 8.5pt;
            font-weight: 500;
          }

          .dar-print-signature-row {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0;
            padding-top: 0.15mm;
          }

          .dar-print-signature-name {
            font-size: 8.5pt;
            font-weight: 600;
            margin-top: -0.6mm;
          }

          .dar-print-signature-title {
            font-size: 7.5pt;
            margin-top: 0.4mm;
          }
        }

        .dar-print-sheet {
          display: none;
        }
      `}</style>
    </Box>
  );
}
