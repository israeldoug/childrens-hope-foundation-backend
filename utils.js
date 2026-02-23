/**
 * Custom Toast Notification System
 * Replaces standard browser alerts with a sliding toast UI.
 */
function showNotification(message, type = 'success') {
    // Determine the color based on type
    const bgColor = type === 'error' ? '#e74c3c' : '#2ecc71';
    const icon = type === 'error' ? '<i class="fa-solid fa-triangle-exclamation"></i> ' : '<i class="fa-solid fa-circle-check"></i> ';
    // Create the toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '30px';
        toastContainer.style.left = '50%';
        toastContainer.style.transform = 'translateX(-50%)';
        toastContainer.style.zIndex = '99999';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '15px';
        toastContainer.style.pointerEvents = 'none'; // so clicks pass through if empty
        toastContainer.style.width = '90%';
        toastContainer.style.maxWidth = '450px';
        document.body.appendChild(toastContainer);
    }

    // Create the toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.backgroundColor = bgColor;
    toast.style.color = 'white';
    toast.style.padding = '20px 30px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    toast.style.fontFamily = "'Poppins', sans-serif";
    toast.style.fontWeight = '600';
    toast.style.fontSize = '1.1rem';
    toast.style.textAlign = 'center';
    toast.style.transform = 'translateY(-100%) scale(0.9)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    toast.style.pointerEvents = 'auto'; // allow clicking on the toast itself if needed
    toast.innerHTML = icon + message;

    // Append and trigger animation
    toastContainer.appendChild(toast);

    // Trigger reflow to apply initial styles before animating
    toast.offsetHeight;

    // Slide in
    toast.style.transform = 'translateY(0) scale(1)';
    toast.style.opacity = '1';

    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(-100%) scale(0.9)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 500); // wait for exit animation
    }, 4000);
}

// Make it globally available
window.showNotification = showNotification;
