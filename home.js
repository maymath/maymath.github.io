document.addEventListener("DOMContentLoaded", function () {
  // Theme toggling functionality
  const body = document.body;
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  // Check if user has saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.classList.add(savedTheme);
    if (savedTheme === "dark-mode") {
      themeToggleBtn.classList.add("dark-active");
    }
  }

  // Toggle theme when button is clicked
  themeToggleBtn.addEventListener("click", function () {
    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      themeToggleBtn.classList.remove("dark-active");
      localStorage.setItem("theme", "light-mode");
    } else {
      body.classList.add("dark-mode");
      themeToggleBtn.classList.add("dark-active");
      localStorage.setItem("theme", "dark-mode");
    }
  });

  // Project card expansion functionality
  const expandButtons = document.querySelectorAll(".expand-btn");
  const closeButtons = document.querySelectorAll(".close-btn");

  expandButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = this.closest(".card");
      card.classList.add("expanded");
      document.body.style.overflow = "hidden"; // Prevent scrolling when expanded

      // Add overlay to prevent clicking other elements when a card is expanded
      if (!document.querySelector(".modal-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        document.body.appendChild(overlay);
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = this.closest(".card");
      card.classList.remove("expanded");
      document.body.style.overflow = ""; // Restore scrolling

      // Remove overlay when card is closed
      const overlay = document.querySelector(".modal-overlay");
      if (overlay) {
        overlay.remove();
      }
    });
  });

  // Close expanded card when ESC key is pressed
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const expandedCard = document.querySelector(".card.expanded");
      if (expandedCard) {
        expandedCard.classList.remove("expanded");
        document.body.style.overflow = ""; // Restore scrolling

        // Remove overlay when card is closed
        const overlay = document.querySelector(".modal-overlay");
        if (overlay) {
          overlay.remove();
        }
      }
    }
  });

  // Enhanced live website preview for portfolio card
  const portfolioCard = document.getElementById("portfolio-card");
  if (portfolioCard) {
    const previewOverlay = portfolioCard.querySelector(".preview-overlay");
    const cardImage = portfolioCard.querySelector(".card-image");
    const browserContent = portfolioCard.querySelector(".browser-content");

    // Update the portfolio link to the actual site
    const portfolioLink = portfolioCard.querySelector(".card-link");
    if (portfolioLink) {
      portfolioLink.href = "https://AizenKai1001.github.io";
    }

    if (previewOverlay) {
      previewOverlay.addEventListener("click", function () {
        const placeholder = this.closest(".iframe-placeholder");
        placeholder.style.display = "none";

        // Enhance the iframe container for full-site preview
        cardImage.classList.add("full-preview-mode");
        browserContent.classList.add("full-preview-mode");

        // Create fullscreen toggle button
        const fullscreenToggle = document.createElement("button");
        fullscreenToggle.className = "preview-control-btn";
        fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenToggle.title = "Toggle fullscreen preview";
        browserContent.appendChild(fullscreenToggle);

        // Add close preview button
        const closePreviewBtn = document.createElement("button");
        closePreviewBtn.className = "preview-control-btn preview-close-btn";
        closePreviewBtn.innerHTML = '<i class="fas fa-times"></i>';
        closePreviewBtn.title = "Close preview";
        browserContent.appendChild(closePreviewBtn);

        // Load the actual website in the iframe - directly open the site in the iframe
        // This avoids cross-origin issues by opening the site directly
        const iframe = document.getElementById("site-preview");
        iframe.src = "https://AizenKai1001.github.io";

        // Fullscreen toggle functionality
        fullscreenToggle.addEventListener("click", function () {
          portfolioCard.classList.toggle("fullscreen-preview");

          if (portfolioCard.classList.contains("fullscreen-preview")) {
            this.innerHTML = '<i class="fas fa-compress"></i>';
            this.title = "Exit fullscreen";
          } else {
            this.innerHTML = '<i class="fas fa-expand"></i>';
            this.title = "Enter fullscreen";
          }
        });

        // Close preview functionality
        closePreviewBtn.addEventListener("click", function () {
          // Reset everything
          placeholder.style.display = "block";
          cardImage.classList.remove("full-preview-mode");
          browserContent.classList.remove("full-preview-mode");
          portfolioCard.classList.remove("fullscreen-preview");
          iframe.src = "about:blank";

          // Remove control buttons
          const controlButtons = browserContent.querySelectorAll(
            ".preview-control-btn"
          );
          controlButtons.forEach((btn) => btn.remove());
        });
      });
    }
  }

  // Initialize touch swipe detection for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const expandedContents = document.querySelectorAll(".expanded-content");

  expandedContents.forEach((content) => {
    // Touch start event
    content.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      false
    );

    // Touch end event
    content.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      false
    );
  });

  // Handle swipe gesture
  function handleSwipe() {
    const SWIPE_THRESHOLD = 100; // Minimum distance required for a swipe

    if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
      // Swiped left - close card on mobile
      const expandedCard = document.querySelector(".card.expanded");
      if (expandedCard) {
        expandedCard.classList.remove("expanded");
        document.body.style.overflow = ""; // Restore scrolling

        // Remove overlay
        const overlay = document.querySelector(".modal-overlay");
        if (overlay) {
          overlay.remove();
        }
      }
    }
  }
});
