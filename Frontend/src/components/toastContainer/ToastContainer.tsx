import { createPortal } from 'react-dom';

const ToastContainer = () => {
  return createPortal(
    <div id="toast-container"></div>,
    document.body
  );
};

export default ToastContainer;