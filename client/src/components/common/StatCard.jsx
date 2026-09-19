// =============================================
// client/src/components/common/StatCard.jsx
//
// CONCEPT: Props for Data-Driven UI
// =============================================
// The dashboard shows 5 metric cards at the top.
// Instead of writing 5 different components, we write ONE
// StatCard component that accepts its content as props.
//
// Parent (Dashboard.jsx) passes data in:
//   <StatCard
//     icon="🏥"
//     iconColor="blue"
//     value={1284}
//     label="Total Patients"
//     change="+12 this month"
//     changeType="up"
//   />
// =============================================

export default function StatCard({ icon, iconColor = 'blue', value, label, change, changeType }) {
  return (
    <div className="stat-card">
      {/* Icon box — color class controls background color via CSS */}
      <div className={`stat-icon ${iconColor}`}>
        {icon}
      </div>

      <div className="stat-info">
        {/* The main number */}
        <div className="stat-value">{value}</div>

        {/* Description label below the number */}
        <div className="stat-label">{label}</div>

        {/* Optional trend indicator (e.g. "+12 this month") */}
        {/* This is CONDITIONAL RENDERING: only show if "change" prop exists */}
        {change && (
          <div className={`stat-change ${changeType || ''}`}>
            {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
          </div>
        )}
      </div>
    </div>
  );
}
