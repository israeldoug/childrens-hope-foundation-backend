document.addEventListener('DOMContentLoaded', function () {
    // --- Custom Dropdown Logic ---
    const customSelect = document.getElementById('customGoalSelect');
    const goalTrigger = document.getElementById('goalTrigger');
    const goalOptions = document.getElementById('goalOptions');
    const goalInput = document.getElementById('goal');
    const triggerText = goalTrigger?.querySelector('.custom-select__text');

    if (goalTrigger && goalOptions && customSelect) {
        // Toggle dropdown
        goalTrigger.addEventListener('click', () => {
            customSelect.classList.toggle('open');
            goalTrigger.setAttribute('aria-expanded', customSelect.classList.contains('open'));
        });

        // Option selection
        goalOptions.querySelectorAll('.custom-select__option').forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const text = option.textContent;
                goalInput.value = value;
                triggerText.textContent = text;
                // Update selected class
                goalOptions.querySelectorAll('.custom-select__option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                // Close dropdown
                customSelect.classList.remove('open');
                goalTrigger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
                goalTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Pre-select goal if passed in URL
    const urlParams = new URLSearchParams(window.location.search);
    const goal = urlParams.get('goal');
    if (goal && goalOptions) {
        const matchingOption = goalOptions.querySelector(`[data-value="${goal}"]`);
        if (matchingOption) {
            goalInput.value = goal;
            triggerText.textContent = matchingOption.textContent;
            goalOptions.querySelectorAll('.custom-select__option').forEach(o => o.classList.remove('selected'));
            matchingOption.classList.add('selected');
        }
    }

    // Handle amount button selection
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');

    amountBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            amountBtns.forEach(b => {
                b.classList.remove('selected');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('selected');
            this.setAttribute('aria-pressed', 'true');
            if (this.dataset.amount === "0") {
                customAmountInput.style.display = "block";
                customAmountInput.value = "";
                customAmountInput.focus();
            } else {
                customAmountInput.style.display = "none";
                customAmountInput.value = this.dataset.amount;
            }
        });
    });

    // Handle form submission
    const form = document.getElementById('donateForm');
    const bankDetails = document.querySelector('.bank-details');
    const step1Container = document.querySelector('.donate-step-1');
    const submitBtn = document.querySelector('.bank-details .submit-btn');
    const backBtn = document.querySelector('.back-step-btn');

    // Set up back button handler once (outside submit handler to avoid duplication)
    if (backBtn && bankDetails && step1Container) {
        backBtn.addEventListener('click', function () {
            bankDetails.style.display = 'none';
            step1Container.style.display = 'block';

            const container = document.querySelector('.donate-container');
            if (container) {
                container.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Set up transfer confirmation handler once
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            const amount = customAmountInput.style.display === "block"
                ? customAmountInput.value
                : document.querySelector('.amount-btn.selected')?.dataset.amount;

            const emailInput = document.getElementById('donorEmail');
            const email = emailInput ? emailInput.value : '';

            const donationData = {
                amount: amount,
                email: email,
                goal: document.getElementById('goal').value,
                timestamp: new Date().toISOString()
            };

            // Store to localstorage for thank you page
            localStorage.setItem('pendingDonation', JSON.stringify(donationData));

            // Send to backend
            fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donationData)
            }).then(response => {
                window.location.href = 'thank_you.html';
            }).catch(err => {
                console.error('Error saving donation:', err);
                window.location.href = 'thank_you.html';
            });
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const amount = customAmountInput.style.display === "block"
                ? customAmountInput.value
                : document.querySelector('.amount-btn.selected')?.dataset.amount;

            // Validate amount
            if (!amount || isNaN(amount) || Number(amount) < 100) {
                showNotification("Please enter a valid donation amount (minimum ₦100).", "error");
                return false;
            }

            const emailInput = document.getElementById('donorEmail');
            const email = emailInput ? emailInput.value : '';

            if (!email) {
                showNotification("Please enter your email address.", "error");
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification("Please enter a valid email address.", "error");
                return false;
            }

            // Show bank details and hide step 1
            if (bankDetails && step1Container) {
                bankDetails.style.display = 'block';
                step1Container.style.display = 'none';
            }
        });
    }
});