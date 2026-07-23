import Icon from "./Icon.jsx";

export default function RoleCard({ role, onSelect, disabled }) {
  return (
    <button className="role-card" onClick={() => onSelect(role)} disabled={disabled}>
      <div className="role-card__badge">
        <Icon name={role.icon} size={22} />
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
