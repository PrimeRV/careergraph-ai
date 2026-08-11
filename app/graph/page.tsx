"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  Minus,
  Plus,
  Maximize,
  RotateCcw,
  Network,
  UserRound,
  Sparkles,
  BriefcaseBusiness,
  Building2,
  MapPin,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

type NodeType = "Student" | "Skill" | "Job" | "Company";

type GraphNode = {
  id: string;
  label: string;
  type: NodeType;
  category?: string;
  role?: string;
  level?: string;
  location?: string;
  company?: string;
  x: number;
  y: number;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
};

type RawNode = {
  id?: string;
  nodeId?: string;
  name?: string;
  title?: string;
  label?: string;
  type?: string;
  category?: string;
  role?: string;
  level?: string;
  location?: string;
  company?: string;
  properties?: Record<string, unknown>;
};

type RawEdge = {
  id?: string;
  source?: string;
  target?: string;
  from?: string;
  to?: string;
  type?: string;
  relationship?: string;
};

type GraphResponse = {
  success?: boolean;
  nodes?: RawNode[];
  edges?: RawEdge[];
  relationships?: RawEdge[];
  data?: {
    nodes?: RawNode[];
    edges?: RawEdge[];
    relationships?: RawEdge[];
  };
};

const GRAPH_WIDTH = 1500;
const GRAPH_HEIGHT = 850;

const NODE_WIDTH = 190;
const NODE_HEIGHT = 68;

const MIN_ZOOM = 0.55;
const MOBILE_MIN_ZOOM = 0.22;
const MAX_ZOOM = 1.25;
const ZOOM_STEP = 0.08;

const STUDENT_X = 650;
const SKILL_X = 70;
const JOB_X = 430;
const COMPANY_X = 1060;

const colors: Record<
  NodeType,
  {
    border: string;
    bg: string;
    iconBg: string;
    text: string;
    line: string;
  }
> = {
  Student: {
    border: "#8b5cf6",
    bg: "rgba(139,92,246,.13)",
    iconBg: "rgba(139,92,246,.20)",
    text: "#c4b5fd",
    line: "#8b5cf6",
  },
  Skill: {
    border: "#3b82f6",
    bg: "rgba(59,130,246,.10)",
    iconBg: "rgba(59,130,246,.18)",
    text: "#93c5fd",
    line: "#3b82f6",
  },
  Job: {
    border: "#10b981",
    bg: "rgba(16,185,129,.10)",
    iconBg: "rgba(16,185,129,.18)",
    text: "#6ee7b7",
    line: "#10b981",
  },
  Company: {
    border: "#f59e0b",
    bg: "rgba(245,158,11,.10)",
    iconBg: "rgba(245,158,11,.18)",
    text: "#fcd34d",
    line: "#f59e0b",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getMinZoom(viewportWidth: number) {
  return viewportWidth < 768 ? MOBILE_MIN_ZOOM : MIN_ZOOM;
}

function getNodeType(value?: string): NodeType {
  const type = String(value || "").toLowerCase();

  if (type.includes("student") || type.includes("user")) {
    return "Student";
  }

  if (type.includes("skill")) {
    return "Skill";
  }

  if (type.includes("job") || type.includes("role")) {
    return "Job";
  }

  if (type.includes("company") || type.includes("organisation")) {
    return "Company";
  }

  return "Skill";
}

function getNodeLabel(node: RawNode) {
  const properties = node.properties || {};

  return String(
    node.name ??
      node.title ??
      node.label ??
      properties.name ??
      properties.title ??
      node.id ??
      node.nodeId ??
      "Unknown"
  );
}

function getNodeId(node: RawNode) {
  return String(
    node.id ??
      node.nodeId ??
      node.properties?.id ??
      `${getNodeType(node.type)}-${getNodeLabel(node)}`
  );
}

function normalizeResponse(result: GraphResponse) {
  const sourceNodes =
    result.nodes ??
    result.data?.nodes ??
    [];

  const sourceEdges =
    result.edges ??
    result.relationships ??
    result.data?.edges ??
    result.data?.relationships ??
    [];

  const nodes: GraphNode[] = sourceNodes.map((node) => {
    const properties = node.properties || {};

    return {
      id: getNodeId(node),
      label: getNodeLabel(node),
      type: getNodeType(node.type ?? String(properties.type ?? "")),
      category:
        node.category ??
        String(properties.category ?? ""),
      role:
        node.role ??
        String(properties.role ?? ""),
      level:
        node.level ??
        String(properties.level ?? ""),
      location:
        node.location ??
        String(properties.location ?? ""),
      company:
        node.company ??
        String(properties.company ?? ""),
      x: 0,
      y: 0,
    };
  });

  const edges: GraphEdge[] = sourceEdges
    .map((edge, index) => ({
      id: String(edge.id ?? `edge-${index}`),
      source: String(edge.source ?? edge.from ?? ""),
      target: String(edge.target ?? edge.to ?? ""),
      type: edge.type ?? edge.relationship ?? "",
    }))
    .filter((edge) => edge.source && edge.target);

  return { nodes, edges };
}

/**
 * Creates a stable 4-column layout.
 *
 * Skill -> Job -> Student -> Company
 *
 * The layout is intentionally deterministic instead of using a force graph.
 * This prevents the nodes from collapsing into each other whenever the
 * browser renders/resizes the graph.
 */
function createLayout(nodes: GraphNode[]) {
  const skills = nodes.filter((n) => n.type === "Skill");
  const jobs = nodes.filter((n) => n.type === "Job");
  const students = nodes.filter((n) => n.type === "Student");
  const companies = nodes.filter((n) => n.type === "Company");

  const positioned: GraphNode[] = [];

  const distribute = (
    list: GraphNode[],
    x: number,
    startY: number,
    gap: number
  ) => {
    list.forEach((node, index) => {
      positioned.push({
        ...node,
        x,
        y: startY + index * gap,
      });
    });
  };

  distribute(skills, SKILL_X, 85, 105);
  distribute(jobs, JOB_X, 85, 105);
  distribute(companies, COMPANY_X, 85, 105);

  const studentStartY =
    students.length === 1
      ? 365
      : 250;

  distribute(students, STUDENT_X, studentStartY, 105);

  return positioned;
}

function getIcon(type: NodeType) {
  if (type === "Student") return UserRound;
  if (type === "Skill") return Sparkles;
  if (type === "Job") return BriefcaseBusiness;
  return Building2;
}

function truncate(value: string, max = 22) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export default function GraphExplorerPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [zoom, setZoom] = useState(0.72);

  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const [isPanning, setIsPanning] = useState(false);

  const graphRef = useRef<HTMLDivElement | null>(null);

  const panStartRef = useRef({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const nodeDragRef = useRef({
    nodeId: "",
    startX: 0,
    startY: 0,
    nodeX: 0,
    nodeY: 0,
  });

  /**
   * Load graph data.
   */
  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/graph?studentId=student-001",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Graph API returned ${response.status}`
        );
      }

      const result: GraphResponse =
        await response.json();

      const normalized = normalizeResponse(result);

      const laidOut = createLayout(
        normalized.nodes
      );

      setNodes(laidOut);
      setEdges(normalized.edges);
    } catch (err) {
      console.error("Graph loading error:", err);

      setError(
        "Unable to load graph data. Please check the graph API."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  /**
   * Fit graph into viewport.
   *
   * Important:
   * This only changes the graph transform.
   * It NEVER changes browser/page zoom.
   */
  const fitGraph = useCallback(() => {
    const viewport = graphRef.current;

    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    const horizontalScale =
      rect.width / GRAPH_WIDTH;

    const verticalScale =
      rect.height / GRAPH_HEIGHT;

    const nextZoom = clamp(
      Math.min(
        horizontalScale,
        verticalScale
      ) * 0.95,
      getMinZoom(rect.width),
      1
    );

    setZoom(nextZoom);

    setPan({
      x:
        (rect.width -
          GRAPH_WIDTH * nextZoom) /
        2,
      y:
        (rect.height -
          GRAPH_HEIGHT * nextZoom) /
        2,
    });
  }, []);

  /**
   * Reset to a sensible desktop layout.
   */
  const resetGraph = useCallback(() => {
    setZoom(0.72);
    setPan({
      x: 0,
      y: 0,
    });
    setSelectedId(null);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      fitGraph();
    };

    const frame = requestAnimationFrame(handleResize);

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [fitGraph]);

  const zoomIn = () => {
    const width =
      graphRef.current?.getBoundingClientRect().width ?? 1024;

    const minZoom = getMinZoom(width);

    setZoom((current) =>
      clamp(
        current + ZOOM_STEP,
        minZoom,
        MAX_ZOOM
      )
    );
  };

  const zoomOut = () => {
    const width =
      graphRef.current?.getBoundingClientRect().width ?? 1024;

    const minZoom = getMinZoom(width);

    setZoom((current) =>
      clamp(
        current - ZOOM_STEP,
        minZoom,
        MAX_ZOOM
      )
    );
  };

  /**
   * IMPORTANT FIX:
   *
   * Normal wheel:
   *     browser scrolls page
   *
   * Ctrl/Cmd + wheel:
   *     graph zooms
   *
   * This prevents the previous bug where scrolling the page
   * changed graph zoom from 80 -> 72 -> 64 -> etc.
   */
  const handleWheel = (
    event: React.WheelEvent<HTMLDivElement>
  ) => {
    if (
      !event.ctrlKey &&
      !event.metaKey
    ) {
      return;
    }

    event.preventDefault();

    const direction =
      event.deltaY > 0 ? -1 : 1;

    const width =
      graphRef.current?.getBoundingClientRect().width ?? 1024;

    const minZoom = getMinZoom(width);

    setZoom((current) =>
      clamp(
        current +
          direction * ZOOM_STEP,
        minZoom,
        MAX_ZOOM
      )
    );
  };

  /**
   * Start panning when dragging empty graph space.
   *
   * Touch is intentionally ignored so mobile browser
   * scrolling keeps working normally.
   */
  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      event.pointerType !== "touch" &&
      event.button !== 0
    ) {
      return;
    }

    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        "[data-graph-node], button, input, textarea, a"
      )
    ) {
      return;
    }

    setIsPanning(true);

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isPanning) return;

    const dx =
      event.clientX -
      panStartRef.current.x;

    const dy =
      event.clientY -
      panStartRef.current.y;

    setPan({
      x:
        panStartRef.current.panX +
        dx,
      y:
        panStartRef.current.panY +
        dy,
    });
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    setIsPanning(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture may already be released.
    }
  };

  /**
   * Start dragging a graph node.
   */
  const handleNodePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    node: GraphNode
  ) => {
    if (event.pointerType === "touch") {
      return;
    }

    if (event.button !== 0) return;

    event.stopPropagation();

    setDraggingNode(node.id);
    setSelectedId(node.id);

    nodeDragRef.current = {
      nodeId: node.id,
      startX: event.clientX,
      startY: event.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handleNodePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!draggingNode) return;

    const dx =
      (event.clientX -
        nodeDragRef.current.startX) /
      zoom;

    const dy =
      (event.clientY -
        nodeDragRef.current.startY) /
      zoom;

    setNodes((current) =>
      current.map((node) => {
        if (
          node.id !==
          nodeDragRef.current.nodeId
        ) {
          return node;
        }

        return {
          ...node,
          x:
            nodeDragRef.current.nodeX +
            dx,
          y:
            nodeDragRef.current.nodeY +
            dy,
        };
      })
    );
  };

  const handleNodePointerUp = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    setDraggingNode(null);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture may already be released.
    }
  };

  /**
   * Search highlighting.
   */
  const matchingNodeIds = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return new Set<string>();
    }

    return new Set(
      nodes
        .filter((node) =>
          [
            node.label,
            node.type,
            node.category,
            node.role,
            node.company,
            node.location,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query)
            )
        )
        .map((node) => node.id)
    );
  }, [nodes, search]);

  const hasSearch = Boolean(search.trim());
  const hasSearchMatches =
    !hasSearch || matchingNodeIds.size > 0;

  /**
   * Connected nodes.
   */
  const connectedIds = useMemo(() => {
    if (!selectedId) {
      return new Set<string>();
    }

    const result =
      new Set<string>();

    result.add(selectedId);

    edges.forEach((edge) => {
      if (edge.source === selectedId) {
        result.add(edge.target);
      }

      if (edge.target === selectedId) {
        result.add(edge.source);
      }
    });

    return result;
  }, [selectedId, edges]);

  /**
   * Selected node.
   */
  const selectedNode = useMemo(
    () =>
      nodes.find(
        (node) =>
          node.id === selectedId
      ) ?? null,
    [nodes, selectedId]
  );

  /**
   * Selected node relationships.
   */
  const selectedRelationships = useMemo(() => {
    if (!selectedId) return [];

    return edges
      .filter(
        (edge) =>
          edge.source === selectedId ||
          edge.target === selectedId
      )
      .map((edge) => {
        const otherId =
          edge.source === selectedId
            ? edge.target
            : edge.source;

        const other =
          nodes.find(
            (node) =>
              node.id === otherId
          );

        return {
          ...edge,
          other,
        };
      })
      .filter((item) => item.other);
  }, [selectedId, edges, nodes]);

  const stats = useMemo(
    () => ({
      students: nodes.filter(
        (n) => n.type === "Student"
      ).length,
      skills: nodes.filter(
        (n) => n.type === "Skill"
      ).length,
      jobs: nodes.filter(
        (n) => n.type === "Job"
      ).length,
      companies: nodes.filter(
        (n) => n.type === "Company"
      ).length,
    }),
    [nodes]
  );

  /**
   * Calculate SVG edge positions.
   *
   * Edges connect to the side of each card instead of
   * crossing directly through the card.
   */
  const getEdgePoints = (
    edge: GraphEdge
  ) => {
    const source = nodes.find(
      (node) => node.id === edge.source
    );

    const target = nodes.find(
      (node) => node.id === edge.target
    );

    if (!source || !target) {
      return null;
    }

    const sourceX =
      source.x + NODE_WIDTH / 2;

    const sourceY =
      source.y + NODE_HEIGHT / 2;

    const targetX =
      target.x + NODE_WIDTH / 2;

    const targetY =
      target.y + NODE_HEIGHT / 2;

    let x1 = sourceX;
    let y1 = sourceY;
    let x2 = targetX;
    let y2 = targetY;

    if (targetX > sourceX) {
      x1 =
        source.x +
        NODE_WIDTH;

      x2 = target.x;
    } else {
      x1 = source.x;
      x2 =
        target.x +
        NODE_WIDTH;
    }

    const curve =
      Math.max(
        60,
        Math.abs(x2 - x1) * 0.35
      );

    const path = `
      M ${x1} ${y1}
      C ${x1 + curve} ${y1},
        ${x2 - curve} ${y2},
        ${x2} ${y2}
    `;

    return {
      path,
      source,
      target,
    };
  };

  return (
    <main className="min-h-screen bg-[#08090f] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 text-sm font-medium text-violet-400">
                Career Intelligence
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Graph Explorer
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Explore relationships between your
                skills, jobs and companies.
              </p>
            </div>

            {/* SEARCH */}
            <div className="relative w-full max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search graph..."
                className="h-11 w-full rounded-xl border border-white/[0.10] bg-[#0d0f16] pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* STATS */}
        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Students",
              value: stats.students,
              type: "Student" as NodeType,
            },
            {
              label: "Skills",
              value: stats.skills,
              type: "Skill" as NodeType,
            },
            {
              label: "Jobs",
              value: stats.jobs,
              type: "Job" as NodeType,
            },
            {
              label: "Companies",
              value: stats.companies,
              type: "Company" as NodeType,
            },
          ].map((item) => {
            const Icon =
              getIcon(item.type);

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/[0.10] bg-[#0d0f16] p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {item.label}
                  </span>

                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background:
                        colors[item.type]
                          .iconBg,
                      color:
                        colors[item.type]
                          .text,
                    }}
                  >
                    <Icon size={17} />
                  </div>
                </div>

                <div className="text-3xl font-bold">
                  {item.value}
                </div>
              </div>
            );
          })}
        </section>

        {/* GRAPH + INSPECTOR */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* GRAPH CARD */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0b0d13]">
            {/* GRAPH HEADER */}
            <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Career Network
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Drag nodes • Drag empty space to
                  pan • Ctrl/Cmd + scroll to zoom
                </p>
                {hasSearch && (
                  <p
                    className={`mt-2 text-xs ${
                      hasSearchMatches
                        ? "text-violet-300"
                        : "text-amber-300"
                    }`}
                  >
                    {hasSearchMatches
                      ? `${matchingNodeIds.size} matching node${
                          matchingNodeIds.size === 1 ? "" : "s"
                        }`
                      : "No matching nodes"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.10] bg-[#11131b] text-slate-400 transition hover:border-violet-500/50 hover:text-white"
                  title="Zoom out"
                >
                  <Minus size={16} />
                </button>

                <div className="min-w-[55px] text-center text-xs font-medium text-slate-400">
                  {Math.round(
                    zoom * 100
                  )}
                  %
                </div>

                <button
                  type="button"
                  onClick={zoomIn}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.10] bg-[#11131b] text-slate-400 transition hover:border-violet-500/50 hover:text-white"
                  title="Zoom in"
                >
                  <Plus size={16} />
                </button>

                <button
                  type="button"
                  onClick={fitGraph}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.10] bg-[#11131b] px-3 text-xs font-medium text-slate-400 transition hover:border-violet-500/50 hover:text-white"
                >
                  <Maximize size={15} />
                  <span className="hidden sm:inline">
                    Fit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={resetGraph}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.10] bg-[#11131b] px-3 text-xs font-medium text-slate-400 transition hover:border-violet-500/50 hover:text-white"
                >
                  <RotateCcw size={15} />
                  <span className="hidden sm:inline">
                    Reset
                  </span>
                </button>
              </div>
            </div>

            {/* GRAPH VIEWPORT */}
            <div
              ref={graphRef}
              onWheel={handleWheel}
              onPointerDown={
                handlePointerDown
              }
              onPointerMove={
                handlePointerMove
              }
              onPointerUp={handlePointerUp}
              onPointerCancel={
                handlePointerUp
              }
              className={`relative h-[560px] w-full overflow-hidden bg-[#080a10] sm:h-[650px] lg:h-[720px] ${
                isPanning
                  ? "cursor-grabbing"
                  : "cursor-default"
              }`}
              style={{
                touchAction: "pan-y",
                backgroundImage: `
                  linear-gradient(
                    rgba(255,255,255,.035) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(255,255,255,.035) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize:
                  "32px 32px",
              }}
            >
              {/* LOADING */}
              {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#080a10]/90 backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Loader2
                      size={18}
                      className="animate-spin text-violet-400"
                    />
                    Loading career graph...
                  </div>
                </div>
              )}

              {/* ERROR */}
              {!loading && error && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
                  <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 text-center">
                    <AlertCircle
                      size={30}
                      className="mx-auto mb-3 text-red-400"
                    />

                    <h3 className="font-semibold text-white">
                      Graph unavailable
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={loadGraph}
                      className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Network
                        size={36}
                        className="mx-auto mb-3 text-slate-600"
                      />
                      <p className="text-sm text-slate-500">
                        No graph data found.
                      </p>
                    </div>
                  </div>
                )}

              {/* GRAPH WORLD */}
              {!loading &&
                !error &&
                nodes.length > 0 &&
                !hasSearchMatches && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080a10]/75 p-6 backdrop-blur-[2px]">
                    <div className="max-w-md rounded-2xl border border-white/[0.08] bg-[#0d0f16] p-6 text-center shadow-2xl">
                      <Search
                        size={34}
                        className="mx-auto mb-3 text-slate-600"
                      />
                      <h3 className="font-semibold text-white">
                        No matching graph data
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        No student, skill, job or company matches
                        <span className="font-medium text-slate-300">
                          {" "}
                          "{search.trim()}"
                        </span>
                        .
                      </p>
                      <button
                        type="button"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => setSearch("")}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
                      >
                        <X size={15} />
                        Clear Search
                      </button>
                    </div>
                  </div>
                )}

              {!loading &&
                !error &&
                nodes.length > 0 && (
                  <div
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      width: GRAPH_WIDTH,
                      height: GRAPH_HEIGHT,
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    }}
                  >
                    {/* EDGES */}
                    <svg
                      className="pointer-events-none absolute inset-0 overflow-visible"
                      width={GRAPH_WIDTH}
                      height={GRAPH_HEIGHT}
                    >
                      <defs>
                        <filter
                          id="graphGlow"
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feGaussianBlur
                            stdDeviation="3"
                            result="blur"
                          />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {edges.map((edge) => {
                        const points =
                          getEdgePoints(edge);

                        if (!points) {
                          return null;
                        }

                        const isSelected =
                          selectedId &&
                          (edge.source ===
                            selectedId ||
                            edge.target ===
                              selectedId);

                        const isDimmed =
                          selectedId &&
                          !isSelected;

                        const sourceType =
                          points.source.type;

                        return (
                          <path
                            key={edge.id}
                            d={points.path}
                            fill="none"
                            stroke={
                              isSelected
                                ? colors[
                                    sourceType
                                  ].line
                                : "#384052"
                            }
                            strokeWidth={
                              isSelected
                                ? 2.2
                                : 1
                            }
                            strokeOpacity={
                              isDimmed
                                ? 0.08
                                : isSelected
                                ? 0.9
                                : 0.32
                            }
                            filter={
                              isSelected
                                ? "url(#graphGlow)"
                                : undefined
                            }
                          />
                        );
                      })}
                    </svg>

                    {/* NODES */}
                    {nodes.map((node) => {
                      const palette =
                        colors[node.type];

                      const Icon =
                        getIcon(node.type);

                      const isSelected =
                        selectedId === node.id;

                      const isConnected =
                        connectedIds.has(
                          node.id
                        );

                      const isSearchMatch =
                        matchingNodeIds.has(
                          node.id
                        );

                      const dimmedBySelection =
                        Boolean(
                          selectedId &&
                            !isConnected
                        );

                      const dimmedBySearch =
                        hasSearch &&
                        !isSearchMatch;

                      const dimmed =
                        dimmedBySelection ||
                        dimmedBySearch;

                      return (
                        <div
                          key={node.id}
                          data-graph-node
                          onPointerDown={(event) =>
                            handleNodePointerDown(
                              event,
                              node
                            )
                          }
                          onPointerMove={
                            handleNodePointerMove
                          }
                          onPointerUp={
                            handleNodePointerUp
                          }
                          onPointerCancel={
                            handleNodePointerUp
                          }
                          onClick={() =>
                            setSelectedId(
                              node.id
                            )
                          }
                          className={`absolute select-none rounded-xl border transition-[opacity,box-shadow,border-color] duration-150 ${
                            draggingNode ===
                            node.id
                              ? "cursor-grabbing"
                              : "cursor-grab"
                          }`}
                          style={{
                            left: node.x,
                            top: node.y,
                            width: NODE_WIDTH,
                            height: NODE_HEIGHT,
                            borderColor:
                              isSelected ||
                              isSearchMatch
                                ? palette.border
                                : `${palette.border}99`,
                            background:
                              palette.bg,
                            opacity: dimmed
                              ? 0.25
                              : 1,
                            boxShadow:
                              isSelected
                                ? `0 0 0 2px ${palette.border}40, 0 0 35px ${palette.border}25`
                                : isSearchMatch
                                ? `0 0 25px ${palette.border}20`
                                : "none",
                            zIndex:
                              isSelected
                                ? 20
                                : 5,
                          }}
                        >
                          <div className="flex h-full items-center gap-3 px-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                              style={{
                                background:
                                  palette.iconBg,
                                color:
                                  palette.text,
                              }}
                            >
                              <Icon
                                size={17}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div
                                className="truncate text-sm font-semibold"
                                style={{
                                  color:
                                    palette.text,
                                }}
                              >
                                {truncate(
                                  node.label,
                                  24
                                )}
                              </div>

                              <div className="mt-1 truncate text-[10px] text-slate-500">
                                {node.type}
                                {node.category
                                  ? ` • ${node.category}`
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* HELP */}
              {!loading &&
                !error &&
                nodes.length > 0 && (
                  <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/[0.08] bg-[#0d0f16]/90 px-3 py-2 text-[11px] text-slate-500 backdrop-blur-sm">
                    <span className="hidden sm:inline">
                      Drag nodes to rearrange • Drag
                      empty space to pan
                    </span>

                    <span className="sm:hidden">
                      Tap nodes to inspect
                    </span>
                  </div>
                )}
            </div>

            {/* LEGEND */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.08] px-5 py-4">
              {(
                [
                  "Student",
                  "Skill",
                  "Job",
                  "Company",
                ] as NodeType[]
              ).map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 text-xs text-slate-500"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        colors[type].line,
                    }}
                  />

                  {type}
                </div>
              ))}
            </div>
          </div>

          {/* NODE INSPECTOR */}
          <aside className="min-h-[420px] rounded-2xl border border-white/[0.10] bg-[#0d0f16]">
            <div className="border-b border-white/[0.08] p-5">
              <div className="text-xs font-medium text-violet-400">
                Node Inspector
              </div>

              <h2 className="mt-1 text-lg font-semibold">
                {selectedNode
                  ? selectedNode.label
                  : "Select a Node"}
              </h2>
            </div>

            {!selectedNode ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/[0.10] text-violet-400">
                  <Network size={26} />
                </div>

                <h3 className="font-medium">
                  Select a node
                </h3>

                <p className="mt-2 max-w-[240px] text-sm leading-6 text-slate-600">
                  Click any student, skill, job or
                  company to explore its connections.
                </p>
              </div>
            ) : (
              <div className="p-5">
                {/* NODE TYPE */}
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background:
                        colors[
                          selectedNode.type
                        ].iconBg,
                      color:
                        colors[
                          selectedNode.type
                        ].text,
                    }}
                  >
                    {React.createElement(
                      getIcon(
                        selectedNode.type
                      ),
                      {
                        size: 20,
                      }
                    )}
                  </div>

                  <div>
                    <div
                      className="text-xs font-medium"
                      style={{
                        color:
                          colors[
                            selectedNode.type
                          ].text,
                      }}
                    >
                      {selectedNode.type}
                    </div>

                    <div className="mt-0.5 text-sm text-slate-500">
                      {selectedNode.category ||
                        selectedNode.role ||
                        "Career graph node"}
                    </div>
                  </div>
                </div>

                {/* META */}
                <div className="space-y-3">
                  {selectedNode.location && (
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-600"
                      />

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-600">
                          Location
                        </div>

                        <div className="mt-1 text-sm text-slate-300">
                          {selectedNode.location}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.level && (
                    <div className="flex items-start gap-3">
                      <BriefcaseBusiness
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-600"
                      />

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-600">
                          Level
                        </div>

                        <div className="mt-1 text-sm text-slate-300">
                          {selectedNode.level}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.company && (
                    <div className="flex items-start gap-3">
                      <Building2
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-600"
                      />

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-600">
                          Company
                        </div>

                        <div className="mt-1 text-sm text-slate-300">
                          {selectedNode.company}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONNECTIONS */}
                <div className="mt-7 border-t border-white/[0.08] pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Connections
                    </h3>

                    <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] text-slate-500">
                      {
                        selectedRelationships.length
                      }
                    </span>
                  </div>

                  {selectedRelationships.length ===
                  0 ? (
                    <p className="text-sm text-slate-600">
                      No relationships found.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRelationships.map(
                        (relationship) => {
                          const other =
                            relationship.other;

                          if (!other) {
                            return null;
                          }

                          const palette =
                            colors[
                              other.type
                            ];

                          return (
                            <button
                              key={
                                relationship.id
                              }
                              type="button"
                              onClick={() =>
                                setSelectedId(
                                  other.id
                                )
                              }
                              className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04]"
                            >
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                style={{
                                  background:
                                    palette.iconBg,
                                  color:
                                    palette.text,
                                }}
                              >
                                {React.createElement(
                                  getIcon(
                                    other.type
                                  ),
                                  {
                                    size: 14,
                                  }
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-medium text-slate-300">
                                  {other.label}
                                </div>

                                <div className="mt-0.5 text-[10px] text-slate-600">
                                  {relationship.type ||
                                    other.type}
                                </div>
                              </div>

                              <ChevronRight
                                size={14}
                                className="text-slate-700 transition group-hover:text-slate-400"
                              />
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* CLEAR */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedId(null)
                  }
                  className="mt-5 w-full rounded-xl border border-white/[0.08] py-2.5 text-xs font-medium text-slate-500 transition hover:border-white/[0.14] hover:text-white"
                >
                  Clear selection
                </button>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}