document.addEventListener('DOMContentLoaded', function() {
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const extractBtn = document.getElementById('extractBtn');
    const loadingDiv = document.getElementById('loading');
    const outputDiv = document.getElementById('codeOutput');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorDiv = document.getElementById('error');

    extractBtn.addEventListener('click', async function() {
        const url = youtubeUrlInput.value.trim();
        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }

        // Validate YouTube URL
        if (!isValidYouTubeUrl(url)) {
            showError('Please enter a valid YouTube URL');
            return;
        }

        // Show loading state
        loadingDiv.style.display = 'block';
        outputDiv.textContent = '';
        downloadBtn.style.display = 'none';
        errorDiv.style.display = 'none';

        try {
            // Call the API endpoint
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract code');
            }

            // Display the extracted code
            outputDiv.textContent = data.code || 'No code extracted';
            downloadBtn.style.display = 'inline-block';
            downloadBtn.onclick = function() {
                downloadCode(data.code, data.filename || 'extracted_code.txt');
            };

        } catch (error) {
            showError(error.message);
        } finally {
            loadingDiv.style.display = 'none';
        }
    });

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    }

    function downloadCode(code, filename) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Allow enter key to trigger extraction
    youtubeUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            extractBtn.click();
        }
    });
});