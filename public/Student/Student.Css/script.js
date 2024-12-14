const notificationBox = document.querySelector('.scroll-text');

// Change text
notificationBox.textContent = "New scrolling text here!";

// Restart animation (if needed)
notificationBox.style.animation = 'none';
notificationBox.offsetHeight; // Trigger a reflow, flushing the CSS changes
notificationBox.style.animation = null;
