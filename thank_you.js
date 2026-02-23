document.addEventListener('DOMContentLoaded', function () {

    // Retrieve donation data from localStorage

    // Enhanced animation for thank you message
    const thankYouTitle = document.querySelector('.animate-text');
    if (thankYouTitle) {
        // Find the sparkle-text element
        const sparkleText = thankYouTitle.querySelector('.sparkle-text');
        const sparkleHTML = sparkleText.outerHTML; // Keep the original sparkle span with its content

        // Get the text content of the h1, excluding the sparkle text
        const textContent = thankYouTitle.textContent.replace(sparkleText.textContent, 'SPLIT');
        const [part1, part2] = textContent.split('SPLIT');

        // Animate the first part of the text
        const animatedPart1 = part1.split('').map(letter => `<span class="letter">${letter}</span>`).join('');

        // Reconstruct the HTML
        thankYouTitle.innerHTML = animatedPart1 + sparkleHTML;

        // Apply animation delays to the letters
        const letters = thankYouTitle.querySelectorAll('.letter');
        letters.forEach((letter, index) => {
            letter.style.animationDelay = `${index * 0.05}s`; // Using a slightly faster delay
        });
    }

    // Heart animation is handled purely by CSS (heartBeat only)

    // Enhanced confirmation details animation
    const listItems = document.querySelectorAll('.confirmation-details li');
    listItems.forEach((item, index) => {
        // Add initial state
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';

        // Trigger animation with delay based on index
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 500 + (index * 200));

        // Enhanced hover effect
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateX(10px)';
            this.style.color = '#28a745';
        });

        item.addEventListener('mouseleave', function () {
            this.style.transform = 'translateX(0)';
            this.style.color = '#2c3e50';
        });
    });

    // Add success message with donation amount
    const donationData = JSON.parse(localStorage.getItem('pendingDonation'));
    if (donationData) {
        const amount = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(donationData.amount);

        const messageBox = document.querySelector('.message-box');
        if (messageBox) {
            const amountDisplay = document.createElement('div');
            amountDisplay.className = 'donation-amount';
            amountDisplay.innerHTML = `
                <span class="amount-label">Your Donation:</span>
                <span class="amount-value sparkle-text">${amount}</span>
            `;
            messageBox.appendChild(amountDisplay);

            // Animate the amount number counting up
            const amountValue = amountDisplay.querySelector('.amount-value');
            const finalAmount = parseFloat(donationData.amount);
            let currentAmount = 0;
            const duration = 1500; // 1.5 seconds
            const stepTime = 20; // Update every 20ms
            const steps = duration / stepTime;
            const increment = finalAmount / steps;

            const counter = setInterval(() => {
                currentAmount += increment;
                if (currentAmount >= finalAmount) {
                    currentAmount = finalAmount;
                    clearInterval(counter);
                }
                amountValue.textContent = new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                }).format(currentAmount);
            }, stepTime);
        }
    }

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.primary-button, .secondary-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 5px 15px rgba(40, 167, 69, 0.2)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });

        button.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Add background particles animation
    const container = document.createElement('div');
    container.className = 'background-particles';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${5 + Math.random() * 10}s`;
        container.appendChild(particle);
    }



    // --- Share Modal Functionality ---

    // Get all the necessary elements from the HTML
    const openModalBtn = document.getElementById('open-share-modal');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const shareModal = document.getElementById('share-modal');
    const copyLinkBtn = document.getElementById('copy-link-btn');

    let escHandler = null;

    // Function to open the modal
    function openModal() {
        shareModal.classList.add('active'); // Makes the modal visible
        document.body.classList.add('modal-open'); // Prevents background scroll

        // Focus management
        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }

        // Accessibility: Handle Escape key
        escHandler = function (e) {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', escHandler);
    }

    // Function to close the modal
    function closeModal() {
        shareModal.classList.remove('active'); // Hides the modal
        document.body.classList.remove('modal-open'); // Re-enables background scroll

        // Cleanup listener
        if (escHandler) {
            document.removeEventListener('keydown', escHandler);
            escHandler = null;
        }

        // Return focus
        if (openModalBtn) openModalBtn.focus();
    }

    // Add event listeners
    if (openModalBtn && shareModal) {
        openModalBtn.addEventListener('click', function (e) {
            e.preventDefault(); // Prevents the link from jumping to #share
            openModal();
        });

        closeModalBtn.addEventListener('click', closeModal);

        // Also close the modal if the user clicks on the dark overlay
        shareModal.addEventListener('click', function (e) {
            if (e.target === shareModal) {
                closeModal();
            }
        });
    }

    // --- Social Share Link Logic ---
    const pageUrl = window.location.origin; // Gets the base URL (e.g., "https://yourwebsite.com")
    const shareText = "I just supported Children's Hope Foundation! Join me in making a difference for children in need.";

    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedText = encodeURIComponent(shareText);

    // Set the href attributes for the share links
    document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    document.getElementById('share-x').href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    document.getElementById('share-whatsapp').href = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;

    // --- Copy Link Functionality ---
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(pageUrl).then(function () {
                // Provide user feedback that the link was copied
                const originalText = copyLinkBtn.textContent;
                copyLinkBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyLinkBtn.textContent = originalText;
                }, 2000); // Revert back to original text after 2 seconds
            }, function (err) {
                console.error('Could not copy text: ', err);
            });
        });
    }
});