export function initializeLightbox() {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="" alt="Full size image">
        </div>
    `;
    document.body.appendChild(lightbox);

    // Add click event to all images
    document.querySelectorAll('img').forEach(img => {
        // Skip images that are part of the lightbox itself
        if (img.closest('.lightbox')) return;
        
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const lightboxImg = lightbox.querySelector('img');
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            
            // Force display to flex
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Log for debugging
            console.log('Lightbox opened:', img.src);
        });
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
            console.log('Lightbox closed by click');
        }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
            console.log('Lightbox closed by Escape');
        }
    });

    // Prevent clicks on the image from closing the lightbox
    lightbox.querySelector('.lightbox-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
} 