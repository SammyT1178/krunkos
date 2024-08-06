document.addEventListener('DOMContentLoaded', function () {
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.volume = 0.1;

    document.body.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        }
    });

    document.getElementById('passwordForm').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the form from submitting the traditional way

        const password = document.getElementById('passwordInput').value;
        if (password) {
            fetchLog(password);
            document.getElementById('passwordInput').value = ''; // Clear the input
        }
    });
});

function fetchLog(password) {
    fetch(`/logs/${password}.txt`)
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Log not found');
            }
        })
        .then(data => {
            const logContent = document.getElementById('logContent');
            logContent.textContent = data;
            logContent.style.display = 'block'; // Show the log content
            logContent.style.opacity = 1; // Ensure full opacity when showing
        })
        .catch(error => {
            const logContent = document.getElementById('logContent');
            logContent.textContent = error.message;
            logContent.style.display = 'block'; // Show the log content
            logContent.style.opacity = 1; // Ensure full opacity when showing

            setTimeout(() => {
                logContent.style.opacity = 0; // Fade out the log content
                setTimeout(() => {
                    logContent.style.display = 'none'; // Hide the element after fading out
                }, 3000); // Match the fade-out duration
            }, 3000); // Time before starting fade-out
        });
}
