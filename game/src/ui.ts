/** Small DOM pieces that sit over the canvas: the share button and a toast. */
const shareBtn = document.getElementById('share') as HTMLButtonElement;
const toastEl = document.getElementById('toast') as HTMLDivElement;
let toastTimer = 0;

export function toast(text: string, ms = 2600): void {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), ms);
}

export function showShare(visible: boolean, onClick?: () => void): void {
  shareBtn.style.display = visible ? 'block' : 'none';
  shareBtn.onclick = visible && onClick ? onClick : null;
}

shareBtn.addEventListener('pointerdown', (e) => e.stopPropagation());

/** Native share sheet on phones, clipboard elsewhere, prompt as a last resort. */
export async function shareLink(title: string, text: string, url: string): Promise<'native' | 'clipboard' | 'prompt' | 'cancelled'> {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (coarse && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'native';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast('Challenge link copied');
    return 'clipboard';
  } catch {
    window.prompt('Copy this challenge link:', url);
    return 'prompt';
  }
}
