import React from "react";
import { Link } from "react-router-dom";
import shared from "./admin.shared.module.scss";

interface AdminPlaceholderProps {
  title: string;
  description?: string;
  icon?: string;
}

/**
 * Reusable "coming soon" page for admin sections that have a sidebar entry
 * and dashboard links but are not built yet. Renders inside AdminLayout.
 */
const AdminPlaceholder: React.FC<AdminPlaceholderProps> = ({
  title,
  description,
  icon = "🚧",
}) => (
  <div className={shared.page}>
    <div className={shared.pageHead}>
      <h1 className={shared.pageTitle}>{title}</h1>
      <p className={shared.pageSubtitle}>
        {description ?? "This section is coming soon. The Dashboard and Orders are fully built."}
      </p>
    </div>
    <div className={shared.card}>
      <div className={shared.emptyState}>
        <div className={shared.emptyIcon}>{icon}</div>
        <div className={shared.emptyTitle}>Coming soon</div>
        <p className={shared.emptyText}>
          {description ?? `The ${title} manager is on the roadmap.`}
        </p>
        <Link to="/admin" className={`${shared.btn} ${shared.btnPrimary}`}>
          Back to dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default AdminPlaceholder;
