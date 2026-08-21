import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

type Message = {
  id: string;
  type: "bot" | "user";
  text: string;
  time: string;
};

type QuickReply = {
  id: string;
  text: string;
  action: string;
  waUrl?: string; // if set, renders as direct <a> link to WhatsApp
};

const WHATSAPP_NUMBER = "966537519929";

const fmt = () =>
  new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

const waLink = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

const SERVICE_MAP: Record<string, string> = {
  book_home: "تنظيف منازل وشقق",
  book_deep: "تنظيف عميق",
  book_office: "تنظيف مكاتب",
  book_carpet: "تنظيف سجاد ومفروشات",
  book_post: "تنظيف ما بعد البناء",
};

type FlowKey = "greeting" | "service_select" | "prices" | "services_info";

const FLOW: Record<FlowKey, { text: string; replies: QuickReply[] }> = {
  greeting: {
    text: "مرحباً! 👋 أنا مساعد كلينولوجي الآلي.\n\nكيف يمكنني مساعدتك اليوم؟",
    replies: [
      { id: "book", text: "📅 احجز الآن", action: "service_select" },
      { id: "prices", text: "💰 الأسعار", action: "prices" },
      { id: "services", text: "🧹 خدماتنا", action: "services_info" },
      { id: "agent", text: "💬 تحدث مع موظف", action: "agent" },
    ],
  },
  service_select: {
    text: "ممتاز! ما نوع الخدمة التي تحتاجها؟",
    replies: [
      { id: "home", text: "🏠 تنظيف منازل وشقق", action: "book_home" },
      { id: "deep", text: "✨ تنظيف عميق", action: "book_deep" },
      { id: "office", text: "🏢 تنظيف مكاتب", action: "book_office" },
      { id: "carpet", text: "🛋️ تنظيف سجاد", action: "book_carpet" },
      { id: "post", text: "🔨 ما بعد البناء", action: "book_post" },
    ],
  },
  prices: {
    text: "أسعارنا تبدأ من 250 ريال وتختلف حسب نوع الخدمة وحجم المساحة.\n\nللحصول على عرض سعر مخصص تواصل معنا مباشرة! 💚",
    replies: [
      {
        id: "get_price",
        text: "💬 اطلب عرض سعر عبر واتساب",
        action: "wa_direct",
        waUrl: waLink("مرحباً، أريد الاستفسار عن الأسعار وطلب عرض سعر."),
      },
      { id: "back", text: "↩️ رجوع", action: "greeting" },
    ],
  },
  services_info: {
    text: "نقدم مجموعة متكاملة من خدمات التنظيف الاحترافية:\n\n🏠 تنظيف منازل وشقق\n✨ تنظيف عميق شامل\n🏢 تنظيف مكاتب وشركات\n🛋️ تنظيف سجاد ومفروشات\n🔨 تنظيف ما بعد البناء",
    replies: [
      { id: "book_now", text: "📅 احجز الآن", action: "service_select" },
      { id: "back", text: "↩️ رجوع", action: "greeting" },
    ],
  },
};

const WA_PATTERN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='%23d4ccc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export const WhatsAppChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [typing, setTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const pushBot = (text: string, newReplies: QuickReply[] = []) => {
    setTyping(true);
    setReplies([]);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: "bot", text, time: fmt() },
      ]);
      setReplies(newReplies);
    }, 900);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowBadge(false);
    if (messages.length === 0) {
      setTimeout(() => pushBot(FLOW.greeting.text, FLOW.greeting.replies), 200);
    }
  };

  const handleReply = (reply: QuickReply) => {
    // waUrl replies are <a> links — browser handles navigation, no JS needed
    if (reply.waUrl) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "user", text: reply.text, time: fmt() },
    ]);
    setReplies([]);

    const { action } = reply;

    if (action === "greeting") {
      pushBot(FLOW.greeting.text, FLOW.greeting.replies);
      return;
    }
    if (action === "service_select") {
      pushBot(FLOW.service_select.text, FLOW.service_select.replies);
      return;
    }
    if (action === "prices") {
      pushBot(FLOW.prices.text, FLOW.prices.replies);
      return;
    }
    if (action === "services_info") {
      pushBot(FLOW.services_info.text, FLOW.services_info.replies);
      return;
    }
    if (action === "agent") {
      pushBot(
        "اضغط الزر أدناه للتحدث مع أحد موظفي خدمة العملاء مباشرة 💚",
        [
          {
            id: "wa_agent",
            text: "💬 فتح واتساب",
            action: "wa_direct",
            waUrl: waLink("مرحباً، أريد التحدث مع أحد موظفي خدمة العملاء."),
          },
        ]
      );
      return;
    }
    if (SERVICE_MAP[action]) {
      const name = SERVICE_MAP[action];
      pushBot(
        `ممتاز! اضغط الزر أدناه لإتمام حجز خدمة "${name}" عبر واتساب 💚`,
        [
          {
            id: "wa_book",
            text: "📲 فتح واتساب للحجز",
            action: "wa_direct",
            waUrl: waLink(`مرحباً، أريد حجز خدمة ${name}.`),
          },
          { id: "back2", text: "↩️ رجوع", action: "service_select" },
        ]
      );
      return;
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl w-[330px] sm:w-[360px] flex flex-col overflow-hidden border border-gray-100"
          style={{ direction: "rtl", maxHeight: "min(520px, 85vh)" }}
        >
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logobg.png"
                  alt="Kleenology"
                  className="h-9 w-9 rounded-full bg-white object-contain p-0.5"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">كلينولوجي</p>
                <p className="text-white/80 text-xs">متاح الآن · رد خلال دقائق</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0"
            style={{ background: `#ECE5DD url("${WA_PATTERN}")` }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-xl text-sm whitespace-pre-line shadow-sm leading-relaxed ${
                    msg.type === "bot"
                      ? "bg-white text-gray-800 rounded-tl-none"
                      : "bg-[#DCF8C6] text-gray-800 rounded-tr-none"
                  }`}
                >
                  {msg.text}
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.type === "bot" ? "text-gray-400 text-left" : "text-gray-500 text-right"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          {replies.length > 0 && (
            <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex flex-wrap gap-2 flex-shrink-0">
              {replies.map((r) =>
                r.waUrl ? (
                  <a
                    key={r.id}
                    href={r.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[#25D366] text-white rounded-full px-4 py-2 font-semibold hover:bg-[#20BA5A] transition-colors flex items-center gap-1"
                  >
                    {r.text}
                  </a>
                ) : (
                  <button
                    key={r.id}
                    onClick={() => handleReply(r)}
                    className="text-xs border border-[#25D366] text-[#25D366] rounded-full px-3 py-1.5 hover:bg-[#25D366] hover:text-white transition-colors font-medium"
                  >
                    {r.text}
                  </button>
                )
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-1.5 bg-white border-t border-gray-100 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center">
              مدعوم بواتساب · كلينولوجي للتنظيف
            </p>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <button
        onClick={handleOpen}
        className="relative w-14 h-14 bg-[#25D366] rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 active:scale-95"
        aria-label="تواصل عبر واتساب"
      >
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            1
          </span>
        )}
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>
    </div>
  );
};
