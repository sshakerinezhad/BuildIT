import { useState } from 'react';
import './StepWizard.css';

/**
 * Step-by-step assembly wizard with progress tracking.
 */
function StepWizard({ steps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(new Set());

  const totalSteps = steps.length;
  const completedCount = completed.size;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const toggleComplete = (index) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectStep = (index) => {
    setCurrentStep(index);
  };

  if (!steps || steps.length === 0) {
    return <p className="step-wizard-empty">No steps available</p>;
  }

  return (
    <div className="step-wizard">
      {/* Progress Header */}
      <div className="step-wizard-header">
        <span className="step-wizard-title">Assembly Steps</span>
        <span className="step-wizard-count">
          {completedCount} of {totalSteps} complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="step-wizard-progress">
        <div
          className="step-wizard-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="step-wizard-list">
        {steps.map((step, index) => {
          const isCompleted = completed.has(index);
          const isActive = index === currentStep;
          const isPast = index < currentStep;

          return (
            <div
              key={index}
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div className={`step-connector ${isCompleted || isPast ? 'done' : ''}`} />
              )}

              {/* Step indicator */}
              <button
                className="step-indicator"
                onClick={() => selectStep(index)}
                aria-label={`Go to step ${index + 1}`}
              >
                {isCompleted ? (
                  <span className="step-check">✓</span>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </button>

              {/* Step content */}
              <div className="step-content">
                <div
                  className="step-header"
                  onClick={() => selectStep(index)}
                >
                  <span className="step-text">{step}</span>
                </div>

                {/* Expanded details for active step */}
                {isActive && (
                  <div className="step-details">
                    <button
                      className={`step-complete-btn ${isCompleted ? 'undo' : ''}`}
                      onClick={() => toggleComplete(index)}
                    >
                      {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="step-wizard-nav">
        <button
          className="step-nav-btn"
          onClick={goToPrev}
          disabled={currentStep === 0}
        >
          ← Previous
        </button>
        <button
          className="step-nav-btn primary"
          onClick={goToNext}
          disabled={currentStep === totalSteps - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default StepWizard;
