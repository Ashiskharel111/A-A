/*
  =========================================
  Warmly Duplicate Interactive Script
  Architect: Gemini | Coder: Claude
  Interactive Layer: Sticky Scroll, Overlay Modals, Canvas Particles
  =========================================
*/

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCountdown();
  initFaq();
  initClickHearts();

  // Conditionally initialize based on which page is active
  if (document.getElementById('story')) {
    initScrollAnimations();
    initDetailsDrawer();
  }

  if (document.getElementById('invitation-section')) {
    initInvitationShowcase();
  }

  if (document.getElementById('bride-family-grid') || document.querySelector('.party-page-main')) {
    initPartyPage();
  }
});

/* =========================================
   1. Navbar & Dropdown Menu
   ========================================= */
function initNavbar() {
  const menuBtn = document.querySelector('.menu-btn');
  const dropdownMenu = document.getElementById('primary-menu');

  if (!menuBtn || !dropdownMenu) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !isExpanded);
    dropdownMenu.classList.toggle('active');
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      menuBtn.setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.remove('active');
    }
  });

  // Close dropdown on navigation link click
  dropdownMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.remove('active');
    });
  });
}

/* =========================================
   2. Scroll-Driven Parallax and Animations
   ========================================= */
function initScrollAnimations() {
  const introSection = document.getElementById('story-intro');
  const introWords = introSection ? introSection.querySelectorAll('[data-vision-word]') : [];

  const storySection = document.getElementById('story');
  const storyTitle = document.querySelector('.story-section-title');
  const cards = document.querySelectorAll('.story-card-wrapper');
  const captions = document.querySelectorAll('.story-chapter-caption');
  const mobileCaptions = document.querySelectorAll('.mobile-chapter-caption');

  const logisticsKicker = document.querySelector('.logistics-kicker');
  const logisticsDate = document.querySelector('.logistics-date-svg');
  const countdownContainer = document.querySelector('.countdown-container');
  const logisticsVenue = document.querySelector('.logistics-venue-info');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // --- Story Intro: Word by Word Reveal ---
    if (introSection && introWords.length > 0) {
      const rect = introSection.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      const sectionHeight = rect.height;

      // Calculate scroll progress within intro section
      const startReveal = sectionTop - windowHeight;
      const endReveal = sectionTop + sectionHeight - windowHeight * 0.4;
      const progress = Math.max(0, Math.min(1, (scrollY - startReveal) / (endReveal - startReveal)));

      // Reveal words sequentially
      const totalWords = introWords.length;
      introWords.forEach((word, index) => {
        const threshold = index / totalWords;
        if (progress > threshold) {
          // Linear interpolation for smooth alpha fade-in
          const wordProgress = (progress - threshold) * totalWords;
          word.style.opacity = Math.max(0.4, Math.min(1, 0.4 + wordProgress * 0.6));
        } else {
          word.style.opacity = '0.4';
        }
      });
    }

    // --- Story Polaroid Cards Shedding Stack ---
    if (storySection) {
      const rect = storySection.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      const sectionHeight = rect.height;

      // Calculate progress of scroll through the 600vh story track
      const progress = Math.max(0, Math.min(1, (scrollY - sectionTop) / (sectionHeight - windowHeight)));

      // Title activation
      if (progress > 0.02 && progress < 0.95) {
        storyTitle.classList.add('active');
      } else {
        storyTitle.classList.remove('active');
      }

      // 9 cards total (indices 0 to 8)
      const numCards = cards.length;
      const activeCardIndex = Math.floor(progress * numCards);

      // Rotations mapping from the styling markup
      const rotations = [-2.5, 1.8, -1.2, -2.5, 1.8, -1.2, -2.5, 1.8, -1.2];

      cards.forEach((card, index) => {
        const rotation = rotations[index];
        const innerFrame = card.querySelector('.polaroid-frame');

        if (progress * numCards >= index) {
          // Card is active and stacked
          card.classList.add('active');
          card.style.pointerEvents = 'auto';

          // Shedding effect: as scroll moves PAST this card index, slide/fade it out to reveal next one
          const currentProgress = (progress * numCards) - index; // 0 to 1
          if (currentProgress > 0.8 && index < numCards - 1) {
            const factor = (currentProgress - 0.8) / 0.2; // fade transition factor
            card.style.opacity = 1 - factor;
            // Slide slightly left or right depending on card index to look like organic card throw
            const direction = index % 2 === 0 ? -1 : 1;
            card.style.transform = `translate3d(${direction * factor * 100}px, -${factor * 50}px, 0) rotate(${rotation + direction * factor * 15}deg)`;
          } else {
            card.style.opacity = '1';
            card.style.transform = `translate3d(0, 0, 0)`;
            if (innerFrame) {
              innerFrame.style.transform = `rotate(${rotation}deg)`;
            }
          }
        } else {
          // Card is waiting in stack
          card.classList.remove('active');
          card.style.pointerEvents = 'none';
          card.style.opacity = '0';
          card.style.transform = `translate3d(0, 50px, 0)`;
        }
      });

      // Chapter Captions Toggling (0 to 3: Chapter 1, 3 to 6: Chapter 2, 6 to 9: Chapter 3)
      const currentChapter = Math.min(2, Math.floor(progress * 3));

      captions.forEach((cap, index) => {
        if (progress > 0 && index === currentChapter) {
          cap.classList.add('active');
        } else {
          cap.classList.remove('active');
        }
      });

      mobileCaptions.forEach((cap, index) => {
        if (progress > 0 && index === currentChapter) {
          cap.classList.add('active');
        } else {
          cap.classList.remove('active');
        }
      });
    }

    // --- Logistics Section Reveal ---
    const logistics = document.getElementById('logistics-section');
    if (logistics) {
      const rect = logistics.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (scrollY - (rect.top + scrollY)) / (rect.height - windowHeight)));

      if (progress > 0.05) {
        logisticsKicker.classList.add('active');
        logisticsDate.classList.add('active');
        countdownContainer.classList.add('active');
        logisticsVenue.classList.add('active');
      } else {
        logisticsKicker.classList.remove('active');
        logisticsDate.classList.remove('active');
        countdownContainer.classList.remove('active');
        logisticsVenue.classList.remove('active');
      }
    }

    // --- Poem Section Reveal ---
    const poemSection = document.getElementById('poem-section');
    if (poemSection) {
      const rect = poemSection.getBoundingClientRect();
      if (rect.top < windowHeight * 0.82 && rect.bottom > 0) {
        poemSection.classList.add('active');
      }
    }
  });
}

/* =========================================
   3. Real-Time Countdown Timer
   ========================================= */
function initCountdown() {
  const targetDate = new Date('2026-10-11T10:30:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
      daysEl.innerText = '0';
      hoursEl.innerText = '0';
      minutesEl.innerText = '0';
      secondsEl.innerText = '0';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.innerText = days;
    hoursEl.innerText = hours;
    minutesEl.innerText = minutes;
    secondsEl.innerText = seconds;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* =========================================
   4. FAQ Accordion Panels
   ========================================= */
function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const panel = item.querySelector('.faq-answer-panel');

    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other panels
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq-answer-panel').style.maxHeight = null;
        }
      });

      // Toggle current panel
      item.classList.toggle('active');
      if (!isActive) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = null;
      }
    });
  });
}

/* =========================================
   5. Slide-Out Details Overlays (Drawers)
   ========================================= */
const drawerTemplates = {
  "parties": `
    <h2 class="drawer-title">Meet Our Favorite People</h2>
    <p class="drawer-subtitle">The family who raised us, the friends who walk beside us, and the shared souls who make our journey complete. Click any circle to view photos.</p>
    
    <div class="drawer-couple-centerpiece" id="drawer-couple-card-trigger">
      <div class="drawer-couple-avatar">
        <img src="assets/guest piccs/bridegroom2shot.jpg" alt="Ashis & Ayaka">
      </div>
      <div class="drawer-couple-info">
        <span class="drawer-section-kicker" style="color: var(--template-accent); margin-bottom: 2px;">The Bride &amp; Groom</span>
        <h3 class="drawer-couple-title">Ashis &amp; Ayaka</h3>
        <p class="drawer-couple-hint">Tap to view couple portrait ✨</p>
      </div>
    </div>

    <div class="drawer-divider"></div>

    <div class="drawer-section">
      <span class="drawer-section-kicker" style="color: #1e3a8a;">Groom's Side</span>
      <h3 class="drawer-section-title">Ashis's Circle</h3>
      
      <h4 style="font-family: var(--font-display); font-size: 20px; font-style: italic; color: var(--template-accent); margin-top: 16px;">Family</h4>
      <div class="drawer-bubbles-grid" id="drawer-groom-family"></div>

      <h4 style="font-family: var(--font-display); font-size: 20px; font-style: italic; color: var(--template-accent); margin-top: 16px;">Friends</h4>
      <div class="drawer-bubbles-grid" id="drawer-groom-friends"></div>
    </div>
    
    <div class="drawer-divider"></div>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker" style="color: #be185d;">Bride's Side</span>
      <h3 class="drawer-section-title">Ayaka's Circle</h3>
      
      <h4 style="font-family: var(--font-display); font-size: 20px; font-style: italic; color: var(--template-accent); margin-top: 16px;">Family</h4>
      <div class="drawer-bubbles-grid" id="drawer-bride-family"></div>

      <h4 style="font-family: var(--font-display); font-size: 20px; font-style: italic; color: var(--template-accent); margin-top: 16px;">Friends</h4>
      <div class="drawer-bubbles-grid" id="drawer-bride-friends"></div>
    </div>

    <div class="drawer-divider"></div>

    <div class="drawer-section">
      <span class="drawer-section-kicker" style="color: var(--template-accent);">Overlapping Circle</span>
      <h3 class="drawer-section-title">Shared Friends</h3>
      
      <div class="drawer-bubbles-grid" id="drawer-shared-friends"></div>
    </div>
  `,
  "travel": `
    <h2 class="drawer-title">Travel & Venue Access</h2>
    <p class="drawer-subtitle">Essential details to help you find and navigate the celebration venue smoothly.</p>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker">Getting to Tokyo</span>
      <h3 class="drawer-section-title">Flight & Transit</h3>
      <p class="drawer-section-body">For out-of-town or international guests, we recommend flying into either Tokyo Haneda Airport (HND) or Narita International Airport (NRT). From both airports, convenient direct train or limousine bus connections run straight to Shibuya Station.</p>
    </div>
    
    <div class="drawer-divider"></div>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker">Venue Location</span>
      <h3 class="drawer-section-title">Grace Bali Shibuya (Bahama Hall)</h3>
      <p class="drawer-section-body"><strong>Address:</strong> Pasela Resorts Shibuya B1F/2F, 1-22-9 Jinnan, Shibuya-ku, Tokyo 150-0041 (〒150-0041 東京都渋谷区神南1-22-9 パセラリゾーツ渋谷店)<br><br>
      The venue is conveniently located just a 5–7 minute walk from <strong>JR Shibuya Station (Hachiko Exit)</strong> and Shibuya Subway exits.</p>
    </div>
    
    <div class="drawer-divider"></div>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker">Parking Information</span>
      <h3 class="drawer-section-title">Self-Arranged Parking</h3>
      <p class="drawer-section-body">Please note that Grace Bali Shibuya does not have dedicated guest parking. Guests driving to the venue will need to arrange parking at nearby public or coin-operated parking garages in the Shibuya/Jinnan area.</p>
    </div>
    
    <div class="drawer-divider"></div>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker">Questions & Contact</span>
      <h3 class="drawer-section-title">Direct Inquiries</h3>
      <p class="drawer-section-body">If you have any questions before or on the wedding day, feel free to send a DM on Instagram: <a href="https://www.instagram.com/ace__eel77/" target="_blank" rel="noopener noreferrer" style="color: var(--template-accent); font-weight: 500; text-decoration: underline;">@ace__eel77</a>.</p>
    </div>
  `,
  "registry": `
    <h2 class="drawer-title">Registry</h2>
    <div class="drawer-section" style="text-align: center; padding: 48px 16px;">
      <p style="font-size: clamp(1.4rem, 3.2vw, 2.2rem); font-family: var(--font-display); font-style: italic; color: var(--template-text); line-height: 1.6;">You know the drill 😊</p>
    </div>
  `,
  "dress-code": `
    <h2 class="drawer-title">Dress Code</h2>
    <p class="drawer-subtitle">We would love to see all of our guests dressed in their celebratory best!</p>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker">Elegant, stylish & comfortable</span>
      <h3 class="drawer-section-title">For the Ladies</h3>
      <p class="drawer-section-body">Cocktail dresses, elegant midi/maxi dresses, or chic formal separates are welcome. The wedding and celebration are held completely indoors in Bahama Hall with full climate control, so wear whatever heels and celebratory styles you feel most fabulous in!</p>
    </div>
    
    <div class="drawer-divider"></div>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker">Polished & celebratory</span>
      <h3 class="drawer-section-title">For the Gentlemen</h3>
      <p class="drawer-section-body">Suits, blazers with tailored trousers, or crisp dress shirts are perfect. Feel free to wear your favorite celebratory colors or classic tones.</p>
    </div>
  `,
  "dinner-menu": `
    <h2 class="drawer-title">Our Journey & Memories</h2>
    <p class="drawer-subtitle">A collection of moments from our EBC hike on May 5th, crafting couple rings half a year later, and our many travels together.</p>
    
    <div class="journey-gallery-grid">
      <div class="journey-card">
        <img src="assets2/EBC2shot.JPG" alt="EBC Hike May 5th">
        <div class="journey-card-caption">
          <h4>Hike to EBC (May 5th)</h4>
          <p>Where our dating story officially began!</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/pair-ring.jpg" alt="Couple Rings">
        <div class="journey-card-caption">
          <h4>Couple Ring Workshop</h4>
          <p>Crafting our matching couple rings half a year later.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/Proposedlocation.jpg" alt="Proposal Location">
        <div class="journey-card-caption">
          <h4>The Proposal Spot</h4>
          <p>The place where we decided on forever.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/Kyoto2shot.jpg" alt="Kyoto Trip">
        <div class="journey-card-caption">
          <h4>Kyoto Stroll</h4>
          <p>Wandering historic alleys and quiet temples.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/okinawa.JPG" alt="Okinawa Getaway">
        <div class="journey-card-caption">
          <h4>Okinawa Beach Days</h4>
          <p>Ocean breezes and tropical sunshine.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/heart-rock.jpg" alt="Heart Rock">
        <div class="journey-card-caption">
          <h4>Heart Rock Beach</h4>
          <p>Natural beauty on our island getaway.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/nagano.jpg" alt="Nagano Trip">
        <div class="journey-card-caption">
          <h4>Nagano Mountain Trails</h4>
          <p>Fresh alpine air and mountain peaks.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/Sakura2shot.jpg" alt="Sakura Season">
        <div class="journey-card-caption">
          <h4>Sakura Season</h4>
          <p>Spring cherry blossoms in full bloom.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/Disney2shot.jpg" alt="Disney Day">
        <div class="journey-card-caption">
          <h4>Disney Adventures</h4>
          <p>Magical day together.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/Kamakura2shot.jpg" alt="Kamakura">
        <div class="journey-card-caption">
          <h4>Kamakura Coastal Visit</h4>
          <p>Sea breeze and afternoon walks.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/EBC-1day-after.jpg" alt="EBC Trek">
        <div class="journey-card-caption">
          <h4>EBC Trekking Memories</h4>
          <p>Cold mountain air, high altitude, warm hearts.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/autumleaves.jpg" alt="Autumn Leaves">
        <div class="journey-card-caption">
          <h4>Autumn Foliage Walk</h4>
          <p>Wrapped in golden fall colors.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/Ueno2shot.jpg" alt="Ueno Park">
        <div class="journey-card-caption">
          <h4>Ueno Afternoon</h4>
          <p>Sunny strolls in the city park.</p>
        </div>
      </div>

      <div class="journey-card">
        <img src="assets2/Okutama2shot.JPG" alt="Okutama Stream">
        <div class="journey-card-caption">
          <h4>Okutama Nature Trail</h4>
          <p>Crisp water and green mountain paths.</p>
        </div>
      </div>
    </div>
  `,
  "music": `
    <h2 class="drawer-title">Wedding Music</h2>
    <p class="drawer-subtitle">Set the tone for the night and request your favorite tracks.</p>
    
    <div class="drawer-section">
      <span class="drawer-section-kicker">Wedding Playlist</span>
      <h3 class="drawer-section-title">Music</h3>
      <p class="drawer-section-body" style="margin-bottom: 24px;">We have set up an open-collaborative playlist for our wedding reception. Listen in and add some dance tunes!</p>
      
      <div class="spotify-embed-container">
        <iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/01TpxUAxN2oxkZcxJgG3cG?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
    </div>
  `
};

function initDetailsDrawer() {
  const cards = document.querySelectorAll('.detail-card');
  const overlay = document.getElementById('details-drawer-overlay');
  const drawer = document.getElementById('details-drawer');
  const closeBtn = document.querySelector('.drawer-close-btn');
  const contentContainer = document.getElementById('drawer-inner-content');

  if (!drawer || !overlay || !closeBtn) return;

  function render5cmDrawerGrid(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container || !list) return;

    container.innerHTML = "";
    list.forEach(person => {
      const item = document.createElement('div');
      item.className = 'drawer-person-bubble';
      const initials = person.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();

      item.innerHTML = `
        <div class="drawer-5cm-avatar">
          ${person.avatarImg ? 
            `<img src="${person.avatarImg}" alt="${person.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="drawer-5cm-placeholder" style="display:none;">${initials}</div>` : 
            `<div class="drawer-5cm-placeholder">${initials}</div>`
          }
        </div>
        <span class="drawer-person-name">${person.name}</span>
        <span class="drawer-person-role">${person.role}</span>
      `;

      let drawerBubbleTapCount = 0;
      let drawerBubbleTapTimer = null;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        drawerBubbleTapCount++;
        clearTimeout(drawerBubbleTapTimer);
        drawerBubbleTapTimer = setTimeout(() => { drawerBubbleTapCount = 0; }, 700);

        if (drawerBubbleTapCount >= 3 && person.hiddenImg) {
          drawerBubbleTapCount = 0;
          openPersonModal(person, true);
        } else {
          openPersonModal(person, false);
        }
      });

      container.appendChild(item);
    });
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-drawer-trigger');
      const template = drawerTemplates[type];

      if (template) {
        contentContainer.innerHTML = template;
        overlay.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll while drawer open

        // If parties drawer, populate 5cm avatar circles from Firebase Firestore
        if (type === 'parties') {
          (async () => {
            let liveList = null;
            if (typeof window.fetchFavoritePeopleFromFirebase === 'function') {
              liveList = await window.fetchFavoritePeopleFromFirebase();
              if (!liveList || liveList.length === 0) {
                if (typeof window.seedInitialFavoritePeopleIfNeeded === 'function') {
                  liveList = await window.seedInitialFavoritePeopleIfNeeded();
                }
              }
            }

            if (liveList && liveList.length > 0) {
              const gf = liveList.filter(p => p.side === 'groom' && p.category === 'family');
              const gfr = liveList.filter(p => p.side === 'groom' && p.category === 'friends');
              const bf = liveList.filter(p => p.side === 'bride' && p.category === 'family');
              const bfr = liveList.filter(p => p.side === 'bride' && p.category === 'friends');
              const sh = liveList.filter(p => p.side === 'shared');

              render5cmDrawerGrid('drawer-groom-family', gf);
              render5cmDrawerGrid('drawer-groom-friends', gfr);
              render5cmDrawerGrid('drawer-bride-family', bf);
              render5cmDrawerGrid('drawer-bride-friends', bfr);
              render5cmDrawerGrid('drawer-shared-friends', sh);
            } else if (typeof favoritePeopleData !== 'undefined') {
              render5cmDrawerGrid('drawer-groom-family', favoritePeopleData.groomFamily);
              render5cmDrawerGrid('drawer-groom-friends', favoritePeopleData.groomFriends);
              render5cmDrawerGrid('drawer-bride-family', favoritePeopleData.brideFamily);
              render5cmDrawerGrid('drawer-bride-friends', favoritePeopleData.brideFriends);
              render5cmDrawerGrid('drawer-shared-friends', favoritePeopleData.shared);
            }

            const drawerCoupleTrigger = document.getElementById('drawer-couple-card-trigger');
            if (drawerCoupleTrigger) {
              drawerCoupleTrigger.addEventListener('click', () => {
                openPersonModal({
                  name: "Ashis & Ayaka",
                  role: "The Bride & Groom",
                  relationship: "The Happy Couple",
                  avatarImg: "assets/guest piccs/facecover/IMG_2267.heic.jpg",
                  togetherImg: "assets/guest piccs/bridegroom2shot.jpg",
                  photos: ["assets/guest piccs/bridegroom2shot.jpg"],
                  note: "Destiny had a plan we didn't see. First came the jokes, then came the roasts, petty arguments, easily forgiven, and days spent laughing until we couldn't breathe. Until the boy finally grew a pair... And the girl simply said yes."
                });
              });
            }
          })();
        }
      }
    });
  });

  function closeDrawer() {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

/* =========================================
   6. Click Hearts Particles Canvas
   ========================================= */
function initClickHearts() {
  const canvas = document.getElementById('click-hearts-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class HeartParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 12 + 10; // size of heart
      this.speedX = Math.random() * 2 - 1; // horizontal velocity
      this.speedY = Math.random() * -2 - 1.5; // upwards float speed
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.01; // fading velocity
      this.wobble = Math.random() * 100; // unique sin wobble offset
      this.wobbleSpeed = Math.random() * 0.05 + 0.03;
    }

    update() {
      this.x += this.speedX + Math.sin(this.wobble) * 0.5;
      this.y += this.speedY;
      this.wobble += this.wobbleSpeed;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.85)'; // Red hearts
      ctx.beginPath();

      const x = this.x;
      const y = this.y;
      const size = this.size;

      // Draw standard SVG heart path mathematically on canvas
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y, x - size / 2, y);
      ctx.quadraticCurveTo(x - size, y, x - size, y + size / 2);
      ctx.quadraticCurveTo(x - size, y + size * 7 / 8, x, y + size * 1.3);
      ctx.quadraticCurveTo(x + size, y + size * 7 / 8, x + size, y + size / 2);
      ctx.quadraticCurveTo(x + size, y, x + size / 2, y);
      ctx.quadraticCurveTo(x, y, x, y + size / 4);

      ctx.fill();
      ctx.restore();
    }
  }

  // Click Trigger
  window.addEventListener('click', (e) => {
    // Avoid spawning hearts on buttons that slide overlays or navigation buttons
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.detail-card')) return;

    const count = Math.floor(Math.random() * 3) + 4; // 4 to 6 hearts
    for (let i = 0; i < count; i++) {
      particles.push(new HeartParticle(e.clientX, e.clientY));
    }
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}


/* =========================================
   8. Favorite People Data & Modal Popup Logic
   ========================================= */
const favoritePeopleData = {
  brideFamily: [
    {
      name: "Akiko Watanabe",
      role: "Mother of the Bride",
      relationship: "Ayaka's Family",
      avatarImg: "assets/guest piccs/facecover/akochan.jpeg",
      togetherImg: "assets/guest piccs/akochan.png",
      photos: ["assets/guest piccs/akochan.png"],
      note: "Ayaka's loving mother, the heart and warmth of the Watanabe family home."
    },
    {
      name: "Mr Watanabe",
      role: "Father of the Bride",
      relationship: "Ayaka's Family",
      avatarImg: "assets/guest piccs/facecover/bride'Sfather(kunihisa).jpeg",
      togetherImg: "assets/guest piccs/kunihisa.png",
      photos: ["assets/guest piccs/kunihisa.png"],
      note: "Ayaka's supportive and proud father, guiding with boundless love and wisdom."
    },
    {
      name: "Ryoma Watanabe",
      role: "Brother",
      relationship: "Ayaka's Family",
      avatarImg: "assets/guest piccs/facecover/ryoma.jpeg",
      togetherImg: "assets/guest piccs/ryoma.png",
      photos: ["assets/guest piccs/ryoma.png"],
      note: "Ayaka's brother, lifelong companion and trusted confidant."
    },
    {
      name: "Tamaki Watanabe",
      role: "Sister in Law",
      relationship: "Ayaka's Family",
      avatarImg: "assets/guest piccs/facecover/tamaki.jpeg",
      togetherImg: "assets/guest piccs/tamaki.png",
      photos: ["assets/guest piccs/tamaki.png"],
      note: "Brings endless warmth, happiness, and sisterly bond to our family."
    },
    {
      name: "Shio Watanabe",
      role: "Nephew",
      relationship: "Ayaka's Family",
      avatarImg: "assets/guest piccs/facecover/shio.jpeg",
      togetherImg: "assets/guest piccs/shio.png",
      photos: ["assets/guest piccs/shio.png"],
      note: "Beloved nephew bringing endless smiles and playful energy to every family reunion."
    },
    {
      name: "Sou Watanabe",
      role: "Nephew",
      relationship: "Ayaka's Family",
      avatarImg: "assets/guest piccs/facecover/so.jpeg",
      togetherImg: "assets/guest piccs/so.png",
      photos: ["assets/guest piccs/so.png"],
      note: "Beloved nephew whose bright laughter and sweetness light up our home."
    },
    {
      name: "Mimi",
      role: "Family Cat",
      relationship: "Ayaka's Family • Pet",
      avatarImg: "assets/guest piccs/facecover/mimi.jpeg",
      togetherImg: "assets/guest piccs/mimi.png",
      photos: ["assets/guest piccs/mimi.png"],
      note: "The adorable feline queen of the household, master of cozy naps."
    },
    {
      name: "Lala",
      role: "Family Cat",
      relationship: "Ayaka's Family • Pet",
      avatarImg: "assets/guest piccs/facecover/Lala.jpeg",
      togetherImg: "assets/guest piccs/Lala.png",
      photos: ["assets/guest piccs/Lala.png"],
      note: "Sweet and curious family cat who brings purrs and warmth everywhere."
    },
    {
      name: "Merun",
      role: "Family Dog",
      relationship: "Ayaka's Family • Pet",
      avatarImg: "assets/guest piccs/facecover/merun.jpeg",
      togetherImg: "assets/guest piccs/merun(right).png",
      photos: ["assets/guest piccs/merun(right).png"],
      note: "Loyal and energetic family pup, always ready for tail-wagging adventures."
    },
    {
      name: "Perun",
      role: "Family Dog",
      relationship: "Ayaka's Family • Pet",
      avatarImg: "assets/guest piccs/facecover/peron.jpeg",
      togetherImg: "assets/guest piccs/peron(left).png",
      photos: ["assets/guest piccs/peron(left).png"],
      note: "Playful and cuddly furry companion bringing pure joy to our days."
    }
  ],
  brideFriends: [
    {
      name: "Makisi Ayaka",
      role: "Close Friend",
      relationship: "Bride's Friend",
      avatarImg: "assets/guest piccs/facecover/makishimom.jpeg",
      togetherImg: "assets/guest piccs/nanaha.png",
      photos: ["assets/guest piccs/nanaha.png"],
      note: "Cherished friend who brings wonderful memories, laughter, and support."
    },
    {
      name: "RIKO",
      role: "Close Friend",
      relationship: "Bride's Friend",
      avatarImg: "assets/guest piccs/facecover/riko.jpeg",
      togetherImg: "assets/guest piccs/riko.png",
      photos: ["assets/guest piccs/riko.png"],
      note: "Dear friend who has shared so many unforgettable moments and milestones."
    },
    {
      name: "Sakiho",
      role: "Close Friend",
      relationship: "Bride's Friend",
      avatarImg: "assets/guest piccs/facecover/sakiho(left).jpeg",
      togetherImg: "assets/guest piccs/sakiho.png",
      photos: ["assets/guest piccs/sakiho.png"],
      note: "Always bringing smiles, deep conversations, and uplifting positive energy."
    },
    {
      name: "Chiaki",
      role: "Close Friend",
      relationship: "Bride's Friend",
      avatarImg: "assets/guest piccs/facecover/chiaki.jpeg",
      togetherImg: "assets/guest piccs/chiaki(right).png",
      photos: ["assets/guest piccs/chiaki(right).png"],
      note: "Trusted friend and confidante for life talks and fun celebrations."
    },
    {
      name: "Andrea",
      role: "Close Friend",
      relationship: "Bride's Friend",
      avatarImg: "assets/guest piccs/facecover/andrea.jpeg",
      togetherImg: "assets/guest piccs/andrea.png",
      photos: ["assets/guest piccs/andrea.png"],
      note: "Wonderful friend sharing unforgettable adventures and warm companionship."
    }
  ],
  shared: [
    {
      name: "Ishwor",
      role: "Mutual Friend",
      relationship: "Our Shared Circle",
      avatarImg: "assets/guest piccs/facecover/ish.jpeg",
      togetherImg: "assets/guest piccs/ish.png",
      photos: ["assets/guest piccs/ish.png"],
      note: "Trusted mutual friend who brings great camaraderie and joy to both of us."
    },
    {
      name: "Nabin",
      role: "Mutual Friend",
      relationship: "Our Shared Circle",
      avatarImg: "assets/guest piccs/facecover/nabin.png.jpg",
      togetherImg: "assets/guest piccs/nabin.png.jpg",
      photos: ["assets/guest piccs/nabin.png.jpg"],
      note: "Always bringing laughter, high energy, and genuine warmth to every meetup."
    },
    {
      name: "Sandip",
      role: "Mutual Friend",
      relationship: "Our Shared Circle",
      avatarImg: "assets/guest piccs/facecover/sandip.heic.jpg",
      togetherImg: "assets/guest piccs/ish:sandip:nabin cover.heic.jpg",
      photos: ["assets/guest piccs/ish:sandip:nabin cover.heic.jpg"],
      note: "Great friend and adventure buddy through mountain trails and celebrations."
    },
    {
      name: "Kristian",
      role: "Mutual Friend",
      relationship: "Our Shared Circle",
      avatarImg: "assets/guest piccs/facecover/kristian.jpeg",
      togetherImg: "assets/guest piccs/kristian.png",
      photos: ["assets/guest piccs/kristian.png"],
      note: "Wonderful friend sharing great conversations and memorable gatherings."
    },
    {
      name: "Rumon",
      role: "Mutual Friend",
      relationship: "Our Shared Circle",
      avatarImg: "assets/guest piccs/facecover/rumon.heic.jpg",
      togetherImg: "assets/guest piccs/rumon(cover).jpg",
      photos: ["assets/guest piccs/rumon(cover).jpg"],
      note: "Reliable friend and the life of every reunion and get-together."
    },
    {
      name: "Iman",
      role: "Mutual Friend",
      relationship: "Our Shared Circle",
      avatarImg: "assets/guest piccs/facecover/iman.jpeg",
      togetherImg: "assets/guest piccs/iman.png",
      photos: ["assets/guest piccs/iman.png"],
      note: "Cherished mutual friend whose presence makes every occasion special."
    },
    {
      name: "Iman's friend",
      role: "Mutual Friend",
      relationship: "Our Shared Circle",
      avatarImg: "assets/guest piccs/facecover/elvina.jpeg",
      togetherImg: "assets/guest piccs/elvina.png",
      photos: ["assets/guest piccs/elvina.png"],
      note: "Warm friend welcomed with open arms into our celebration."
    }
  ],
  groomFamily: [
    {
      name: "Mina Kharel",
      role: "Mother of the Groom",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/parents.jpg",
      togetherImg: "assets/guest piccs/parents.jpg",
      photos: ["assets/guest piccs/parents.jpg"],
      note: "Ashis's loving mother, a pillar of care, warmth, and unconditional devotion."
    },
    {
      name: "Prajapati Kharel",
      role: "Father of the Groom",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/prajapatikharel.JPG",
      togetherImg: "assets/guest piccs/prajapatikharel.JPG",
      photos: ["assets/guest piccs/prajapatikharel.JPG"],
      note: "Ashis's guiding father, inspiring with wisdom, strength, and integrity."
    },
    {
      name: "Ayush Kharel",
      role: "Brother",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/ayush.png.jpg",
      togetherImg: "assets/guest piccs/ayush.png.jpg",
      photos: ["assets/guest piccs/ayush.png.jpg"],
      note: "Inseparable brother and best friend through every chapter of life."
    },
    {
      name: "Grandparents",
      role: "Beloved Grandparents",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/grandparents.jpg",
      togetherImg: "assets/guest piccs/grandparents(cover).jpg",
      photos: ["assets/guest piccs/grandparents(cover).jpg"],
      note: "Our cherished elders whose blessings and love guide our journey."
    },
    {
      name: "Shiva Kharel",
      role: "Uncle",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/shivakharel.jpg",
      togetherImg: "assets/guest piccs/shivakharel.jpg",
      photos: ["assets/guest piccs/shivakharel.jpg"],
      note: "Respected uncle bringing wisdom, support, and family pride."
    },
    {
      name: "Kalpana Kharel",
      role: "Aunt",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/kalpanakharel.jpg",
      togetherImg: "assets/guest piccs/shivakharel.jpg",
      photos: ["assets/guest piccs/shivakharel.jpg"],
      note: "Loving aunt whose warmth and care brighten every family gathering."
    },
    {
      name: "Prabesh Kharel",
      role: "Cousin",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/prabesh.jpeg",
      togetherImg: "assets/guest piccs/prabesh.cover.png.jpg",
      photos: ["assets/guest piccs/prabesh.cover.png.jpg"],
      hiddenImg: "assets/guest piccs/prabesh.hidden.jpg",
      note: "Cousin and close buddy sharing laughter, brotherhood, and memories."
    },
    {
      name: "Prasansha Kharel",
      role: "Cousin",
      relationship: "Ashis's Family",
      avatarImg: "assets/guest piccs/facecover/prasansa.jpg",
      togetherImg: "assets/guest piccs/Prasansha.png.jpg",
      photos: ["assets/guest piccs/Prasansha.png.jpg"],
      note: "Wonderful cousin who brings joy, smiles, and sweetness to the family circle."
    }
  ],
  groomFriends: [
    {
      name: "Ryo",
      role: "Close Friend",
      relationship: "Groom's Friend",
      avatarImg: "assets/guest piccs/facecover/ryo..jpg",
      togetherImg: "assets/guest piccs/Ryo.cover.jpg",
      photos: ["assets/guest piccs/Ryo.cover.jpg"],
      note: "Great buddy for travel adventures, gatherings, and unforgettable times."
    },
    {
      name: "ChaCha",
      role: "Close Friend",
      relationship: "Groom's Friend",
      avatarImg: "assets/guest piccs/facecover/muktiramsapkota.jpg",
      togetherImg: "assets/guest piccs/puktiramsapkotacover.jpeg",
      photos: ["assets/guest piccs/puktiramsapkotacover.jpeg"],
      note: "Valued friend always bringing great energy and memorable moments."
    },
    {
      name: "Mama",
      role: "Close Friend",
      relationship: "Groom's Friend",
      avatarImg: "assets/guest piccs/facecover/muktiramsapkota.jpg",
      togetherImg: "assets/guest piccs/muktiramsapkota.jpg",
      photos: ["assets/guest piccs/muktiramsapkota.jpg"],
      note: "Cherished friend and constant source of support and good laughs."
    },
    {
      name: "Sandesh",
      role: "Childhood Friend",
      relationship: "Groom's Friend",
      avatarImg: "assets/guest piccs/facecover/sandesh.jpeg",
      togetherImg: "assets/guest piccs/sandesh.heic.jpg",
      photos: ["assets/guest piccs/sandesh.heic.jpg"],
      hiddenImg: "assets/guest piccs/subhahidden.png",
      note: "Childhood friend through the years, sharing roots and lifelong brotherhood."
    },
    {
      name: "Aditya",
      role: "Childhood Friend",
      relationship: "Groom's Friend",
      avatarImg: "assets/guest piccs/facecover/20190330_193606.jpg",
      togetherImg: "assets/guest piccs/Screenshot_20210129-134711_Facebook.jpg",
      photos: ["assets/guest piccs/Screenshot_20210129-134711_Facebook.jpg"],
      note: "Childhood friend who grew up together through all life's adventures."
    }
  ]
};

// Floating secret toast notification helper
function showSecretToast(msg = "✨ Secret Photo Unlocked! 🤫✨") {
  let toast = document.getElementById('secret-toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'secret-toast-msg';
    toast.className = 'secret-toast-container';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>🌟</span> <span>${msg}</span>`;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3200);
}

function openPersonModal(person, startWithHidden = false) {
  const overlay = document.getElementById('person-modal-overlay');
  const track = document.getElementById('modal-slider-track');
  const dotsContainer = document.getElementById('modal-slider-dots');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');

  const modalBadge = document.getElementById('modal-relationship-badge');
  const modalName = document.getElementById('modal-person-name');
  const modalRole = document.getElementById('modal-person-role');
  const modalNote = document.getElementById('modal-person-note');

  if (!overlay) return;

  // Single primary image
  const primaryImg = person.avatarImg || person.togetherImg || (person.photos && person.photos[0]) || "assets2/Sakura2shot.jpg";
  let hiddenImageSrc = person.hiddenImg || null;

  // Current active displayed image
  let activeImgSrc = (startWithHidden && hiddenImageSrc) ? hiddenImageSrc : primaryImg;
  let isSecretActive = (startWithHidden && hiddenImageSrc);

  // Hide arrows & dots since each person has 1 single clean unzoomed view
  if (prevBtn) prevBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';
  if (dotsContainer) dotsContainer.innerHTML = '';

  function renderSingleView() {
    if (!track) return;
    track.innerHTML = "";
    track.style.transform = 'translateX(0%)';

    const slide = document.createElement('div');
    slide.className = 'slider-slide';

    slide.innerHTML = `
      <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
        ${isSecretActive ? `<span class="secret-unlocked-badge">🌟 Secret Memory 🤫✨</span>` : ''}
        <img src="${activeImgSrc}" alt="${person.name}" class="modal-together-img" onerror="this.src='assets2/Sakura2shot.jpg'">
      </div>
    `;

    // Triple Tap Handler on image for hidden secret
    const img = slide.querySelector('img');
    let tapCount = 0;
    let tapTimer = null;

    img.addEventListener('click', (e) => {
      e.stopPropagation();
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 700);

      // Micro feedback bounce
      img.style.transform = "scale(0.97)";
      setTimeout(() => { if (img) img.style.transform = ""; }, 150);

      if (tapCount >= 3) {
        tapCount = 0;
        if (hiddenImageSrc) {
          if (!isSecretActive) {
            activeImgSrc = hiddenImageSrc;
            isSecretActive = true;
            renderSingleView();
            showSecretToast(`✨ Secret Photo Unlocked for ${person.name}! 🤫✨`);
          } else {
            activeImgSrc = primaryImg;
            isSecretActive = false;
            renderSingleView();
            showSecretToast(`✨ Original Photo for ${person.name}!`);
          }
        }
      }
    });

    track.appendChild(slide);
  }

  // Populate info
  if (modalBadge) modalBadge.innerText = person.relationship || 'Friend';
  if (modalName) modalName.innerText = person.name;
  if (modalRole) modalRole.innerText = person.role;
  if (modalNote) modalNote.innerText = person.note;

  renderSingleView();

  if (startWithHidden && hiddenImageSrc) {
    showSecretToast(`✨ Secret Photo Unlocked for ${person.name}! 🤫✨`);
  }

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function initPartyPage() {
  const brideFamilyGrid = document.getElementById('bride-family-grid');
  const brideFriendsGrid = document.getElementById('bride-friends-grid');
  const sharedGrid = document.getElementById('shared-bubbles-grid');
  const groomFamilyGrid = document.getElementById('groom-family-grid');
  const groomFriendsGrid = document.getElementById('groom-friends-grid');

  const overlay = document.getElementById('person-modal-overlay');
  const closeBtn = document.querySelector('.person-modal-close');

  function getInitials(name) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  function renderGrid(container, list) {
    if (!container || !list) return;
    container.innerHTML = "";
    list.forEach(person => {
      const item = document.createElement('div');
      item.className = 'person-bubble-item';
      const initials = getInitials(person.name);

      item.innerHTML = `
        <div class="bubble-avatar-frame">
          ${person.avatarImg ? 
            `<img src="${person.avatarImg}" alt="${person.name}" class="bubble-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="bubble-avatar-placeholder" style="display:none;">${initials}</div>` : 
            `<div class="bubble-avatar-placeholder">${initials}</div>`
          }
        </div>
        <span class="bubble-person-name">${person.name}</span>
        <span class="bubble-person-role">${person.role}</span>
      `;

      // Triple Tap Detection on Avatar Bubble
      let bubbleTapCount = 0;
      let bubbleTapTimer = null;

      item.addEventListener('click', () => {
        bubbleTapCount++;
        clearTimeout(bubbleTapTimer);
        bubbleTapTimer = setTimeout(() => { bubbleTapCount = 0; }, 700);

        if (bubbleTapCount >= 3 && person.hiddenImg) {
          bubbleTapCount = 0;
          openPersonModal(person, true);
        } else {
          openPersonModal(person, false);
        }
      });

      container.appendChild(item);
    });
  }

  function closeModal() {
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  renderGrid(brideFamilyGrid, favoritePeopleData.brideFamily);
  renderGrid(brideFriendsGrid, favoritePeopleData.brideFriends);
  renderGrid(sharedGrid, favoritePeopleData.shared);
  renderGrid(groomFamilyGrid, favoritePeopleData.groomFamily);
  renderGrid(groomFriendsGrid, favoritePeopleData.groomFriends);

  const coupleCardTrigger = document.getElementById('couple-card-trigger');
  if (coupleCardTrigger) {
    coupleCardTrigger.addEventListener('click', () => {
      openPersonModal({
        name: "Ashis & Ayaka",
        role: "The Bride & Groom",
        relationship: "The Happy Couple",
        avatarImg: "assets/guest piccs/facecover/IMG_2267.heic.jpg",
        togetherImg: "assets/guest piccs/bridegroom2shot.jpg",
        photos: ["assets/guest piccs/bridegroom2shot.jpg"],
        note: "Destiny had a plan we didn't see. First came the jokes, then came the roasts, petty arguments, easily forgiven, and days spent laughing until we couldn't breathe. Until the boy finally grew a pair... And the girl simply said yes."
      });
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* =========================================
   9. Wedding Invitation Cards Interactive Showcase
   ========================================= */
function initInvitationShowcase() {
  const section = document.getElementById('invitation-section');
  const deck = document.getElementById('invitation-deck');
  const toggleBtn = document.getElementById('toggle-cards-slide-btn');
  const tabPills = document.querySelectorAll('.invitation-tab-pill');
  const cardItems = document.querySelectorAll('.invitation-card-item');

  // Lightbox elements
  const lightbox = document.getElementById('invitation-lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-card-title');
  const lightboxClose = document.querySelector('.lightbox-close-btn');
  const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
  const lightboxPrev = document.getElementById('lightbox-prev-btn');
  const lightboxNext = document.getElementById('lightbox-next-btn');
  const lightboxCounter = document.getElementById('lightbox-counter');

  if (!section || !deck) return;

  // Invitation Card Data Array for Lightbox
  const cardsData = [
    {
      id: 'traditional',
      title: 'Traditional Wedding Reception (Oct 11, 2026)',
      src: 'assets/invitation/3.png'
    },
    {
      id: 'floral',
      title: 'Wedding Party & Celebration (Oct 12, 2026)',
      src: 'assets/invitation/8.png'
    },
    {
      id: 'std-en',
      title: 'Save The Date - English Calendar',
      src: 'assets/invitation/6.png'
    },
    {
      id: 'std-jp',
      title: 'Save The Date - Japanese Calendar',
      src: 'assets/invitation/7.png'
    }
  ];

  let currentCardIndex = 0;
  let isUnfolded = false;

  // Initial State: start stacked (3.png on top, others hidden directly behind)
  deck.classList.add('stacked');
  deck.classList.remove('unfolded');

  // IntersectionObserver: when user scrolls into view, trigger slide animation automatically
  let hasAnimatedOnce = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimatedOnce) {
        hasAnimatedOnce = true;
        setTimeout(() => {
          setUnfoldedState(true);
        }, 400);
      }
    });
  }, { threshold: 0.25 });

  observer.observe(section);

  function setUnfoldedState(unfolded) {
    isUnfolded = unfolded;
    if (isUnfolded) {
      deck.classList.remove('stacked');
      deck.classList.add('unfolded');
      if (toggleBtn) {
        toggleBtn.querySelector('.magic-label').innerText = 'Stack Cards Together';
      }
    } else {
      deck.classList.remove('unfolded', 'mode-all', 'mode-single');
      deck.classList.add('stacked');
      if (toggleBtn) {
        toggleBtn.querySelector('.magic-label').innerText = 'Slide Cards Apart';
      }
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (deck.classList.contains('unfolded') || deck.classList.contains('mode-all') || deck.classList.contains('mode-single')) {
        resetTabsTo('pair');
        setUnfoldedState(false);
      } else {
        resetTabsTo('pair');
        setUnfoldedState(true);
      }
    });
  }

  function resetTabsTo(targetTab) {
    tabPills.forEach(pill => {
      if (pill.dataset.tab === targetTab) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Filter Tabs Handler
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tab = pill.dataset.tab;
      tabPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      cardItems.forEach(card => card.classList.remove('focused-card'));

      if (tab === 'pair') {
        deck.className = 'invitation-deck unfolded';
        isUnfolded = true;
        if (toggleBtn) toggleBtn.querySelector('.magic-label').innerText = 'Stack Cards Together';
      } else if (tab === 'all') {
        deck.className = 'invitation-deck mode-all';
        isUnfolded = true;
        if (toggleBtn) toggleBtn.querySelector('.magic-label').innerText = 'Stack Cards Together';
      } else if (tab === 'reception') {
        deck.className = 'invitation-deck mode-single';
        const card = deck.querySelector('[data-card-id="traditional"]');
        if (card) card.classList.add('focused-card');
      } else if (tab === 'party') {
        deck.className = 'invitation-deck mode-single';
        const card = deck.querySelector('[data-card-id="floral"]');
        if (card) card.classList.add('focused-card');
      } else if (tab === 'savethedate') {
        deck.className = 'invitation-deck mode-all';
      }
    });
  });

  // Lightbox Modal Logic
  function openLightbox(index) {
    currentCardIndex = index;
    const card = cardsData[currentCardIndex];
    if (!card || !lightbox) return;

    lightboxImg.src = card.src;
    lightboxImg.alt = card.title;
    lightboxTitle.innerText = card.title;
    lightboxCounter.innerText = `${currentCardIndex + 1} / ${cardsData.length}`;

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % cardsData.length;
    openLightbox(currentCardIndex);
  }

  function prevCard() {
    currentCardIndex = (currentCardIndex - 1 + cardsData.length) % cardsData.length;
    openLightbox(currentCardIndex);
  }

  // Click card to open lightbox
  cardItems.forEach(item => {
    item.addEventListener('click', () => {
      const cardId = item.dataset.cardId;
      const index = cardsData.findIndex(c => c.id === cardId);
      if (index !== -1) {
        openLightbox(index);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextCard(); });
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevCard(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
  });
}


