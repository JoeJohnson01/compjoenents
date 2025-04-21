// Component transitions handler
// Manages smooth animations between component views

// Function to calculate the grid item width based on the current viewport
function getGridItemWidth() {
  // Get the grid container
  const gridContainer = document.querySelector(".grid");
  if (!gridContainer) return null;

  // Get the computed style of the grid container
  const containerStyle = window.getComputedStyle(gridContainer);
  const containerWidth = parseFloat(containerStyle.width);
  const gap =
    parseFloat(containerStyle.gap) ||
    parseFloat(containerStyle.columnGap) ||
    24; // Default gap of 6 (1.5rem)

  // Determine the number of columns based on viewport width
  let columns = 1;
  const viewportWidth = window.innerWidth;

  if (viewportWidth >= 1280) {
    // xl breakpoint
    columns = 3;
  } else if (viewportWidth >= 640) {
    // sm breakpoint
    columns = 2;
  }

  // Calculate the width of each grid item
  const itemWidth = (containerWidth - gap * (columns - 1)) / columns;

  // Apply a small adjustment to account for any padding or borders
  return Math.floor(itemWidth) - 2; // Subtract 2px for borders
}

// Function to handle the FLIP animation
function setupComponentTransitions() {
  // Handle fade-out before navigation starts
  document.addEventListener("astro:before-preparation", () => {
    // Store the current page type for the transition
    const currentIsDetailPage =
      window.location.pathname.includes("/components/");
    sessionStorage.setItem("was-detail-page", currentIsDetailPage.toString());

    // Check if we're navigating to a different page type
    const navigatingToDetailPage = document.activeElement
      ?.closest("a")
      ?.href?.includes("/components/");

    // If we're navigating from index to detail, fade out other components
    if (!currentIsDetailPage && navigatingToDetailPage) {
      // Get the clicked component's ID
      const clickedLink = document.activeElement?.closest("a");
      const clickedCard = clickedLink?.querySelector('[id^="card-"]');
      const clickedCardId = clickedCard?.id;

      // Fade out all other cards
      if (clickedCardId) {
        document.querySelectorAll('[id^="card-"]').forEach((card) => {
          if (card.id !== clickedCardId) {
            // Apply immediate opacity change to ensure it's visible during the transition
            card.style.transition = "opacity 300ms ease-out";
            card.style.opacity = "0";
          }
        });
      }
    }
  });

  // Store positions before navigation
  document.addEventListener("astro:before-swap", () => {
    // Store positions of all cards
    document.querySelectorAll('[id^="card-"]').forEach((card) => {
      if (!card) return;
      const id = card.id;
      const rect = card.getBoundingClientRect();
      sessionStorage.setItem(
        `${id}-start`,
        JSON.stringify({
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
          isPreview: card.getAttribute("data-is-preview") === "true",
        })
      );
    });
  });

  // Animate after navigation
  document.addEventListener("astro:after-swap", () => {
    // Get the previous page type
    const wasDetailPage = sessionStorage.getItem("was-detail-page") === "true";
    // Get the current page type
    const isDetailPage = window.location.pathname.includes("/components/");

    // Handle fade-in effects for components when going from detail to index
    if (wasDetailPage && !isDetailPage) {
      // Get all cards
      const allCards = document.querySelectorAll('[id^="card-"]');

      // Get all cards except the one that's being animated with FLIP
      // First, find the card that has stored position data
      const transitioningCardIds = [];
      Object.keys(sessionStorage).forEach((key) => {
        if (key.endsWith("-start")) {
          const cardId = key.replace("-start", "");
          if (cardId.startsWith("card-")) {
            transitioningCardIds.push(cardId);
          }
        }
      });

      allCards.forEach((card) => {
        // Skip the card that's being animated with FLIP
        if (!transitioningCardIds.includes(card.id)) {
          // Start with opacity 0
          card.style.opacity = "0";

          // Fade in with a slight delay to let the main card animation start
          // We'll use a longer delay to ensure the main component has time to move into position
          setTimeout(() => {
            card
              .animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 300,
                delay: 150, // Delay to let the main animation get going
                easing: "ease-in-out",
                fill: "forwards",
              })
              .finished.then(() => {
                card.style.opacity = "";
              });
          }, 100);
        }
      });
    }

    // Process FLIP animations for cards with stored positions
    document.querySelectorAll('[id^="card-"]').forEach((card) => {
      if (!card) return;

      const id = card.id;
      const startData = sessionStorage.getItem(`${id}-start`);
      if (!startData) return;

      const start = JSON.parse(startData);
      const end = card.getBoundingClientRect();
      const isPreview = card.getAttribute("data-is-preview") === "true";
      const wasPreview = start.isPreview;

      // Calculate the transform
      const dx = start.x - end.x;
      const dy = start.y - end.y;

      // Set initial position
      card.style.transformOrigin = "top left";
      card.style.transform = `translate(${dx}px, ${dy}px)`;

      // Force a reflow to ensure the initial position is applied
      card.offsetHeight;

      // Ensure no color transitions
      card.style.transition = "none";
      card.style.webkitTransition = "none";
      card.style.mozTransition = "none";

      // Set a high z-index during animation to ensure it stays on top
      // This is especially important when going from detail to grid view
      card.style.zIndex = wasPreview ? "1000" : "1";

      // For components transitioning from detail to grid, also set position to relative
      // This helps ensure it stays above other components in the grid
      if (wasPreview && !isPreview) {
        card.style.position = "relative";
      }

      // Different animation based on direction
      if (wasPreview && !isPreview) {
        // Going from detail to grid
        card.style.width = `${start.w}px`;
        card.style.height = `${start.h}px`;

        // Calculate the target width based on the grid layout
        const gridItemWidth = getGridItemWidth();
        console.log("Target grid width:", gridItemWidth);

        // Force the card to be positioned correctly
        setTimeout(() => {
          // Animate position and size with ease-in-out
          card
            .animate(
              [
                {
                  transform: `translate(${dx}px, ${dy}px)`,
                  width: `${start.w}px`,
                  height: `${start.h}px`,
                },
                {
                  transform: "translate(0, 0)",
                  width: gridItemWidth ? `${gridItemWidth}px` : "100%",
                  height: "auto",
                },
              ],
              {
                duration: 400,
                easing: "ease-in-out",
                fill: "both",
                composite: "replace",
              }
            )
            .finished.then(() => {
              // Clean up
              card.style.transform = "";
              card.style.width = "";
              card.style.height = "";
              card.style.zIndex = "";
              card.style.position = "";
              // Force a reflow to ensure the browser recalculates the layout
              card.offsetHeight;
              sessionStorage.removeItem(`${id}-start`);
            });
        }, 10);
      } else if (!wasPreview && isPreview) {
        // Going from grid to detail
        card.style.width = `${start.w}px`;
        card.style.height = `${start.h}px`;

        // Simple position and size animation with ease-in-out
        card
          .animate(
            [
              {
                transform: `translate(${dx}px, ${dy}px)`,
                width: `${start.w}px`,
                height: `${start.h}px`,
              },
              {
                transform: "translate(0, 0)",
                width: "100%",
                height: "auto",
              },
            ],
            {
              duration: 400,
              easing: "ease-in-out",
              fill: "both",
              composite: "replace",
            }
          )
          .finished.then(() => {
            // Clean up
            card.style.transform = "";
            card.style.width = "";
            card.style.height = "";
            card.style.zIndex = "";
            card.style.position = "";
            // Force a reflow to ensure the browser recalculates the layout
            card.offsetHeight;
            sessionStorage.removeItem(`${id}-start`);
          });
      } else {
        // Same page type, just animate position
        card
          .animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: "translate(0, 0)" },
            ],
            {
              duration: 400,
              easing: "ease-in-out",
              fill: "both",
              composite: "replace",
            }
          )
          .finished.then(() => {
            // Clean up
            card.style.transform = "";
            card.style.zIndex = "";
            card.style.position = "";
            // Force a reflow to ensure the browser recalculates the layout
            card.offsetHeight;
            sessionStorage.removeItem(`${id}-start`);
          });
      }
    });
  });
}

// Clear props on page load
document.addEventListener("astro:page-load", () => {
  // Clear any stored props for all components
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("component-props-")) {
      sessionStorage.removeItem(key);
    }
  });
});

// Set up the transitions
setupComponentTransitions();
