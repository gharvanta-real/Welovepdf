export type ToastType = 'success' | 'info' | 'error' | 'warning';
type Listener = (message: string, type: ToastType) => void;

const listeners = new Set<Listener>();

export const toast = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  show(message: string, type: ToastType = 'success') {
    listeners.forEach(l => {
      try {
        l(message, type);
      } catch (err) {
        console.error(err);
      }
    });
  },
  success(message: string) {
    this.show(message, 'success');
  },
  error(message: string) {
    this.show(message, 'error');
  },
  info(message: string) {
    this.show(message, 'info');
  },
  warning(message: string) {
    this.show(message, 'warning');
  }
};
