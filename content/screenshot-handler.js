/**
 * DevMentor AI - Screenshot Handler
 * Handles user-provided image files for multimodal analysis
 */

class ScreenshotHandler {
  async captureScreenshot () {
    // Expect UIManager to have injected a hidden file input
    const input = document.getElementById('devmentorFileInput');
    if (!input) throw new Error('File input not available');

    const file = await this.waitForFileSelection(input);

    const validation = window.DevMentorHelpers?.validateImageFile(file);
    if (!validation?.isValid) {
      throw new Error(validation?.error || 'Invalid image file');
    }

    const base64 = await window.DevMentorHelpers.fileToBase64(file);

    return {
      base64Image: base64,
      mediaType: file.type,
      size: file.size,
      name: file.name
    };
  }

  waitForFileSelection (inputEl) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        inputEl.value = '';
        inputEl.removeEventListener('change', onChange);
      };

      const onChange = () => {
        const file = inputEl.files && inputEl.files[0];
        cleanup();
        if (file) resolve(file);
        else reject(new Error('No file selected'));
      };

      inputEl.addEventListener('change', onChange, { once: true });
      inputEl.click();
    });
  }
}

window.ScreenshotHandler = ScreenshotHandler;
