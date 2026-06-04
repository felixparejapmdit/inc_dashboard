import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Box, Flex, Text, Heading, Button, Input, Select, Textarea,
  IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, useToast,
  VStack, HStack, SimpleGrid, Spinner, Tooltip, InputGroup, InputLeftElement,
} from "@chakra-ui/react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiPrinter,
  FiList, FiGrid, FiCheckSquare, FiFileText, FiClock,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { PieChart, Pie, Cell } from "recharts";
import { getAuthHeaders } from "../utils/apiHeaders";

const API = process.env.REACT_APP_API_URL || "";

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

// ─── Status badge config ───────────────────────────────────────────────────────
const STATUS_CFG = {
  Active:   { bg: "#EFF6FF", color: "#1D4ED8", label: "ACTIVE"   },
  Complete: { bg: "#F59E0B", color: "#FFFFFF",  label: "COMPLETE" },
  Check:    { bg: "#FEF3C7", color: "#92400E",  label: "CHECK"    },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const fmtDay  = (d) => DAYS[new Date(d + "T00:00:00").getDay()];
const todayISO = () => new Date().toISOString().split("T")[0];

function getWeekBounds(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  const day = d.getDay();
  const monday = new Date(d); monday.setDate(d.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const iso = (dt) => dt.toISOString().split("T")[0];
  return { start: iso(monday), end: iso(sunday) };
}

function weekLabel({ start, end }) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end   + "T00:00:00");
  const fmt = (dt) => dt.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  return `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`;
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
  const blank = { title: "", category_id: "", description: "", task_date: todayISO(), start_time: "", end_time: "", status: "Active" };
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
      toast({ title: "Failed to save task.", description: err.message, status: "error", duration: 3000, isClosable: true });
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
            <Box w="full">
              <Text fontSize="9px" fontWeight="800" mb={1} color="gray.400" textTransform="uppercase" letterSpacing="0.12em">Status</Text>
              <Select name="status" value={form.status} onChange={handleChange} {...fieldStyle}>
                {["Active","Complete","Check"].map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Box>
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
      await axios.post(`${API}/api/dar/logs`, { task_id: task.task_id, ...form }, { headers: getAuthHeaders() });
      toast({ title: "Log saved!", status: "success", duration: 2000, isClosable: true });
      onSaved(); onClose();
    } catch {
      toast({ title: "Failed to save log.", status: "error", duration: 3000, isClosable: true });
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

  const week = useMemo(() => getWeekBounds(weekOffset), [weekOffset]);

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
      toast({ title: "Failed to load data.", description: err.message, status: "error", duration: 3000, isClosable: true });
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
    } catch { toast({ title: "Delete failed.", status: "error", duration: 2000, isClosable: true }); }
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
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  }, [week]);

  const activeCnt   = tasks.filter(t => t.status === "Active").length;
  const completeCnt = tasks.filter(t => t.status === "Complete").length;
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
              <Text fontSize="9px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em">Complete</Text>
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
                        <Text fontSize="xs" color="gray.500">{t.start_time || "—"}</Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.500">{t.end_time || "—"}</Text>
                      </Box>
                      <Box flex="1.2"><StatusBadge status={t.status} /></Box>
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

          {/* ──────────────── CARD VIEW (Kanban by day) ──────────────── */}
          {activeTab === "card" && (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
              {weekDays.map(date => {
                const dayTasks = filteredTasks.filter(t => t.task_date === date);
                return (
                  <Box key={date} bg="white" borderRadius="2xl" boxShadow="sm"
                    border={`2px solid ${T.amber}`} overflow="hidden">
                    {/* Day header */}
                    <Box bg={T.corpBlue} p={3}>
                      <Text fontSize="9px" fontWeight="900" color={T.amber} textTransform="uppercase" letterSpacing="0.12em">
                        {fmtDay(date)}
                      </Text>
                      <Text fontSize="sm" fontWeight="800" color="white">{fmtDate(date)}</Text>
                      <Box as="span" bg={T.amber} color={T.corpBlue} fontSize="9px" fontWeight="900"
                        px={2} py="2px" borderRadius="full" display="inline-block" mt={1}>
                        {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
                      </Box>
                    </Box>
                    {/* Tasks */}
                    <VStack p={3} spacing={2} align="stretch" minH="120px">
                      {dayTasks.length === 0 ? (
                        <Text fontSize="xs" color="gray.300" textAlign="center" mt={4}>No tasks</Text>
                      ) : dayTasks.map(t => (
                        <Box key={t.task_id} p={3} bg="#F8F9FA" borderRadius="xl"
                          borderLeft={`3px solid ${catColor(t.category_id)}`}
                          cursor="pointer" transition="all 0.15s"
                          _hover={{ boxShadow: "md", bg: "white", transform: "translateY(-1px)" }}
                          onClick={() => { setEditTask(t); taskModal.onOpen(); }}>
                          <Text fontSize="xs" fontWeight="900" color={catColor(t.category_id)} noOfLines={2}>{t.title}</Text>
                          <Flex justify="space-between" align="center" mt={1}>
                            <Text fontSize="9px" color="gray.400" fontWeight="600">{catName(t.category_id)}</Text>
                            <StatusBadge status={t.status} />
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
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
                {filteredTasks.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="sm" fontWeight="600" color="gray.300">No tasks this week.</Text>
                  </Box>
                ) : filteredTasks.map(t => {
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
                    const dayTasks  = tasks.filter(t => t.task_date === date && t.status === "Complete");
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
          body * { visibility: hidden !important; }
          #dar-print-area, #dar-print-area * { visibility: visible !important; }
          #dar-print-area { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </Box>
  );
}
