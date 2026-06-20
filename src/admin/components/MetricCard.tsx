import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: any;
  change?: {
    value: string;
    isPositive: boolean;
  };
  period?: string;
}

export function MetricCard({ title, value, icon, change, period }: MetricCardProps) {
  return (
    <div className="admin-metric-card">
      <div className="admin-metric-header">
        <span className="admin-metric-title">{title}</span>
        {icon && (
          <HugeiconsIcon 
            icon={icon} 
            size={18} 
            className="admin-metric-icon" 
          />
        )}
      </div>
      
      <div>
        <h3 className="admin-metric-value">{value}</h3>
        {(change || period) && (
          <div className="admin-metric-footer">
            {change && (
              <span className={`admin-metric-change ${change.isPositive ? "positive" : "negative"}`}>
                {change.isPositive ? "+" : ""}{change.value}
              </span>
            )}
            {period && <span className="admin-metric-period">{period}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
