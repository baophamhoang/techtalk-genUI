import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

export interface AlertBannerProps {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
}

const styles = {
  success: { bg: "bg-green-50",  border: "border-green-200", icon: "text-green-600",  text: "text-green-900",  sub: "text-green-700",  Icon: CheckCircle },
  warning: { bg: "bg-amber-50",  border: "border-amber-200", icon: "text-amber-600",  text: "text-amber-900",  sub: "text-amber-700",  Icon: AlertTriangle },
  error:   { bg: "bg-red-50",    border: "border-red-200",   icon: "text-red-600",    text: "text-red-900",    sub: "text-red-700",    Icon: XCircle },
  info:    { bg: "bg-blue-50",   border: "border-blue-200",  icon: "text-blue-600",   text: "text-blue-900",   sub: "text-blue-700",   Icon: Info },
};

export function AlertBanner({ type, title, message }: AlertBannerProps) {
  const s = styles[type] ?? styles.info;
  return (
    <div className={`rounded-2xl border p-5 flex gap-4 ${s.bg} ${s.border}`}>
      <s.Icon size={22} className={`flex-shrink-0 mt-0.5 ${s.icon}`} />
      <div>
        <p className={`font-bold text-sm ${s.text}`}>{title}</p>
        <p className={`text-sm mt-1 leading-relaxed ${s.sub}`}>{message}</p>
      </div>
    </div>
  );
}
