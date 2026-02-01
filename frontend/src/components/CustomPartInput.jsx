import { useState } from 'react';
import './CustomPartInput.css';

/**
 * Input for adding custom parts with removable chip tags.
 */
function CustomPartInput({ parts, onPartsChange }) {
  const [inputValue, setInputValue] = useState('');

  const addPart = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !parts.includes(trimmed)) {
      onPartsChange([...parts, trimmed]);
      setInputValue('');
    }
  };

  const removePart = (partToRemove) => {
    onPartsChange(parts.filter(p => p !== partToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPart();
    }
  };

  return (
    <div className="custom-parts">
      <label className="custom-parts-label">
        Add Custom Parts <span className="optional">(optional)</span>
      </label>

      <div className="custom-parts-input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Servo Motor SG90"
          className="custom-parts-input"
        />
        <button
          type="button"
          onClick={addPart}
          disabled={!inputValue.trim()}
          className="custom-parts-add-btn"
        >
          Add
        </button>
      </div>

      {parts.length > 0 && (
        <div className="custom-parts-tags">
          {parts.map((part) => (
            <span key={part} className="custom-part-tag">
              {part}
              <button
                type="button"
                onClick={() => removePart(part)}
                className="custom-part-remove"
                aria-label={`Remove ${part}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomPartInput;
