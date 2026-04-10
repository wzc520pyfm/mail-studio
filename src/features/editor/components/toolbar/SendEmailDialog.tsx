/**
 * Send Email Dialog - Send test emails with virtual mailbox, Resend API, or custom SMTP
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Server,
  Mail,
  FlaskConical,
  ExternalLink,
  Zap,
  Inbox,
  Key,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/features/editor/stores";
import { compileDocument } from "@/features/editor/lib/mjml/compiler";

// SMTP Presets for common email providers
const SMTP_PRESETS = {
  custom: { host: "", port: 587, secure: false, name: "Custom" },
  gmail: { host: "smtp.gmail.com", port: 587, secure: false, name: "Gmail" },
  outlook: { host: "smtp.office365.com", port: 587, secure: false, name: "Outlook/Office365" },
  qq: { host: "smtp.qq.com", port: 465, secure: true, name: "QQ Mail" },
  "163": { host: "smtp.163.com", port: 465, secure: true, name: "163 Mail" },
  aliyun: { host: "smtp.aliyun.com", port: 465, secure: true, name: "Aliyun Mail" },
  sendgrid: { host: "smtp.sendgrid.net", port: 587, secure: false, name: "SendGrid" },
  mailgun: { host: "smtp.mailgun.org", port: 587, secure: false, name: "Mailgun" },
  ses: { host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false, name: "Amazon SES" },
} as const;

type PresetKey = keyof typeof SMTP_PRESETS;

// Local storage keys
const SMTP_STORAGE_KEY = "mail-studio-smtp-config";
const SEND_MODE_STORAGE_KEY = "mail-studio-send-mode";
const RESEND_API_KEY_STORAGE_KEY = "mail-studio-resend-api-key";
const SAVED_RECIPIENTS_STORAGE_KEY = "mail-studio-saved-recipients";

interface SmtpConfig {
  preset: PresetKey;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

interface EmailConfig {
  from: string;
  to: string[];
  subject: string;
}

type SendMode = "test" | "resend" | "smtp";
type SendStatus = "idle" | "sending" | "success" | "error";

export function SendEmailDialog() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [realDelivery, setRealDelivery] = useState(false);

  // Send mode: 'test' (virtual mailbox), 'resend' (Resend API), or 'smtp' (custom SMTP)
  const [sendMode, setSendMode] = useState<SendMode>("test");

  // Resend API Key
  const [resendApiKey, setResendApiKey] = useState("");

  // SMTP Configuration (for smtp mode)
  const [smtp, setSmtp] = useState<SmtpConfig>({
    preset: "custom",
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
  });

  // Email Configuration
  const [email, setEmail] = useState<EmailConfig>({
    from: "",
    to: [],
    subject: "Test Email from Mail Studio",
  });

  // Multi-email input state
  const [toInput, setToInput] = useState("");
  const [savedRecipients, setSavedRecipients] = useState<string[]>([]);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Load saved config from localStorage
  useEffect(() => {
    try {
      // Load send mode preference
      const savedMode = localStorage.getItem(SEND_MODE_STORAGE_KEY);
      if (savedMode === "smtp" || savedMode === "test" || savedMode === "resend") {
        setSendMode(savedMode);
      }

      // Load Resend API key
      const savedResendKey = localStorage.getItem(RESEND_API_KEY_STORAGE_KEY);
      if (savedResendKey) {
        setResendApiKey(savedResendKey);
      }

      // Load saved recipients
      const savedRecips = localStorage.getItem(SAVED_RECIPIENTS_STORAGE_KEY);
      if (savedRecips) {
        const parsed = JSON.parse(savedRecips) as string[];
        setSavedRecipients(parsed);
      }

      // Load SMTP config
      const saved = localStorage.getItem(SMTP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SmtpConfig;
        setSmtp(parsed);
        if (parsed.user && !email.from) {
          setEmail((prev) => ({ ...prev, from: parsed.user }));
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save recipients to localStorage
  const saveRecipients = useCallback((recipients: string[]) => {
    try {
      localStorage.setItem(SAVED_RECIPIENTS_STORAGE_KEY, JSON.stringify(recipients));
      setSavedRecipients(recipients);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save config to localStorage
  const saveConfig = useCallback(() => {
    try {
      localStorage.setItem(SEND_MODE_STORAGE_KEY, sendMode);
      if (sendMode === "resend" && resendApiKey) {
        localStorage.setItem(RESEND_API_KEY_STORAGE_KEY, resendApiKey);
      }
      if (sendMode === "smtp") {
        const toSave = { ...smtp, pass: "" }; // Don't save password
        localStorage.setItem(SMTP_STORAGE_KEY, JSON.stringify(toSave));
      }
      // Persist current recipients to saved list (merge, deduplicate)
      if (email.to.length > 0) {
        const merged = Array.from(new Set([...savedRecipients, ...email.to]));
        saveRecipients(merged);
      }
    } catch {
      // Ignore storage errors
    }
  }, [smtp, sendMode, resendApiKey, email.to, savedRecipients, saveRecipients]);

  // Add email to the "to" list
  const addEmail = useCallback((emailAddr: string) => {
    const trimmed = emailAddr.trim().toLowerCase();
    if (!trimmed) return;
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setEmail((prev) => {
      if (prev.to.includes(trimmed)) return prev;
      return { ...prev, to: [...prev.to, trimmed] };
    });
    setToInput("");
  }, []);

  // Remove email from the "to" list
  const removeEmail = useCallback((emailAddr: string) => {
    setEmail((prev) => ({
      ...prev,
      to: prev.to.filter((e) => e !== emailAddr),
    }));
  }, []);

  // Remove a saved recipient permanently
  const removeSavedRecipient = useCallback(
    (emailAddr: string) => {
      const updated = savedRecipients.filter((e) => e !== emailAddr);
      saveRecipients(updated);
    },
    [savedRecipients, saveRecipients]
  );

  // Handle key events in the "to" input
  const handleToKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
        e.preventDefault();
        addEmail(toInput);
      }
      if (e.key === "Backspace" && !toInput) {
        setEmail((prev) => ({
          ...prev,
          to: prev.to.slice(0, -1),
        }));
      }
    },
    [toInput, addEmail]
  );

  // Handle preset change
  const handlePresetChange = useCallback((preset: PresetKey) => {
    const presetConfig = SMTP_PRESETS[preset];
    setSmtp((prev) => ({
      ...prev,
      preset,
      host: presetConfig.host,
      port: presetConfig.port,
      secure: presetConfig.secure,
    }));
  }, []);

  // Get editor state
  const document = useEditorStore((s) => s.document);
  const headSettings = useEditorStore((s) => s.headSettings);

  // Send email
  const handleSend = useCallback(async () => {
    setStatus("sending");
    setErrorMessage("");
    setPreviewUrl(null);
    setRealDelivery(false);

    // Save config before sending
    saveConfig();

    try {
      // Compile the document to HTML
      const { html } = compileDocument(document, headSettings);

      // Build request body based on mode
      const toRecipients = email.to.length === 1 ? email.to[0] : email.to;

      const requestBody = {
        mode: sendMode,
        ...(sendMode === "resend" ? { resendApiKey } : {}),
        ...(sendMode === "smtp"
          ? {
              smtp: {
                host: smtp.host,
                port: smtp.port,
                secure: smtp.secure,
                auth: {
                  user: smtp.user,
                  pass: smtp.pass,
                },
              },
            }
          : {}),
        email: {
          ...(sendMode !== "test" ? { from: email.from || undefined } : {}),
          to: toRecipients,
          subject: email.subject,
          html,
        },
      };

      // Send request to API
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      setStatus("success");
      setRealDelivery(result.realDelivery || false);

      // Store preview URL for test mode
      if (result.previewUrl) {
        setPreviewUrl(result.previewUrl);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  }, [sendMode, smtp, email, document, headSettings, saveConfig, resendApiKey]);

  // Check if form is valid
  const hasRecipients = email.to.length > 0;
  const isTestModeValid = hasRecipients && email.subject;
  const isResendModeValid = resendApiKey && hasRecipients && email.subject;
  const isSmtpModeValid =
    smtp.host &&
    smtp.port &&
    smtp.user &&
    smtp.pass &&
    email.from &&
    hasRecipients &&
    email.subject;
  const isValid =
    sendMode === "test"
      ? isTestModeValid
      : sendMode === "resend"
        ? isResendModeValid
        : isSmtpModeValid;

  // Reset status when dialog closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset status after a delay to allow closing animation
      setTimeout(() => {
        setStatus("idle");
        setPreviewUrl(null);
        setRealDelivery(false);
      }, 200);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="h-7 md:h-8 !px-1.5 md:!px-3 border-0">
              <Send className="w-4 h-4 md:mr-1.5" />
              <span className="hidden md:inline text-xs">Send</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Send Test Email</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send a test email to preview your design in real email clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[500px] overflow-y-auto">
          {/* Mode Selection - 3 options */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSendMode("test")}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
                sendMode === "test"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div
                className={`p-1.5 rounded-full ${sendMode === "test" ? "bg-primary/10" : "bg-muted"}`}
              >
                <FlaskConical
                  className={`w-4 h-4 ${sendMode === "test" ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-xs">Preview</div>
                <div className="text-[10px] text-muted-foreground">Virtual inbox</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSendMode("resend")}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
                sendMode === "resend"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div
                className={`p-1.5 rounded-full ${sendMode === "resend" ? "bg-primary/10" : "bg-muted"}`}
              >
                <Inbox
                  className={`w-4 h-4 ${sendMode === "resend" ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-xs">Resend</div>
                <div className="text-[10px] text-muted-foreground">Real delivery</div>
              </div>
              {sendMode === "resend" && (
                <div className="flex items-center gap-0.5 text-[10px] text-primary">
                  <Zap className="w-2.5 h-2.5" />
                  Easy
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSendMode("smtp")}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
                sendMode === "smtp"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div
                className={`p-1.5 rounded-full ${sendMode === "smtp" ? "bg-primary/10" : "bg-muted"}`}
              >
                <Server
                  className={`w-4 h-4 ${sendMode === "smtp" ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-xs">SMTP</div>
                <div className="text-[10px] text-muted-foreground">Custom server</div>
              </div>
            </button>
          </div>

          {/* Test Mode Info */}
          {sendMode === "test" && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Virtual Mailbox:</strong> Uses Ethereal Email. Your email will be sent to a
                virtual inbox, and you&apos;ll get a link to preview it online. The email won&apos;t
                actually arrive in the recipient&apos;s inbox.
              </p>
            </div>
          )}

          {/* Resend Mode Info & Config */}
          {sendMode === "resend" && (
            <>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>Real Delivery:</strong> Uses Resend API to send emails directly to the
                  recipient&apos;s inbox. Perfect for testing in real email clients like Gmail,
                  Outlook, etc.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Key className="w-4 h-4" />
                  Resend Configuration
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="resendApiKey">API Key</Label>
                  <Input
                    id="resendApiKey"
                    type="password"
                    placeholder="re_xxxxxxxxxx"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your free API key at{" "}
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      resend.com
                    </a>{" "}
                    (3,000 free emails/month)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="resendFrom">From (optional)</Label>
                  <Input
                    id="resendFrom"
                    type="email"
                    placeholder="onboarding@resend.dev (default)"
                    value={email.from}
                    onChange={(e) => setEmail((prev) => ({ ...prev, from: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use Resend&apos;s default sender, or use your verified domain.
                  </p>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* SMTP Configuration (only for smtp mode) */}
          {sendMode === "smtp" && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Server className="w-4 h-4" />
                  SMTP Configuration
                </div>

                {/* Provider Preset */}
                <div className="grid gap-2">
                  <Label htmlFor="preset">Email Provider</Label>
                  <Select
                    value={smtp.preset}
                    onValueChange={(v) => handlePresetChange(v as PresetKey)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom SMTP</SelectItem>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="outlook">Outlook / Office 365</SelectItem>
                      <SelectItem value="qq">QQ Mail</SelectItem>
                      <SelectItem value="163">163 Mail</SelectItem>
                      <SelectItem value="aliyun">Aliyun Mail</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* SMTP Host & Port */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="host">SMTP Host</Label>
                    <Input
                      id="host"
                      placeholder="smtp.example.com"
                      value={smtp.host}
                      onChange={(e) => setSmtp((prev) => ({ ...prev, host: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      placeholder="587"
                      value={smtp.port}
                      onChange={(e) =>
                        setSmtp((prev) => ({
                          ...prev,
                          port: parseInt(e.target.value) || 587,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* SMTP Auth */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="user">Username / Email</Label>
                    <Input
                      id="user"
                      placeholder="your@email.com"
                      value={smtp.user}
                      onChange={(e) => setSmtp((prev) => ({ ...prev, user: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pass">Password / App Key</Label>
                    <Input
                      id="pass"
                      type="password"
                      placeholder="••••••••"
                      value={smtp.pass}
                      onChange={(e) => setSmtp((prev) => ({ ...prev, pass: e.target.value }))}
                    />
                  </div>
                </div>

                {/* SSL/TLS Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={smtp.secure}
                    onChange={(e) => setSmtp((prev) => ({ ...prev, secure: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="secure" className="text-sm font-normal cursor-pointer">
                    Use SSL/TLS (port 465)
                  </Label>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Email Content Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="w-4 h-4" />
              Email Details
            </div>

            {/* From field only for SMTP mode */}
            {sendMode === "smtp" && (
              <div className="grid gap-2">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  type="email"
                  placeholder="sender@example.com"
                  value={email.from}
                  onChange={(e) => setEmail((prev) => ({ ...prev, from: e.target.value }))}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="to">To</Label>
              <div
                className="flex flex-wrap items-center gap-1.5 min-h-[36px] w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors focus-within:ring-1 focus-within:ring-ring cursor-text"
                onClick={() => toInputRef.current?.focus()}
              >
                {email.to.map((addr) => (
                  <span
                    key={addr}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                  >
                    {addr}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEmail(addr);
                      }}
                      className="rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={toInputRef}
                  id="to"
                  type="text"
                  className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                  placeholder={
                    email.to.length === 0
                      ? sendMode === "test"
                        ? "any@example.com (virtual inbox)"
                        : "recipient@example.com"
                      : "Add more..."
                  }
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={handleToKeyDown}
                  onBlur={() => {
                    if (toInput.trim()) addEmail(toInput);
                  }}
                />
              </div>
              {/* Saved recipients quick-add */}
              {savedRecipients.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Recent:</span>
                  {savedRecipients
                    .filter((r) => !email.to.includes(r))
                    .slice(0, 8)
                    .map((addr) => (
                      <button
                        key={addr}
                        type="button"
                        onClick={() => addEmail(addr)}
                        className="group inline-flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 px-2 py-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        {addr}
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedRecipient(addr);
                          }}
                          className="rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-2.5 h-2.5" />
                        </span>
                      </button>
                    ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Press{" "}
                <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> or{" "}
                <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">,</kbd> to add
                multiple recipients
              </p>
              {sendMode === "test" && (
                <p className="text-xs text-muted-foreground">
                  In preview mode, email won&apos;t actually arrive - you&apos;ll get a preview link
                  instead.
                </p>
              )}
              {(sendMode === "resend" || sendMode === "smtp") && email.to.length > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ Email will be delivered to {email.to.length} address
                  {email.to.length > 1 ? "es" : ""}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={email.subject}
                onChange={(e) => setEmail((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-sm">
                  {realDelivery
                    ? `Email sent successfully to ${email.to.join(", ")}!`
                    : "Email sent successfully!"}
                </span>
              </div>

              {/* Preview Link for Test Mode */}
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md bg-primary/10 hover:bg-primary/15 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">View Email in Virtual Inbox</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              )}

              {/* Real delivery confirmation */}
              {realDelivery && !previewUrl && (
                <div className="p-3 rounded-md bg-green-500/5 border border-green-500/20">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Check your inbox at <strong>{email.to.join(", ")}</strong> to see the email. It
                    may take a few moments to arrive.
                  </p>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{errorMessage || "Failed to send email"}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {status === "success" ? "Done" : "Cancel"}
          </Button>
          {status !== "success" && (
            <Button onClick={handleSend} disabled={!isValid || status === "sending"}>
              {status === "sending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {sendMode === "test" ? "Send Preview" : "Send Email"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
