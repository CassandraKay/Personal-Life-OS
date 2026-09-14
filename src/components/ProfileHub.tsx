import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Edit3,
  Check,
  Copy,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  Target,
  Award,
  AlertCircle,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserLifeOSState, UserProfile, EmergencyContact, SocialLinks, ContactDetailItem } from "../types";

export const EMAIL_LABELS = ["Primary", "Personal", "Work", "School", "Support", "Other"];
export const PHONE_LABELS = ["Mobile", "Work", "Home", "WhatsApp", "Pager", "Other"];

export const normalizeEmails = (
  emails?: (string | ContactDetailItem)[],
  fallbackEmail?: string
): ContactDetailItem[] => {
  if (emails && emails.length > 0) {
    return emails.map((item, idx) => {
      if (typeof item === "string") {
        return {
          id: `em-${idx}-${item}`,
          value: item,
          label: idx === 0 ? "Primary" : "Work",
          isPrimary: idx === 0,
        };
      }
      return {
        id: item.id || `em-${idx}`,
        value: item.value || "",
        label: item.label || (idx === 0 ? "Primary" : "Work"),
        isPrimary: item.isPrimary ?? (idx === 0),
      };
    });
  }
  if (fallbackEmail && fallbackEmail.trim()) {
    return [
      {
        id: "em-fallback-0",
        value: fallbackEmail.trim(),
        label: "Primary",
        isPrimary: true,
      },
    ];
  }
  return [
    {
      id: "em-default-0",
      value: "",
      label: "Primary",
      isPrimary: true,
    },
  ];
};

export const normalizePhones = (
  phones?: (string | ContactDetailItem)[],
  fallbackPhone?: string
): ContactDetailItem[] => {
  if (phones && phones.length > 0) {
    return phones.map((item, idx) => {
      if (typeof item === "string") {
        return {
          id: `ph-${idx}-${item}`,
          value: item,
          label: idx === 0 ? "Mobile" : "Work",
          isPrimary: idx === 0,
        };
      }
      return {
        id: item.id || `ph-${idx}`,
        value: item.value || "",
        label: item.label || (idx === 0 ? "Mobile" : "Work"),
        isPrimary: item.isPrimary ?? (idx === 0),
      };
    });
  }
  if (fallbackPhone && fallbackPhone.trim()) {
    return [
      {
        id: "ph-fallback-0",
        value: fallbackPhone.trim(),
        label: "Mobile",
        isPrimary: true,
      },
    ];
  }
  return [
    {
      id: "ph-default-0",
      value: "",
      label: "Mobile",
      isPrimary: true,
    },
  ];
};

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ProfileHub: React.FC<Props> = ({ state, updateState, onNavigateToTab }) => {
  const profile = state.profile;

  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState(false);

  // Active normalized contacts for display
  const activeEmails = normalizeEmails(profile.emails, profile.email);
  const activePhones = normalizePhones(profile.phoneNumbers, profile.phone);

  // Form State
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    name: profile.name || "",
    preferredName: profile.preferredName || "",
    title: profile.title || "",
    age: profile.age || "",
    birthDate: profile.birthDate || "",
    email: profile.email || "",
    phone: profile.phone || "",
    pronouns: profile.pronouns || "",
    avatarUrl: profile.avatarUrl || "",
    bio: profile.bio || "",
    streetAddress: profile.streetAddress || "",
    city: profile.city || "",
    stateProvince: profile.stateProvince || "",
    postalCode: profile.postalCode || "",
    country: profile.country || "",
    timezone: profile.timezone || "America/Los_Angeles (PST)",
    emergencyContact: profile.emergencyContact || {
      name: "",
      relation: "",
      phone: "",
    },
    bloodType: profile.bloodType || "",
    medicalNotes: profile.medicalNotes || "",
    socialLinks: profile.socialLinks || {
      website: "",
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
    },
    mainGoal: profile.mainGoal || "",
    monthlyRevenueTarget: profile.monthlyRevenueTarget || 1000,
    primaryFocus: profile.primaryFocus || "",
    focusTheme: profile.focusTheme || "",
    skills: profile.skills || ["TypeScript", "React", "Design", "Problem Solving"],
  });

  // Multiple Emails and Phones in modal form
  const [formEmails, setFormEmails] = useState<ContactDetailItem[]>(() =>
    normalizeEmails(profile.emails, profile.email)
  );
  const [formPhones, setFormPhones] = useState<ContactDetailItem[]>(() =>
    normalizePhones(profile.phoneNumbers, profile.phone)
  );

  // Inline Quick-Add state for Contact & Comms card on profile view
  const [showAddEmailInline, setShowAddEmailInline] = useState(false);
  const [inlineEmailValue, setInlineEmailValue] = useState("");
  const [inlineEmailLabel, setInlineEmailLabel] = useState("Work");

  const [showAddPhoneInline, setShowAddPhoneInline] = useState(false);
  const [inlinePhoneValue, setInlinePhoneValue] = useState("");
  const [inlinePhoneLabel, setInlinePhoneLabel] = useState("Work");

  const [newSkill, setNewSkill] = useState("");

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openEditModal = () => {
    setFormData({
      ...profile,
      name: profile.name || "",
      preferredName: profile.preferredName || "",
      title: profile.title || "",
      age: profile.age || "",
      birthDate: profile.birthDate || "",
      email: profile.email || "",
      phone: profile.phone || "",
      pronouns: profile.pronouns || "",
      avatarUrl: profile.avatarUrl || "",
      bio: profile.bio || "",
      streetAddress: profile.streetAddress || "",
      city: profile.city || "",
      stateProvince: profile.stateProvince || "",
      postalCode: profile.postalCode || "",
      country: profile.country || "",
      timezone: profile.timezone || "America/Los_Angeles (PST)",
      emergencyContact: profile.emergencyContact || {
        name: "",
        relation: "",
        phone: "",
      },
      bloodType: profile.bloodType || "",
      medicalNotes: profile.medicalNotes || "",
      socialLinks: profile.socialLinks || {
        website: "",
        github: "",
        linkedin: "",
        twitter: "",
        instagram: "",
      },
      mainGoal: profile.mainGoal || "",
      monthlyRevenueTarget: profile.monthlyRevenueTarget || 1000,
      primaryFocus: profile.primaryFocus || "",
      focusTheme: profile.focusTheme || "",
      skills: profile.skills || ["TypeScript", "React", "Design", "Problem Solving"],
    });
    setFormEmails(normalizeEmails(profile.emails, profile.email));
    setFormPhones(normalizePhones(profile.phoneNumbers, profile.phone));
    setIsEditing(true);
  };

  // Form Email actions
  const handleAddFormEmail = () => {
    setFormEmails((prev) => [
      ...prev,
      {
        id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        value: "",
        label: prev.length === 0 ? "Primary" : "Work",
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleInsertFormEmailAfter = (index: number) => {
    setFormEmails((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, {
        id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        value: "",
        label: "Work",
        isPrimary: false,
      });
      return copy;
    });
  };

  const handleRemoveFormEmail = (index: number) => {
    setFormEmails((prev) => {
      if (prev.length <= 1) {
        return [{ id: prev[0].id, value: "", label: "Primary", isPrimary: true }];
      }
      const updated = prev.filter((_, idx) => idx !== index);
      if (!updated.some((e) => e.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleUpdateFormEmail = (index: number, field: keyof ContactDetailItem, value: any) => {
    setFormEmails((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSetPrimaryEmail = (index: number) => {
    setFormEmails((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === index,
      }))
    );
  };

  // Form Phone actions
  const handleAddFormPhone = () => {
    setFormPhones((prev) => [
      ...prev,
      {
        id: `ph-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        value: "",
        label: prev.length === 0 ? "Mobile" : "Work",
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleInsertFormPhoneAfter = (index: number) => {
    setFormPhones((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, {
        id: `ph-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        value: "",
        label: "Work",
        isPrimary: false,
      });
      return copy;
    });
  };

  const handleRemoveFormPhone = (index: number) => {
    setFormPhones((prev) => {
      if (prev.length <= 1) {
        return [{ id: prev[0].id, value: "", label: "Mobile", isPrimary: true }];
      }
      const updated = prev.filter((_, idx) => idx !== index);
      if (!updated.some((p) => p.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleUpdateFormPhone = (index: number, field: keyof ContactDetailItem, value: any) => {
    setFormPhones((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSetPrimaryPhone = (index: number) => {
    setFormPhones((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === index,
      }))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmails = formEmails.filter((e) => e.value.trim().length > 0);
    const cleanPhones = formPhones.filter((p) => p.value.trim().length > 0);

    const primaryEmail = cleanEmails.find((e) => e.isPrimary)?.value || cleanEmails[0]?.value || "";
    const primaryPhone = cleanPhones.find((p) => p.isPrimary)?.value || cleanPhones[0]?.value || "";

    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...formData,
        email: primaryEmail,
        emails: cleanEmails.length > 0 ? cleanEmails : (primaryEmail ? [{ id: "em-0", value: primaryEmail, label: "Primary", isPrimary: true }] : []),
        phone: primaryPhone,
        phoneNumbers: cleanPhones.length > 0 ? cleanPhones : (primaryPhone ? [{ id: "ph-0", value: primaryPhone, label: "Mobile", isPrimary: true }] : []),
        age: formData.age ? Number(formData.age) || formData.age : undefined,
        monthlyRevenueTarget: Number(formData.monthlyRevenueTarget) || 0,
      },
    }));

    setIsEditing(false);
    setSaveBanner(true);
    confetti({ particleCount: 40, spread: 60 });
    setTimeout(() => setSaveBanner(false), 3000);
  };

  // Direct quick-add on Contact Card
  const handleSaveInlineEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inlineEmailValue.trim();
    if (!val) return;
    const current = normalizeEmails(profile.emails, profile.email).filter(e => e.value.trim());
    const isFirst = current.length === 0;
    const newItem: ContactDetailItem = {
      id: `em-${Date.now()}`,
      value: val,
      label: inlineEmailLabel,
      isPrimary: isFirst,
    };
    const updated = [...current, newItem];
    const prim = updated.find(e => e.isPrimary)?.value || updated[0]?.value || "";
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        email: prim,
        emails: updated,
      },
    }));
    setInlineEmailValue("");
    setShowAddEmailInline(false);
    setSaveBanner(true);
    confetti({ particleCount: 20, spread: 45 });
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleSaveInlinePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inlinePhoneValue.trim();
    if (!val) return;
    const current = normalizePhones(profile.phoneNumbers, profile.phone).filter(p => p.value.trim());
    const isFirst = current.length === 0;
    const newItem: ContactDetailItem = {
      id: `ph-${Date.now()}`,
      value: val,
      label: inlinePhoneLabel,
      isPrimary: isFirst,
    };
    const updated = [...current, newItem];
    const prim = updated.find(p => p.isPrimary)?.value || updated[0]?.value || "";
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        phone: prim,
        phoneNumbers: updated,
      },
    }));
    setInlinePhoneValue("");
    setShowAddPhoneInline(false);
    setSaveBanner(true);
    confetti({ particleCount: 20, spread: 45 });
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleRemoveEmailDirect = (id: string) => {
    const current = normalizeEmails(profile.emails, profile.email);
    const updated = current.filter((e) => e.id !== id);
    const nextPrimary = updated.find((e) => e.isPrimary)?.value || updated[0]?.value || "";
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        email: nextPrimary,
        emails: updated,
      },
    }));
  };

  const handleRemovePhoneDirect = (id: string) => {
    const current = normalizePhones(profile.phoneNumbers, profile.phone);
    const updated = current.filter((p) => p.id !== id);
    const nextPrimary = updated.find((p) => p.isPrimary)?.value || updated[0]?.value || "";
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        phone: nextPrimary,
        phoneNumbers: updated,
      },
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (formData.skills?.includes(newSkill.trim())) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()],
    }));
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skillToRemove) || [],
    }));
  };

  const copyFullContactCard = () => {
    const validEmails = activeEmails.filter(e => e.value.trim());
    const validPhones = activePhones.filter(p => p.value.trim());

    const emailsString = validEmails.length > 0
      ? validEmails.map(e => `${e.value}${e.label ? ` (${e.label})` : ""}${e.isPrimary ? " [Primary]" : ""}`).join("; ")
      : (profile.email || "N/A");

    const phonesString = validPhones.length > 0
      ? validPhones.map(p => `${p.value}${p.label ? ` (${p.label})` : ""}${p.isPrimary ? " [Primary]" : ""}`).join("; ")
      : (profile.phone || "N/A");

    const lines = [
      `Name: ${profile.name || "N/A"}${profile.preferredName ? ` (${profile.preferredName})` : ""}`,
      `Title: ${profile.title || "N/A"}`,
      `Emails: ${emailsString}`,
      `Phones: ${phonesString}`,
      `Address: ${[profile.streetAddress, profile.city, profile.stateProvince, profile.postalCode, profile.country].filter(Boolean).join(", ") || "N/A"}`,
      `Emergency Contact: ${profile.emergencyContact?.name || "N/A"} (${profile.emergencyContact?.relation || "N/A"}) - ${profile.emergencyContact?.phone || "N/A"}`,
      `Website: ${profile.socialLinks?.website || "N/A"}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedField("Full Contact Card");
    setTimeout(() => setCopiedField(null), 2500);
  };

  const fullAddressString = [
    profile.streetAddress,
    profile.city,
    profile.stateProvince,
    profile.postalCode,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner Alert */}
      {saveBanner && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-2.5 px-4 rounded-2xl flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Profile & Contact details saved and synchronized!
          </div>
          <span className="text-[11px] opacity-80 font-mono">Updated</span>
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 shadow-xs relative overflow-hidden">
        {/* Ambient Top Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-md border-4 border-slate-100 dark:border-slate-800">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white" title="Active">
                ✓
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profile.name || "Your Name"}
                </h1>
                {profile.preferredName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800">
                    "{profile.preferredName}"
                  </span>
                )}
                {profile.pronouns && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {profile.pronouns}
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-500" />
                <span>{profile.title || "Independent Builder & Creator"}</span>
              </div>

              {profile.bio && (
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed pt-1">
                  {profile.bio}
                </p>
              )}

              {/* Age, Birthday & Location Quick Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                {profile.age !== undefined && profile.age !== "" && (
                  <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Age: <strong>{profile.age}</strong>
                  </span>
                )}
                {profile.birthDate && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Born: {profile.birthDate}
                  </span>
                )}
                {(profile.city || profile.country) && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row sm:flex-col gap-2 shrink-0 self-stretch sm:self-auto">
            <button
              onClick={openEditModal}
              className="flex-1 sm:flex-initial px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile & Info
            </button>

            <button
              onClick={copyFullContactCard}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all"
              title="Copy all contact information to clipboard"
            >
              {copiedField === "Full Contact Card" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === "Full Contact Card" ? "Copied!" : "Copy Contact vCard"}</span>
            </button>
          </div>
        </div>

        {/* Life OS Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Knowledge Notes</div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{state.notes.length}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Active Projects</div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{state.projects.length}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Habits Tracked</div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{state.habits.length}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Monthly Target</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">${profile.monthlyRevenueTarget}</div>
          </div>
        </div>
      </div>

      {/* Main Profile Grid: Contact, Address, Emergency ICE, Socials, Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Contact Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Comms</h2>
              </div>
              <button
                onClick={openEditModal}
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit All</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Emails Subsection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email Addresses
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold">
                      {activeEmails.filter(e => e.value.trim()).length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddEmailInline(!showAddEmailInline)}
                    className="p-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer"
                    title="Add another email"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Inline Add Email Form */}
                {showAddEmailInline && (
                  <form onSubmit={handleSaveInlineEmail} className="p-2.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="new.email@example.com"
                        value={inlineEmailValue}
                        onChange={(e) => setInlineEmailValue(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                      />
                      <select
                        value={inlineEmailLabel}
                        onChange={(e) => setInlineEmailLabel(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                      >
                        {EMAIL_LABELS.map((lbl) => (
                          <option key={lbl} value={lbl}>{lbl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddEmailInline(false);
                          setInlineEmailValue("");
                        }}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-[11px] font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer"
                      >
                        Save Email
                      </button>
                    </div>
                  </form>
                )}

                {/* Email List */}
                <div className="space-y-1.5">
                  {activeEmails.filter(e => e.value.trim()).length > 0 ? (
                    activeEmails.filter(e => e.value.trim()).map((eItem) => (
                      <div
                        key={eItem.id}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                            eItem.isPrimary
                              ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                              : "bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}>
                            {eItem.isPrimary ? "Primary" : (eItem.label || "Email")}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate select-all">
                            {eItem.value}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <a
                            href={`mailto:${eItem.value}`}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-sky-600 transition-all"
                            title={`Send email to ${eItem.value}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(eItem.value, `Email-${eItem.id}`)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                            title="Copy email address"
                          >
                            {copiedField === `Email-${eItem.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {activeEmails.filter(e => e.value.trim()).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEmailDirect(eItem.id)}
                              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Remove email"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
                      <span>No email configured yet</span>
                      <button
                        type="button"
                        onClick={() => setShowAddEmailInline(true)}
                        className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Email
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Numbers Subsection */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Phone Numbers
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold">
                      {activePhones.filter(p => p.value.trim()).length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddPhoneInline(!showAddPhoneInline)}
                    className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer"
                    title="Add another phone number"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Inline Add Phone Form */}
                {showAddPhoneInline && (
                  <form onSubmit={handleSaveInlinePhone} className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="tel"
                        required
                        autoFocus
                        placeholder="+1 (555) 000-0000"
                        value={inlinePhoneValue}
                        onChange={(e) => setInlinePhoneValue(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                      <select
                        value={inlinePhoneLabel}
                        onChange={(e) => setInlinePhoneLabel(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                      >
                        {PHONE_LABELS.map((lbl) => (
                          <option key={lbl} value={lbl}>{lbl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddPhoneInline(false);
                          setInlinePhoneValue("");
                        }}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-[11px] font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer"
                      >
                        Save Phone
                      </button>
                    </div>
                  </form>
                )}

                {/* Phone List */}
                <div className="space-y-1.5">
                  {activePhones.filter(p => p.value.trim()).length > 0 ? (
                    activePhones.filter(p => p.value.trim()).map((pItem) => (
                      <div
                        key={pItem.id}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                            pItem.isPrimary
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}>
                            {pItem.isPrimary ? "Primary" : (pItem.label || "Phone")}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-mono select-all">
                            {pItem.value}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <a
                            href={`tel:${pItem.value}`}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-emerald-600 transition-all"
                            title={`Call ${pItem.value}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(pItem.value, `Phone-${pItem.id}`)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                            title="Copy phone number"
                          >
                            {copiedField === `Phone-${pItem.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {activePhones.filter(p => p.value.trim()).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoneDirect(pItem.id)}
                              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Remove phone number"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
                      <span>No phone configured yet</span>
                      <button
                        type="button"
                        onClick={() => setShowAddPhoneInline(true)}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Phone
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timezone */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Timezone</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {profile.timezone || "Local"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Multiple emails & phones synchronized</span>
            <span className="font-mono text-[10px]">Private Vault</span>
          </div>
        </div>

        {/* 2. Physical Address & Location Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Address & Residence</h2>
              </div>
              {fullAddressString && (
                <button
                  onClick={() => handleCopy(fullAddressString, "Address")}
                  className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  {copiedField === "Address" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === "Address" ? "Copied" : "Copy Address"}
                </button>
              )}
            </div>

            {fullAddressString ? (
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {profile.streetAddress && <div>{profile.streetAddress}</div>}
                  <div>
                    {[profile.city, profile.stateProvince, profile.postalCode].filter(Boolean).join(", ")}
                  </div>
                  {profile.country && <div className="font-bold">{profile.country}</div>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">City / State</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {[profile.city, profile.stateProvince].filter(Boolean).join(", ") || "—"}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Postal / ZIP</span>
                    <strong className="text-slate-800 dark:text-slate-200">{profile.postalCode || "—"}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                <MapPin className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs">No address configured yet.</p>
                <button
                  onClick={openEditModal}
                  className="px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  + Add Address
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Quick fill for shipping & invoices</span>
            <span className="font-mono text-[10px]">1-Click Copy</span>
          </div>
        </div>

        {/* 3. Emergency Contact & Medical ICE Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Emergency (ICE) & Health</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                ICE
              </span>
            </div>

            <div className="space-y-3">
              {/* Emergency Contact Person */}
              <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    Primary Emergency Contact
                  </span>
                  {profile.emergencyContact?.relation && (
                    <span className="text-[10px] px-2 py-0.2 rounded-md bg-white dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold">
                      {profile.emergencyContact.relation}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile.emergencyContact?.name || "Not specified"}
                </div>
                {profile.emergencyContact?.phone && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {profile.emergencyContact.phone}
                    </span>
                    <button
                      onClick={() => handleCopy(profile.emergencyContact?.phone || "", "Emergency Phone")}
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                    >
                      {copiedField === "Emergency Phone" ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>

              {/* Blood Type & Medical Notes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Blood Type</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono text-sm">
                    {profile.bloodType || "—"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Medical / Allergy</span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate block">
                    {profile.medicalNotes || "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            For personal safety and travel emergency reference.
          </div>
        </div>

        {/* 4. Social & Online Presence Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center font-bold text-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Online Profiles & Links</h2>
              </div>
            </div>

            <div className="space-y-2">
              {profile.socialLinks?.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span className="truncate">{profile.socialLinks.website}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
                </a>
              )}

              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github.startsWith("http") ? profile.socialLinks.github : `https://github.com/${profile.socialLinks.github.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span className="truncate">{profile.socialLinks.github}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
                </a>
              )}

              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin.startsWith("http") ? profile.socialLinks.linkedin : `https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{profile.socialLinks.linkedin}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </a>
              )}

              {profile.socialLinks?.twitter && (
                <a
                  href={profile.socialLinks.twitter.startsWith("http") ? profile.socialLinks.twitter : `https://x.com/${profile.socialLinks.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    <span className="truncate">{profile.socialLinks.twitter}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
          >
            Manage Social Handles
          </button>
        </div>

        {/* 5. Life Mission & Strategic Goals Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Life Philosophy & Focus Blueprint</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                North Star
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Main Operating Goal
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {profile.mainGoal || "Define your main 2026 goal here."}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Focus Theme & Energy
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {profile.focusTheme || "Unstoppable Momentum & Daily Calm"}
                </p>
              </div>
            </div>

            {/* Skills & Badges */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Strengths & Skill Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No skills added yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Synchronized across your workspace</span>
            <button
              onClick={openEditModal}
              className="text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
            >
              Update Life Targets →
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsEditing(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Personal Profile & Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your name, age, contact info, address, and emergency ICE info
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
              {/* Section 1: Basic Identity */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> 1. Identity & Bio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal / Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Vance"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Name / Nickname
                    </label>
                    <input
                      type="text"
                      value={formData.preferredName || ""}
                      onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                      placeholder="e.g. Alex"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Professional Title / Role
                    </label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Full-Stack Developer"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="130"
                        value={formData.age !== undefined ? formData.age : ""}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="e.g. 26"
                        className="w-full bg-slate-50 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Pronouns
                      </label>
                      <input
                        type="text"
                        value={formData.pronouns || ""}
                        onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                        placeholder="e.g. they/them"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate || ""}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Avatar Photo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.avatarUrl || ""}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio / Personal Statement
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio || ""}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short bio or personal motto..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Section 2: Contact Info (Multiple Emails & Phone Numbers) */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> 2. Contact Information
                  </h3>
                  <span className="text-[11px] text-slate-400">Multiple emails & phone numbers supported</span>
                </div>

                {/* Multiple Emails */}
                <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-500" />
                      <span>Email Addresses</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                        {formEmails.length}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddFormEmail}
                      className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="Add another email (+)"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Email</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {formEmails.map((emailItem, index) => (
                      <div
                        key={emailItem.id || index}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
                      >
                        {/* Primary Selector button */}
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryEmail(index)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                            emailItem.isPrimary
                              ? "bg-sky-600 text-white shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                          title="Click to set as primary email"
                        >
                          {emailItem.isPrimary ? "★ Primary" : "Make Primary"}
                        </button>

                        {/* Label selector */}
                        <select
                          value={emailItem.label || "Work"}
                          onChange={(e) => handleUpdateFormEmail(index, "label", e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 shrink-0 font-medium focus:outline-hidden"
                        >
                          {EMAIL_LABELS.map((lbl) => (
                            <option key={lbl} value={lbl}>
                              {lbl}
                            </option>
                          ))}
                        </select>

                        {/* Email Input */}
                        <input
                          type="email"
                          value={emailItem.value}
                          onChange={(e) => handleUpdateFormEmail(index, "value", e.target.value)}
                          placeholder="e.g. name@company.com"
                          className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                        />

                        {/* Plus button next to email to add more & trash button */}
                        <div className="flex items-center gap-1 justify-end shrink-0">
                          <button
                            type="button"
                            onClick={() => handleInsertFormEmailAfter(index)}
                            className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg transition-all cursor-pointer"
                            title="Add email below this one (+)"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFormEmail(index)}
                            disabled={formEmails.length <= 1 && !emailItem.value}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Remove this email"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multiple Phone Numbers */}
                <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Phone Numbers</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                        {formPhones.length}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddFormPhone}
                      className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="Add another phone number (+)"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Phone</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {formPhones.map((phoneItem, index) => (
                      <div
                        key={phoneItem.id || index}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
                      >
                        {/* Primary Selector button */}
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryPhone(index)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                            phoneItem.isPrimary
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                          title="Click to set as primary phone"
                        >
                          {phoneItem.isPrimary ? "★ Primary" : "Make Primary"}
                        </button>

                        {/* Label selector */}
                        <select
                          value={phoneItem.label || "Mobile"}
                          onChange={(e) => handleUpdateFormPhone(index, "label", e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 shrink-0 font-medium focus:outline-hidden"
                        >
                          {PHONE_LABELS.map((lbl) => (
                            <option key={lbl} value={lbl}>
                              {lbl}
                            </option>
                          ))}
                        </select>

                        {/* Phone Input */}
                        <input
                          type="tel"
                          value={phoneItem.value}
                          onChange={(e) => handleUpdateFormPhone(index, "value", e.target.value)}
                          placeholder="e.g. +1 (555) 019-2834"
                          className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        />

                        {/* Plus button next to phone to add more & trash button */}
                        <div className="flex items-center gap-1 justify-end shrink-0">
                          <button
                            type="button"
                            onClick={() => handleInsertFormPhoneAfter(index)}
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg transition-all cursor-pointer"
                            title="Add phone below this one (+)"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFormPhone(index)}
                            disabled={formPhones.length <= 1 && !phoneItem.value}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Remove this phone number"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Residential Address */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> 3. Physical Address & Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Street Address & Unit/Apt
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress || ""}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Seattle"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={formData.stateProvince || ""}
                        onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                        placeholder="e.g. WA"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Postal / ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode || ""}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="e.g. 98101"
                        className="w-full bg-slate-50 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country || ""}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="e.g. United States"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Timezone
                      </label>
                      <input
                        type="text"
                        value={formData.timezone || ""}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        placeholder="e.g. America/New_York (EST)"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Emergency ICE & Health */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> 4. Emergency ICE & Medical
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...(formData.emergencyContact || { name: "", relation: "", phone: "" }),
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Morgan Vance"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.relation || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...(formData.emergencyContact || { name: "", relation: "", phone: "" }),
                            relation: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Sibling / Spouse"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContact?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...(formData.emergencyContact || { name: "", relation: "", phone: "" }),
                            phone: e.target.value,
                          },
                        })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Blood Type (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.bloodType || ""}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      placeholder="e.g. O+, A-, etc."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Allergies / Critical Medical Notes
                    </label>
                    <input
                      type="text"
                      value={formData.medicalNotes || ""}
                      onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                      placeholder="e.g. Penicillin allergy"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Social Links */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> 5. Social & Portfolio Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Personal Website / Portfolio
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks?.website || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, website: e.target.value },
                        })
                      }
                      placeholder="https://yourname.dev"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GitHub Handle or URL
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks?.github || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, github: e.target.value },
                        })
                      }
                      placeholder="https://github.com/username"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks?.linkedin || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Twitter / X Handle
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks?.twitter || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                        })
                      }
                      placeholder="@username"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Skills */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> 6. Core Skills & Badges
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill or domain strength..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-500 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Profile Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
