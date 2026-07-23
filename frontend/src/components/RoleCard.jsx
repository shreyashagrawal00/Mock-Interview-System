import Icon from "./Icon.jsx";

export default function RoleCard({ role, onSelect, disabled }) {
  const isFresher = role.levelType === "fresher";

  return (
    <button className={`role-card ${isFresher ? "role-card--fresher" : "role-card--upgraded"}`} onClick={() => onSelect(role)} disabled={disabled}>
      <div className="role-card__header">
        <div className="role-card__badge">
          <Icon name={role.icon} size={22} />
        </div>
        {role.level && (
          <span className={`level-pill ${isFresher ? "level-pill--fresher" : "level-pill--upgraded"}`}>
            {role.level}
          </span>
        )}
      </div>
      <h3 className="role-card__title">{role.title}</h3>
      <p className="role-card__desc">{role.description}</p>
      <div className="role-card__focus">{role.focus}</div>
      <div className="role-card__cta">
        Start practice <Icon name="arrowRight" size={16} />
      </div>
    </button>
  );
}
