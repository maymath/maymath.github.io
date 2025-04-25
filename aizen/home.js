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

  // Initialize preview toggles for Discord Bot and Video Game cards
  initializeProjectPreviews();

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

  // Function to initialize Discord Bot and Video Game previews
  function initializeProjectPreviews() {
    // Initialize Discord Bot preview
    const discordBotCard = document.getElementById("discord-bot-card");
    if (discordBotCard) {
      // Get elements
      const cardImage = discordBotCard.querySelector(".card-image");
      const previewImg = cardImage.querySelector(".preview-img");
      const expandedContent = discordBotCard.querySelector(".expanded-content");

      // Create a preview container
      const previewContainer = document.createElement("div");
      previewContainer.className = "preview-container";

      // Clone the important parts of expanded content for preview
      const botProfile = expandedContent
        .querySelector(".bot-profile")
        .cloneNode(true);
      const botDetails = document.createElement("div");
      botDetails.className = "preview-details";

      // Add some key information
      const aboutSection = expandedContent.querySelector(
        ".detail-section:first-child p"
      ).textContent;
      const aboutPreview = document.createElement("p");
      aboutPreview.className = "preview-about";
      aboutPreview.textContent =
        aboutSection.length > 120
          ? aboutSection.substring(0, 120) + "..."
          : aboutSection;

      // Create a "View Full Details" note
      const viewFullNote = document.createElement("p");
      viewFullNote.className = "view-full-note";
      viewFullNote.innerHTML =
        "Click <strong>View Project</strong> to see all details";

      // Add elements to preview container
      botDetails.appendChild(aboutPreview);
      botDetails.appendChild(viewFullNote);
      previewContainer.appendChild(botProfile);
      previewContainer.appendChild(botDetails);

      // Replace the preview image with our custom preview
      previewImg.style.display = "none";
      cardImage.appendChild(previewContainer);
    }

    // Initialize Video Game preview
    const videoGameCard = document.getElementById("video-game-card");
    if (videoGameCard) {
      // Get elements
      const cardImage = videoGameCard.querySelector(".card-image");
      const previewImg = cardImage.querySelector(".preview-img");
      const expandedContent = videoGameCard.querySelector(".expanded-content");

      // Create a preview container
      const previewContainer = document.createElement("div");
      previewContainer.className = "preview-container game-preview-container";

      // Clone the game header for preview
      const gameHeader = expandedContent
        .querySelector(".game-header")
        .cloneNode(true);

      // Create preview details
      const gameDetails = document.createElement("div");
      gameDetails.className = "preview-details";

      // Add a progress indicator
      const progressIndicator = document.createElement("div");
      progressIndicator.className = "preview-progress";
      const progressBar = expandedContent
        .querySelector(".progress")
        .cloneNode(true);
      const progressText = expandedContent
        .querySelector(".progress-text")
        .cloneNode(true);
      progressIndicator.appendChild(progressBar);
      progressIndicator.appendChild(progressText);

      // Create a "View Full Details" note
      const viewFullNote = document.createElement("p");
      viewFullNote.className = "view-full-note";
      viewFullNote.innerHTML =
        "Click <strong>View Progress</strong> to see all details";

      // Add elements to preview container
      gameDetails.appendChild(progressIndicator);
      gameDetails.appendChild(viewFullNote);
      previewContainer.appendChild(gameHeader);
      previewContainer.appendChild(gameDetails);

      // Replace the preview image with our custom preview
      previewImg.style.display = "none";
      cardImage.appendChild(previewContainer);
    }
  }

  // Initialize Intersection Observer for card fade-in animation
  const cards = document.querySelectorAll(".card");

  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: "0px",
    threshold: 0.1, // Trigger when 10% of the card is visible
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Stop observing once visible
      }
    });
  };

  const cardObserver = new IntersectionObserver(
    observerCallback,
    observerOptions
  );

  cards.forEach((card) => {
    cardObserver.observe(card);

    // Add event listeners for card tilt effect
    card.addEventListener("mousemove", handleCardMouseMove);
    card.addEventListener("mouseleave", handleCardMouseLeave);
  });

  // Function to handle card mouse move for tilt effect
  function handleCardMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X relative to card
    const y = e.clientY - rect.top;  // Mouse Y relative to card

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = x - centerX;
    const deltaY = y - centerY;

    // Adjust sensitivity/max tilt here
    const maxTilt = 10; // degrees
    const rotateY = (deltaX / centerX) * maxTilt;
    const rotateX = (-deltaY / centerY) * maxTilt;

    // Get the current Y translation from the fade-in effect if card is visible
    const currentTransform = window.getComputedStyle(card).transform;
    let translateY = "translateY(0px)"; // Default if not visible or no transform
    if (currentTransform !== 'none') {
        const matrix = new DOMMatrix(currentTransform);
        translateY = `translateY(${matrix.m42}px)`;
    }

    // Apply transform with tilt, existing translate, and scale
    card.style.transition = 'transform 0.05s linear'; // Faster transition during hover
    card.style.transform = `${translateY} scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  // Function to handle card mouse leave to reset tilt
  function handleCardMouseLeave(e) {
    const card = e.currentTarget;
    // Reset transition and transform to the visible state
    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, opacity 0.4s ease, width 0.5s ease, height 0.5s ease';

    // Determine the base transform (only translateY if visible)
    let baseTransform = 'translateY(20px)'; // Initial before visible
    if (card.classList.contains('is-visible')) {
        baseTransform = 'translateY(0px)';
    }
    card.style.transform = baseTransform;
  }

  // ---- New Flow Field Background Effect ----
  // Removed code - Now lives in aizen/flowfield.js
  // ---- End Flow Field Background Effect ----

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
      { passive: true }
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

  // Initialize the water effect background (after other setup)
  if (typeof initializeWaterEffect === 'function') {
      initializeWaterEffect();
  } else {
      console.error('initializeWaterEffect function not found. Make sure flowfield.js is loaded.');
  }

  // Initialize the flow field effect background (after other setup)
  if (typeof initializeFlowFieldEffect === 'function') {
      initializeFlowFieldEffect();
  } else {
      console.error('initializeFlowFieldEffect function not found. Make sure flowfield.js is loaded.');
  }

  // Initialize particle background after other setup
  console.log("Attempting to initialize background effect...");
  // Wait a short moment for the canvas element to be definitely ready
  setTimeout(() => {
      if (typeof initializeExtremeWebGLConstellation === 'function') {
          initializeExtremeWebGLConstellation();
      } else {
          console.error("Background effect function (initializeExtremeWebGLConstellation) not found. Ensure flowfield.js is loaded correctly.");
          const canvasElement = document.getElementById('particle-canvas');
          if (canvasElement) canvasElement.style.display = 'none'; // Hide canvas if effect fails
      }
  }, 100); // 100ms delay
});
