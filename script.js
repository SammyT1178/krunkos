document.addEventListener("DOMContentLoaded", function () {
    var audio = document.getElementById("backgroundMusic");
    audio.volume = 0.1; // Lower volume
    
    document.body.addEventListener('click', function() {
        if (audio.paused) {
            audio.play().catch((error) => {
                console.log('Audio playback error:', error);
            });
        }
    });
    
    

    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('passwordInput');
    const logContent = document.getElementById('logContent');

    passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const password = passwordInput.value.trim();
        const logsUrl = 'logs/' + password + '.txt'; // Adjusted path to logs

        try {
            const response = await fetch(logsUrl);
            if (response.ok) {
                const text = await response.text();
                logContent.style.display = 'block';
                logContent.textContent = text;
            } else {
                logContent.style.display = 'block';
                logContent.textContent = 'Logs not found';
                setTimeout(() => logContent.style.display = 'none', 3000); // Hide message after 3 seconds
            }
        } catch (error) {
            console.error('Error fetching the log:', error);
            alert("Error fetching the log");
            setTimeout(() => logContent.style.display = 'none', 3000); // Hide message after 3 seconds
        }
    });
});
