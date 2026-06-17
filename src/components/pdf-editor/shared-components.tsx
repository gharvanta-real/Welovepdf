import React from "react";

// Generic UI widgets for the Ribbon layout
export function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "3px", flex: 1 }}>{children}</div>
      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

export function RibbonDivider() {
  return <div style={{ width: "1px", backgroundColor: "var(--border)", alignSelf: "stretch", margin: "4px 8px" }} />;
}

interface RibbonBtnProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  color?: string;
  style?: React.CSSProperties;
}

export function RibbonBtn({ icon, label, onClick, active, disabled, color, style: extraStyle }: RibbonBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        padding: "4px 8px",
        minWidth: "44px",
        height: "44px",
        borderRadius: "10px",
        border: active ? `1px solid ${color || "var(--c-accent)"}33` : "1px solid transparent",
        background: active ? `${color || "var(--c-accent)"}15` : "transparent",
        color: active ? (color || "var(--c-accent)") : disabled ? "var(--border)" : "var(--c-text)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "0.62rem",
        fontWeight: "600",
        transition: "all 0.12s",
        opacity: disabled ? 0.4 : 1,
        ...extraStyle
      }}
    >
      {icon}
      <span style={{ whiteSpace: "nowrap", maxWidth: "48px", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </button>
  );
}

interface FormatBtnProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title?: string;
}

export function FormatBtn({ children, active, onClick, title }: FormatBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "4px 10px",
        borderRadius: "9999px",
        minHeight: "26px",
        border: active ? "1px solid var(--c-accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-soft)" : "var(--c-bg)",
        color: active ? "var(--c-accent)" : "var(--c-text)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        fontWeight: "500"
      }}
    >
      {children}
    </button>
  );
}

interface ColorSwatchProps {
  label: string;
  color: string;
  onClick: () => void;
}

export function ColorSwatch({ label, color, onClick }: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
        padding: "4px 10px",
        borderRadius: "9999px",
        border: "1px solid var(--border)",
        background: "var(--c-bg)",
        color: "var(--c-text)",
        cursor: "pointer"
      }}
    >
      {label && <span style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--c-text)" }}>{label}</span>}
      <div style={{ width: label ? "20px" : "16px", height: "4px", backgroundColor: color, borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)" }} />
    </button>
  );
}

interface ColorPickerProps {
  colors: string[];
  selected: string;
  onSelect: (c: string) => void;
  onClose: () => void;
}

export function ColorPicker({ colors, selected, onSelect, onClose }: ColorPickerProps) {
  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      zIndex: 100,
      backgroundColor: "var(--c-surface)",
      borderRadius: "8px",
      padding: "8px",
      boxShadow: "var(--shadow)",
      border: "1px solid var(--border)",
      display: "grid",
      gridTemplateColumns: "repeat(10, 18px)",
      gap: "3px",
      width: "214px"
    }}>
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          title={c}
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: c,
            border: selected === c ? "2px solid var(--c-accent)" : "1px solid rgba(0,0,0,0.12)",
            cursor: "pointer"
          }}
        />
      ))}
    </div>
  );
}

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function ModalOverlay({ children, onClose }: ModalOverlayProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(9,10,15,0.4)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: "var(--c-surface)",
          color: "var(--c-text)",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--border)"
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PropLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: "0.72rem", fontWeight: "500", color: "var(--text-muted)" }}>{children}</span>;
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: "0.72rem", fontWeight: "500", color: "var(--c-text)", textTransform: "capitalize" }}>{value}</span>
    </div>
  );
}

// Shared button/input styles
export const quietBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "9999px",
  border: "1px solid var(--border)",
  background: "var(--c-surface)",
  color: "var(--c-text)",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.82rem"
};

export const primaryBtn: React.CSSProperties = {
  padding: "8px 18px",
  borderRadius: "9999px",
  border: "1px solid var(--c-accent)",
  color: "var(--c-bg)",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.82rem"
};

export const propActionBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  borderRadius: "9999px",
  border: "1px solid var(--border)",
  background: "var(--c-bg)",
  color: "var(--c-text)",
  cursor: "pointer",
  fontSize: "0.75rem",
  fontWeight: "500"
};

export const modalInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 18px",
  border: "1px solid var(--border)",
  borderRadius: "9999px",
  fontSize: "0.85rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "var(--c-text)",
  backgroundColor: "var(--c-bg)"
};
