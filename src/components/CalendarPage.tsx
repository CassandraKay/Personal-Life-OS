import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
  Filter,
  Check,
  Edit2,
  PartyPopper,
  Briefcase,
  Heart,
  Stethoscope,
  Flag,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserLifeOSState, CalendarEventItem, CanvasCardItem, TabType } from "../types";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  onNavigateToTab: (tab: TabType, targetId?: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  appointment: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", label: "Appointment" },
  holiday: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", label: "Holiday" },
  deadline: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800", label: "Deadline" },
  work: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800", label: "Work / Hustle" },
  personal: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800", label: "Personal" },
  health: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800", label: "Health & Care" },
  birthday: { bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800", label: "Celebration" },
};

export const CalendarPage: React.FC<Props> = ({ state, updateState, onNavigateToTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026 base
  const [activeView, setActiveView] = useState<"month" | "agenda">("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Modal for new/edit event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventTime, setEventTime] = useState("10:00");
  const [category, setCategory] = useState<CalendarEventItem["category"]>("appointment");
  const [location, setLocation] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [alsoCreateCanvasCard, setAlsoCreateCanvasCard] = useState(true);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const resetToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const events = state.calendarEvents || [];

  const filteredEvents = events.filter((evt) => {
    if (selectedCategory !== "all" && evt.category !== selectedCategory) return false;
    if (selectedDateFilter && evt.date !== selectedDateFilter) return false;
    return true;
  });

  // Open modal for adding
  const handleOpenAdd = (datePrefill?: string) => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setEventDate(datePrefill || new Date().toISOString().split("T")[0]);
    setEventTime("10:00");
    setCategory("appointment");
    setLocation("");
    setIsHoliday(false);
    setAlsoCreateCanvasCard(true);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (evt: CalendarEventItem) => {
    setEditingEventId(evt.id);
    setTitle(evt.title);
    setDescription(evt.description || "");
    setEventDate(evt.date);
    setEventTime(evt.time || "10:00");
    setCategory(evt.category);
    setLocation(evt.location || "");
    setIsHoliday(!!evt.isHoliday);
    setAlsoCreateCanvasCard(false);
    setIsModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    if (editingEventId) {
      // Update existing
      updateState((prev) => ({
        ...prev,
        calendarEvents: prev.calendarEvents.map((evt) =>
          evt.id === editingEventId
            ? {
                ...evt,
                title: title.trim(),
                description: description.trim(),
                date: eventDate,
                time: eventTime,
                category,
                location: location.trim(),
                isHoliday,
              }
            : evt
        ),
      }));
    } else {
      // Create new
      const newEventId = "evt-" + Date.now();
      let createdCardId: string | undefined = undefined;

      // Also create a linked card on Chaotic Corner canvas if requested
      if (alsoCreateCanvasCard) {
        createdCardId = "card-event-" + Date.now();
        const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));
        const newCard: CanvasCardItem = {
          id: createdCardId,
          type: "event",
          x: 400 + Math.floor(Math.random() * 200) - 100,
          y: 200 + Math.floor(Math.random() * 200) - 100,
          width: 270,
          zIndex: maxZ + 1,
          rotation: Math.floor(Math.random() * 6) - 3,
          title: title.trim(),
          content: description.trim(),
          eventDate,
          eventTime,
          eventLocation: location.trim(),
          eventCategory: category as any,
          linkedEventId: newEventId,
          backgroundColor: "#ECFDF5",
          textColor: "#065F46",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updateState((prev) => ({
          ...prev,
          canvasCards: [...(prev.canvasCards || []), newCard],
        }));
      }

      const newEvent: CalendarEventItem = {
        id: newEventId,
        title: title.trim(),
        description: description.trim(),
        date: eventDate,
        time: eventTime,
        category,
        location: location.trim(),
        isHoliday,
        linkedCanvasCardId: createdCardId,
      };

      updateState((prev) => ({
        ...prev,
        calendarEvents: [...prev.calendarEvents, newEvent],
      }));
      confetti({ particleCount: 35, spread: 50 });
    }

    setIsModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    if (confirm("Delete this event?")) {
      updateState((prev) => ({
        ...prev,
        calendarEvents: prev.calendarEvents.filter((evt) => evt.id !== id),
        canvasCards: prev.canvasCards.filter((card) => card.linkedEventId !== id),
      }));
    }
  };

  // Pin / Create Canvas Card for an existing event
  const handlePinToCanvas = (evt: CalendarEventItem) => {
    if (evt.linkedCanvasCardId) {
      onNavigateToTab("canvas");
      return;
    }

    const newCardId = "card-event-" + Date.now();
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));

    const newCard: CanvasCardItem = {
      id: newCardId,
      type: "event",
      x: 350 + Math.floor(Math.random() * 150),
      y: 200 + Math.floor(Math.random() * 150),
      width: 270,
      zIndex: maxZ + 1,
      rotation: Math.floor(Math.random() * 6) - 3,
      title: evt.title,
      content: evt.description || "",
      eventDate: evt.date,
      eventTime: evt.time,
      eventLocation: evt.location,
      eventCategory: evt.category as any,
      linkedEventId: evt.id,
      backgroundColor: "#ECFDF5",
      textColor: "#065F46",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), newCard],
      calendarEvents: (prev.calendarEvents || []).map((e) =>
        e.id === evt.id ? { ...e, linkedCanvasCardId: newCardId } : e
      ),
    }));

    confetti({ particleCount: 30, spread: 45 });
    onNavigateToTab("canvas");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Calendar, Appointments & Holidays
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track key milestones, appointments, holidays, and link them to your Chaotic Corner creation canvas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab("canvas")}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Chaotic Corner
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Event / Appointment
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedDateFilter(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedCategory === "all" && !selectedDateFilter
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All ({events.length})
          </button>
          {Object.entries(CATEGORY_COLORS).map(([catKey, catMeta]) => {
            const count = events.filter((e) => e.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedCategory === catKey
                    ? `${catMeta.bg} ${catMeta.text} ring-2 ring-emerald-500`
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {catMeta.label} ({count})
              </button>
            );
          })}
        </div>

        {/* View Toggle (Month / Agenda) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveView("month")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeView === "month"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500"
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setActiveView("agenda")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeView === "agenda"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500"
            }`}
          >
            Agenda List
          </button>
        </div>
      </div>

      {activeView === "month" ? (
        /* Month Calendar Grid View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          {/* Month Header controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {monthName} {year}
              </h2>
              <button
                onClick={resetToday}
                className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div
                key={"empty-" + idx}
                className="min-h-[90px] p-1.5 rounded-2xl bg-slate-50/40 dark:bg-slate-800/20 border border-transparent"
              />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                dayNum
              ).padStart(2, "0")}`;
              const dayEvents = events.filter((e) => e.date === formattedDate);
              const isSelected = selectedDateFilter === formattedDate;

              return (
                <div
                  key={formattedDate}
                  onClick={() =>
                    setSelectedDateFilter(isSelected ? null : formattedDate)
                  }
                  className={`min-h-[95px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {dayNum}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAdd(formattedDate);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-opacity"
                      title="Add event on this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Event Badges */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => {
                      const catStyle = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.appointment;
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(evt);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold truncate border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          title={evt.title}
                        >
                          {evt.isHoliday ? "🎉 " : ""}
                          {evt.title}
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-400 px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Selected Day or Filtered Events Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>
              {selectedDateFilter ? `Events for ${selectedDateFilter}` : "All Upcoming Events & Holidays"}
            </span>
          </h3>
          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter(null)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Clear date filter
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
            <CalendarIcon className="w-8 h-8 mx-auto text-slate-400" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No events found for this filter
            </div>
            <button
              onClick={() => handleOpenAdd(selectedDateFilter || undefined)}
              className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              + Create an event now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => {
              const catMeta = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.appointment;

              return (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}
                      >
                        {catMeta.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg text-xs"
                          title="Edit event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-lg text-xs"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {evt.title}
                    </h4>

                    {evt.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    <div className="space-y-1 pt-1 text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{evt.date}</span>
                        {evt.time && <span>• {evt.time}</span>}
                      </div>

                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handlePinToCanvas(evt)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Open or Pin Card on Chaotic Corner Canvas"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{evt.linkedCanvasCardId ? "View on Canvas" : "Pin to Canvas"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                {editingEventId ? "Edit Event / Appointment" : "Create New Event"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dentist Visit, Project Deadline, Labor Day"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="appointment">Appointment (Doctor, Meeting, Salon)</option>
                  <option value="holiday">Holiday / National Celebration</option>
                  <option value="deadline">Project Deadline / Sprint</option>
                  <option value="work">Work & Side Hustle</option>
                  <option value="personal">Personal / Family</option>
                  <option value="health">Health & Fitness</option>
                  <option value="birthday">Birthday / Party</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Clinic Suite 300, Zoom, Home"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Preparation notes or details..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden resize-none"
                />
              </div>

              {!editingEventId && (
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={alsoCreateCanvasCard}
                    onChange={(e) => setAlsoCreateCanvasCard(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Also place an Event Card on Chaotic Corner Canvas</span>
                </label>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {editingEventId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
