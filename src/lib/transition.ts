type TransitionCallback = () => void;
type TransitionHandler = (onCovered: TransitionCallback) => void;

let transitionHandler: TransitionHandler | null = null;

export const transitionStore = {
  setHandler: (handler: TransitionHandler) => {
    transitionHandler = handler;
  },

  removeHandler: () => {
    transitionHandler = null;
  },

  /**
   * Triggers the full-page transition curtain to cover the screen,
   * executes the onCovered callback (e.g. router.push), and then reveals the new page.
   */
  startTransition: (onCovered: TransitionCallback) => {
    if (transitionHandler) {
      transitionHandler(onCovered);
    } else {
      onCovered();
    }
  },
};
