import { getKitMeta, getKitColorVar } from '../data/kitMeta';
import './KitCard.css';

/**
 * Enhanced kit card with color-coded accent, description, and selection state.
 */
function KitCard({ kit, selected, onToggle }) {
  const meta = getKitMeta(kit.name);
  const colorVar = getKitColorVar(meta.color);

  return (
    <div
      className={`kit-card ${selected ? 'selected' : ''}`}
      onClick={onToggle}
      style={{ '--kit-accent': `var(${colorVar})` }}
    >
      <div className="kit-card-accent" />

      <div className="kit-card-content">
        <div className="kit-card-header">
          <span className="kit-card-icon">{meta.icon}</span>
          <h3 className="kit-card-name">{kit.name}</h3>
          {selected && (
            <span className="kit-card-check">✓</span>
          )}
        </div>

        <p className="kit-card-description">{meta.description}</p>

        <div className="kit-card-footer">
          <span className="kit-card-badge">
            {kit.parts?.length || 0} parts
          </span>
        </div>
      </div>
    </div>
  );
}

export default KitCard;
