type TransitionAction = "in" | "out";
type TransitionListener = (action: TransitionAction, callback?: () => void) => void;

let transitionListener: TransitionListener | null = null;

export const transitionStore = {
  setListener: (fn: TransitionListener) => {
    transitionListener = fn;
  },
  
  removeListener: () => {
    transitionListener = null;
  },

  /**
   * Drops the curtain to obscure the viewport, then executes the callback (e.g. routing).
   */
  animateIn: (callback?: () => void) => {
    if (transitionListener) {
      transitionListener("in", callback);
    } else if (callback) {
      callback();
    }
  },

  /**
   * Lifts the curtain to reveal the viewport.
   */
  animateOut: () => {
    if (transitionListener) {
      transitionListener("out");
    }
  }
};
