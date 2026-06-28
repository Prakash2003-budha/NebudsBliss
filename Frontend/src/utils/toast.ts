type ToastType = 'success' | 'error' | 'warning' | 'info';

const icons: Record<ToastType, string> = {
  success: 'ti-circle-check',
  error:   'ti-circle-x',
  warning: 'ti-alert-triangle',
  info:    'ti-info-circle',
};

export function removeToast(toast: HTMLElement): void {
  if (!toast || toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 250);
}

export function showToast(
  type: ToastType,
  title: string,
  message: string,
  duration: number = 4000
): void {
    console.log('showToast called:', type, title); // ADD THIS

 const render = () => {
  const container = document.getElementById('toast-container');
  console.log('Toast container found?', container); 
  if (!container) {
    setTimeout(render, 50);
    return;
  }
   console.log('creating toast element'); // ADD THIS
    const toast = document.createElement('div');
    toast.className = `nb-toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon"><i class="ti ${icons[type]}"></i></div>
      <div class="toast-body">
        <p class="toast-title">${title}</p>
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close">✕</button>
      <div class="toast-progress" style="animation-duration:${duration}ms"></div>
    `;

    toast.querySelector<HTMLButtonElement>('.toast-close')
      ?.addEventListener('click', () => removeToast(toast));

    container.prepend(toast);
    setTimeout(() => removeToast(toast), duration);
  };

  render();

}