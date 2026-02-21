/* ============================================================
   CÓCTEL LOUNGE - Main JS (GSAP & Lenis)
   ============================================================ */

document.addEventListener("DOMContentLoaded", (event) => {
  // Register Plugins
  gsap.registerPlugin(ScrollTrigger);

  /* ---- Initialize Lenis (Smooth Scroll) ---- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Get scroll value
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* ---- Custom Cursor ---- */
  const cursor = document.querySelector('.custom-cursor');
  const dot = document.querySelector('.cursor-dot');
  const label = document.querySelector('.cursor-label');

  // Track mouse
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor follow
  gsap.ticker.add(() => {
    // Lerp
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    // We apply transform via gsap for better perf
    gsap.set(cursor, { x: cursorX, y: cursorY });
  });

  // Handle magnetic links & hover states
  const magneticItems = document.querySelectorAll('.magnetic');

  magneticItems.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      cursor.classList.add('hovering');
      // Show label if data attribute exists
      const text = item.getAttribute('data-cursor-text');
      if (text) {
        label.textContent = text;
      } else {
        label.textContent = "";
      }
    });

    item.addEventListener('mouseleave', (e) => {
      cursor.classList.remove('hovering');
      label.textContent = "";
      // Reset magnetic transform
      gsap.to(item, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
    });

    item.addEventListener('mousemove', (e) => {
      // Magnetic pull logic
      const rect = item.getBoundingClientRect();
      const hX = (e.clientX - rect.left) - rect.width / 2;
      const hY = (e.clientY - rect.top) - rect.height / 2;

      gsap.to(item, {
        x: hX * 0.3, // Strength of pull
        y: hY * 0.3,
        duration: 0.5,
        ease: "power2.out"
      });
    });
  });

  /* ---- Initial Loader & Hero Sequence ---- */
  const masterTl = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove('loading');
    }
  });

  // 1. Progress Bar
  masterTl.to(".loader-progress-bar", {
    width: "100%",
    duration: 1.5,
    ease: "power3.inOut"
  })
    // 2. Hide Loader
    .to(".loader-overlay", {
      yPercent: -100,
      duration: 1.2,
      ease: "expo.inOut"
    }, "+=0.2")
    // 3. Reveal Hero Image Wrapper via clip-path
    .fromTo(".hero-media-wrapper",
      { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
      { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.5, ease: "expo.inOut" },
      "-=0.6"
    )
    // Scale down hero image slightly inside the wrapper
    .fromTo(".hero-media",
      { scale: 1.3 },
      { scale: 1, duration: 2, ease: "power3.out" },
      "-=1.5"
    )
    // 4. Stagger Texts
    .fromTo(".hero-title .split-words",
      { y: "110%" },
      { y: "0%", duration: 1, stagger: 0.15, ease: "expo.out" },
      "-=1.0"
    )
    .fromTo([".hero .eyebrow", ".hero-desc", ".hero-cta-group"],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out" },
      "-=0.6"
    );


  /* ---- Scroll Animations ---- */

  // Text Splits (h2, etc)
  const splitTitles = document.querySelectorAll('.section-title.split-words');
  splitTitles.forEach(title => {
    gsap.fromTo(title,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: title,
          start: "top 85%",
        }
      }
    );
  });

  const staggerUps = document.querySelectorAll('.stagger-up');
  staggerUps.forEach(elem => {
    gsap.fromTo(elem,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2,
        scrollTrigger: {
          trigger: elem,
          start: "top 90%"
        }
      }
    );
  });

  // Parallax Images in About
  const parallaxDoms = document.querySelectorAll('.parallax-img-wrapper');
  parallaxDoms.forEach(wrapper => {
    const img = wrapper.querySelector('.img-placeholder');
    // Reveal Mask
    gsap.to(wrapper, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      ease: "power3.inOut",
      scrollTrigger: {
        trigger: wrapper,
        start: "top 85%",
        end: "top 50%",
        scrub: 1
      }
    });
  });

  // Menu Hover Image Logic
  const menuRows = document.querySelectorAll('.menu-row');
  const hoverImgContainer = document.querySelector('.menu-hover-image');
  const hoverImgInners = document.querySelectorAll('.hover-img-inner');

  menuRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      // 1. Change active image
      const bgName = row.getAttribute('data-image');
      hoverImgInners.forEach(img => {
        if (img.classList.contains(bgName)) {
          img.classList.add('active');
        } else {
          img.classList.remove('active');
        }
      });
      // 2. Show container
      hoverImgContainer.classList.add('active');
      cursor.classList.add('hovering');
      label.textContent = "View";
    });

    row.addEventListener('mousemove', (e) => {
      // Move floating img slightly behind cursor
      gsap.to(hoverImgContainer, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out"
      });
    });

    row.addEventListener('mouseleave', () => {
      hoverImgContainer.classList.remove('active');
      cursor.classList.remove('hovering');
      label.textContent = "";
    });
  });


  // Horizontal Scroll (Reviews)
  const hc = document.querySelector('.horizontal-scroll-container');
  const track = document.querySelector('.horizontal-track');

  // Calculate how far we need to move the track
  function getScrollAmount() {
    let trackWidth = track.scrollWidth;
    return -(trackWidth - window.innerWidth + 100); // 100px padding
  }

  const tween = gsap.to(track, {
    x: getScrollAmount,
    ease: "none"
  });

  ScrollTrigger.create({
    trigger: ".reviews-section",
    start: "top top",
    end: () => `+=${getScrollAmount() * -1}`, // The distance to scroll matches the track width
    pin: true,
    animation: tween,
    scrub: 1,
    invalidateOnRefresh: true
  });

});
