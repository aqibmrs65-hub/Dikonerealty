/* ---- Cross-page helpers (multi-page site) ---- */
(() => {
  const PAGES = {
    top: 'index.html', headline: 'index.html', opportunities: 'index.html', developers: 'index.html', explore: 'index.html',
    vincitore: 'projects.html', 'emaar-profile': 'projects.html', 'emaar-oasis': 'projects.html', 'danube-doctors': 'projects.html',
    soma: 'projects.html', 'soma-pricing': 'projects.html', gem: 'projects.html', 'rak-central': 'projects.html', offer: 'projects.html',
    journey: 'process.html', planner: 'process.html', reel: 'process.html',
    contact: 'contact.html'
  };
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = (select, value) => {
    if (!select || !value) return;
    [...select.options].some(option => {
      if (option.value === value || option.text === value) { select.value = option.value || option.text; return true; }
      return false;
    });
  };
  const fillForm = (data) => {
    const form = document.getElementById('leadForm');
    if (!form) return false;
    pick(document.getElementById('interestField'), data.interest);
    pick(document.getElementById('developerField'), data.developer);
    const message = form.querySelector('textarea[name="message"]');
    if (message && data.message) message.value = data.message;
    return true;
  };
  /* Send an enquiry to the contact form: fill it here, or carry it to contact.html. */
  window.dikoneContact = (data = {}) => {
    if (fillForm(data)) {
      document.getElementById('contact')?.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
      window.setTimeout(() => document.getElementById('interestField')?.focus({ preventScroll: true }), motionOK ? 650 : 0);
      return;
    }
    try { sessionStorage.setItem('dikone_enquiry', JSON.stringify(data)); } catch (_) {}
    location.href = 'contact.html';
  };
  window.dikoneStoreEnquiry = (data = {}) => {
    try { sessionStorage.setItem('dikone_enquiry', JSON.stringify(data)); } catch (_) {}
  };
  /* On the contact page, pick up an enquiry that was started on another page. */
  try {
    const saved = sessionStorage.getItem('dikone_enquiry');
    if (saved && document.getElementById('leadForm')) {
      fillForm(JSON.parse(saved));
      sessionStorage.removeItem('dikone_enquiry');
    }
  } catch (_) {}
  /* In-page links like #soma or #contact: if that section lives on another page, go there. */
  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented) return;
    const id = link.getAttribute('href').slice(1);
    if (!id || id.indexOf('project-') === 0 || document.getElementById(id) || !PAGES[id]) return;
    event.preventDefault();
    location.href = PAGES[id] + (id === 'contact' || id === 'top' ? '' : '#' + id);
  });
})();

(() => {
  const body = document.body;
  const header = document.getElementById('siteHeader');
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.getElementById('mobileMenu');
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && motionOK) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const campaignNote = document.getElementById('campaignNote');
  if (campaignNote) {
    const end = new Date(campaignNote.dataset.campaignEnd);
    if (!Number.isNaN(end.getTime()) && Date.now() > end.getTime()) {
      campaignNote.classList.add('expired');
      campaignNote.lastElementChild.textContent = 'Campaign period ended — request the latest available incentives';
    }
  }

  const poster = document.getElementById('posterCard');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (poster && canHover && motionOK) {
    poster.addEventListener('pointermove', event => {
      const rect = poster.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      poster.style.transform = `rotateY(${x * 9}deg) rotateX(${y * -7}deg) translateY(-4px)`;
    });
    poster.addEventListener('pointerleave', () => { poster.style.transform = ''; });
  }

  const video = document.getElementById('developmentVideo');
  const videoToggle = document.getElementById('videoToggle');
  const phoneFrame = video?.closest('.phone-frame');
  if (video && videoToggle && phoneFrame) {
    const updateVideoUI = () => {
      const playing = !video.paused && !video.ended;
      phoneFrame.classList.toggle('playing', playing);
      videoToggle.innerHTML = `<span>${playing ? 'Ⅱ' : '▶'}</span>`;
      videoToggle.setAttribute('aria-label', playing ? 'Pause development reel' : 'Play development reel');
    };
    videoToggle.addEventListener('click', async () => {
      try {
        if (video.paused) await video.play(); else video.pause();
      } catch (error) {
        console.warn('Video playback was blocked by the browser.', error);
      }
      updateVideoUI();
    });
    video.addEventListener('play', updateVideoUI);
    video.addEventListener('pause', updateVideoUI);
    video.addEventListener('ended', updateVideoUI);
  }

  const vincitorePlayer = document.querySelector('[data-vincitore-player]');
  const vincitoreVideo = vincitorePlayer?.querySelector('video');
  const vincitoreToggle = vincitorePlayer?.querySelector('.vincitore-video-toggle');
  if (vincitorePlayer && vincitoreVideo && vincitoreToggle) {
    const updateVincitoreVideoUI = () => {
      const playing = !vincitoreVideo.paused && !vincitoreVideo.ended;
      vincitorePlayer.classList.toggle('playing', playing);
      vincitoreToggle.querySelector('span').textContent = playing ? 'Ⅱ' : '▶';
      vincitoreToggle.querySelector('small').textContent = playing ? 'Pause legacy film' : 'Play legacy film · 00:46';
      vincitoreToggle.setAttribute('aria-label', playing ? 'Pause the Vincitore legacy film' : 'Play the Vincitore legacy film');
    };
    vincitoreToggle.addEventListener('click', async () => {
      try {
        if (vincitoreVideo.paused) {
          document.querySelectorAll('video').forEach(media => { if (media !== vincitoreVideo) media.pause(); });
          await vincitoreVideo.play();
        } else {
          vincitoreVideo.pause();
        }
      } catch (error) {
        console.warn('Vincitore video playback was blocked by the browser.', error);
      }
      updateVincitoreVideoUI();
    });
    vincitoreVideo.addEventListener('play', updateVincitoreVideoUI);
    vincitoreVideo.addEventListener('pause', updateVincitoreVideoUI);
    vincitoreVideo.addEventListener('ended', updateVincitoreVideoUI);
  }

  const oasisPlayer = document.querySelector('[data-oasis-player]');
  const oasisVideo = oasisPlayer?.querySelector('video');
  const oasisToggle = oasisPlayer?.querySelector('.oasis-video-toggle');
  if (oasisPlayer && oasisVideo && oasisToggle) {
    const oasisToggleText = oasisToggle.querySelector('small');
    const oasisToggleIcon = oasisToggle.querySelector('span');
    const updateOasisVideoUI = () => {
      const playing = !oasisVideo.paused && !oasisVideo.ended;
      oasisPlayer.classList.toggle('playing', playing);
      if (oasisToggleIcon) oasisToggleIcon.textContent = playing ? 'Ⅱ' : '▶';
      if (oasisToggleText) oasisToggleText.textContent = playing ? 'Pause film' : 'Play film · 01:36';
      oasisToggle.setAttribute('aria-label', playing ? 'Pause The Oasis by Emaar film' : 'Play The Oasis by Emaar film');
    };
    const toggleOasisVideo = async () => {
      try {
        if (oasisVideo.paused) {
          document.querySelectorAll('video').forEach(media => { if (media !== oasisVideo) media.pause(); });
          await oasisVideo.play();
        } else {
          oasisVideo.pause();
        }
      } catch (error) {
        console.warn('The Oasis video playback was blocked by the browser.', error);
      }
      updateOasisVideoUI();
    };
    oasisToggle.addEventListener('click', event => {
      event.stopPropagation();
      toggleOasisVideo();
    });
    oasisVideo.addEventListener('click', toggleOasisVideo);
    oasisVideo.addEventListener('play', updateOasisVideoUI);
    oasisVideo.addEventListener('pause', updateOasisVideoUI);
    oasisVideo.addEventListener('ended', updateOasisVideoUI);
  }

  const oasisGalleryPlayer = document.querySelector('[data-oasis-gallery-player]');
  const oasisGalleryVideo = oasisGalleryPlayer?.querySelector('video');
  const oasisGalleryToggle = oasisGalleryPlayer?.querySelector('.oasis-gallery-toggle');
  if (oasisGalleryPlayer && oasisGalleryVideo && oasisGalleryToggle) {
    const galleryToggleText = oasisGalleryToggle.querySelector('small');
    const galleryToggleIcon = oasisGalleryToggle.querySelector('span');
    const updateOasisGalleryUI = () => {
      const playing = !oasisGalleryVideo.paused && !oasisGalleryVideo.ended;
      oasisGalleryPlayer.classList.toggle('playing', playing);
      if (galleryToggleIcon) galleryToggleIcon.textContent = playing ? 'Ⅱ' : '▶';
      if (galleryToggleText) galleryToggleText.textContent = playing ? 'Pause tour' : 'Play tour · 00:55';
      oasisGalleryToggle.setAttribute('aria-label', playing ? 'Pause the Emaar masterplan and residence gallery video' : 'Play the Emaar masterplan and residence gallery video');
    };
    oasisGalleryToggle.addEventListener('click', async event => {
      event.stopPropagation();
      try {
        if (oasisGalleryVideo.paused) {
          document.querySelectorAll('video').forEach(media => { if (media !== oasisGalleryVideo) media.pause(); });
          await oasisGalleryVideo.play();
        } else {
          oasisGalleryVideo.pause();
        }
      } catch (error) {
        console.warn('The Emaar gallery video playback was blocked by the browser.', error);
      }
      updateOasisGalleryUI();
    });
    oasisGalleryVideo.addEventListener('play', updateOasisGalleryUI);
    oasisGalleryVideo.addEventListener('pause', updateOasisGalleryUI);
    oasisGalleryVideo.addEventListener('ended', updateOasisGalleryUI);
  }

  const danubeGallery = document.querySelector('[data-danube-gallery]');
  if (danubeGallery) {
    const galleryImage = danubeGallery.querySelector('#danubeGalleryImage');
    const galleryCount = danubeGallery.querySelector('#danubeGalleryCount');
    const galleryTitle = danubeGallery.querySelector('#danubeGalleryTitle');
    const galleryThumbs = [...danubeGallery.querySelectorAll('.danube-thumb')];
    const galleryPrev = danubeGallery.querySelector('.danube-gallery-prev');
    const galleryNext = danubeGallery.querySelector('.danube-gallery-next');
    let galleryIndex = 0;

    const showDanubePage = index => {
      if (!galleryThumbs.length || !galleryImage) return;
      galleryIndex = (index + galleryThumbs.length) % galleryThumbs.length;
      const thumb = galleryThumbs[galleryIndex];
      galleryImage.style.opacity = '.35';
      const preloaded = new Image();
      preloaded.onload = () => {
        galleryImage.src = thumb.dataset.src;
        galleryImage.alt = `Danube Doctors' Offer brochure page ${galleryIndex + 1}`;
        galleryImage.style.opacity = '1';
      };
      preloaded.onerror = () => { galleryImage.style.opacity = '1'; };
      preloaded.src = thumb.dataset.src;
      if (galleryCount) galleryCount.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryThumbs.length).padStart(2, '0')}`;
      if (galleryTitle) galleryTitle.textContent = thumb.dataset.title || `Brochure page ${galleryIndex + 1}`;
      galleryThumbs.forEach((item, itemIndex) => {
        const active = itemIndex === galleryIndex;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      thumb.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'nearest', inline: 'center' });
    };

    galleryThumbs.forEach((thumb, index) => thumb.addEventListener('click', () => showDanubePage(index)));
    galleryPrev?.addEventListener('click', () => showDanubePage(galleryIndex - 1));
    galleryNext?.addEventListener('click', () => showDanubePage(galleryIndex + 1));
    danubeGallery.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showDanubePage(galleryIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showDanubePage(galleryIndex + 1); }
    });
  }

  const counters = document.querySelectorAll('[data-counter]');
  const runCounter = element => {
    const target = Number(element.dataset.counter);
    if (!Number.isFinite(target)) return;
    const prefix = element.dataset.counter.startsWith('0') && target < 10 ? '0' : '';
    const suffix = element.dataset.suffix || '';
    if (!motionOK) { element.textContent = `${prefix}${target}${suffix}`; return; }
    const start = performance.now();
    const duration = 1100;
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      element.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else counters.forEach(runCounter);


  const interestField = document.getElementById('interestField');
  const developerField = document.getElementById('developerField');
  const messageField = document.querySelector('#leadForm textarea[name="message"]');
  document.querySelectorAll('[data-enquiry]').forEach(link => {
    link.addEventListener('click', () => {
      const value = link.dataset.enquiry;
      if (!document.getElementById('leadForm')) window.dikoneStoreEnquiry({ interest: value, developer: link.dataset.projectDeveloper, message: link.dataset.message });
      if (interestField && [...interestField.options].some(option => option.value === value || option.text === value)) {
        interestField.value = value;
      }
      if (developerField && link.dataset.projectDeveloper && [...developerField.options].some(option => option.value === link.dataset.projectDeveloper || option.text === link.dataset.projectDeveloper)) {
        developerField.value = link.dataset.projectDeveloper;
      }
      if (messageField && link.dataset.message) messageField.value = link.dataset.message;
      if (link.classList.contains('soma-unit-row')) {
        document.getElementById('contact')?.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
        window.setTimeout(() => interestField?.focus({ preventScroll: true }), motionOK ? 650 : 0);
      }
    });
  });

  document.querySelectorAll('.developer-card[data-developer]').forEach(card => {
    card.addEventListener('click', () => {
      window.dikoneContact({ interest: 'Developer comparison', developer: card.dataset.developer });
    });
  });

  const towerZones = document.querySelectorAll('.tower-zone');
  const towerDetail = document.getElementById('towerDetail');
  const towerContent = {
    hotel: {
      range: '05–28',
      title: 'Hotel units',
      body: 'The main vertical accommodation component, positioned above the retail and amenity podium.'
    },
    amenity: {
      range: '04',
      title: 'Amenities + retail',
      body: 'A dedicated shared-experience level combining guest amenities with additional retail activity.'
    },
    retail: {
      range: 'G–03',
      title: 'Hotel retail podium',
      body: 'Ground through third floors are planned as retail within the hotel, supporting footfall and destination activity.'
    }
  };
  towerZones.forEach(zone => {
    zone.addEventListener('click', () => {
      const content = towerContent[zone.dataset.zone];
      if (!content || !towerDetail) return;
      towerZones.forEach(item => {
        const active = item === zone;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      towerDetail.innerHTML = `<span>${content.range}</span><div><strong>${content.title}</strong><p>${content.body}</p></div>`;
    });
  });

  const somaPlans = document.querySelectorAll('.soma-plan');
  const somaPlanDetail = document.getElementById('somaPlanDetail');
  const somaPlanContent = {
    20: {
      title: 'Standard launch structure',
      discount: '50 / 50 PAYMENT PLAN',
      body: 'Pay 20% as the down payment, with the remaining payment milestones following the supplied 50/50 structure.',
      note: 'Pricing and milestones remain subject to official booking documents.'
    },
    40: {
      title: 'Enhanced 4% price discount',
      discount: '50 / 50 · 4% PRICE DISCOUNT',
      body: 'Increase the down payment to 40% to access the client-supplied 4% price discount while retaining the 50/50 structure.',
      note: 'Discount application and eligibility require official confirmation.'
    },
    50: {
      title: 'Maximum 8% price discount',
      discount: '50 / 50 · 8% PRICE DISCOUNT',
      body: 'Use a 50% down payment to access the maximum client-supplied 8% price discount and the published maximum-discount price ranges.',
      note: 'Maximum-discount prices are indicative and subject to unit selection and official release.'
    }
  };
  somaPlans.forEach(plan => {
    plan.addEventListener('click', () => {
      const key = plan.dataset.somaPlan;
      const content = somaPlanContent[key];
      if (!content || !somaPlanDetail) return;
      somaPlans.forEach(item => {
        const active = item === plan;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      somaPlanDetail.innerHTML = `<div class="soma-plan-number"><span>DP</span><strong>${key}%</strong></div><div><span>${content.discount}</span><h4>${content.title}</h4><p>${content.body}</p><small>${content.note}</small></div>`;
    });
  });


  const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  const glow = document.getElementById('cursorGlow');
  if (glow && canHover && motionOK) {
    window.addEventListener('pointermove', event => {
      glow.style.opacity = '1';
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  }
})();

(() => {
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...document.querySelectorAll('[data-opportunity-card]')];
  const finder = document.getElementById('propertyFinder');
  const locationField = document.getElementById('finderLocation');
  const typeField = document.getElementById('finderType');
  const bedroomField = document.getElementById('finderBedrooms');
  const budgetField = document.getElementById('finderBudget');
  const chips = [...document.querySelectorAll('[data-opportunity-category]')];
  const resetButton = document.getElementById('opportunityReset');
  const resultCount = document.getElementById('opportunityResultCount');
  const emptyState = document.getElementById('opportunityEmpty');
  let categoryFilter = 'all';

  const tokenMatch = (value, filter) => filter === 'all' || String(value || '').split(/\s+/).includes(filter);
  const applyOpportunityFilters = () => {
    const location = locationField?.value || 'all';
    const type = typeField?.value || 'all';
    const bedroom = bedroomField?.value || 'all';
    const budget = budgetField?.value || 'all';
    let visible = 0;

    cards.forEach(card => {
      const matches = tokenMatch(card.dataset.location, location)
        && tokenMatch(card.dataset.type, type)
        && tokenMatch(card.dataset.bedrooms, bedroom)
        && tokenMatch(card.dataset.budget, budget)
        && tokenMatch(card.dataset.category, categoryFilter);
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? 'opportunity' : 'opportunities'} shown`;
    if (emptyState) emptyState.hidden = visible !== 0;
  };

  finder?.addEventListener('submit', event => {
    event.preventDefault();
    categoryFilter = 'all';
    chips.forEach(chip => {
      const active = chip.dataset.opportunityCategory === 'all';
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    applyOpportunityFilters();
    document.getElementById('opportunities')?.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
  });

  chips.forEach(chip => chip.addEventListener('click', () => {
    categoryFilter = chip.dataset.opportunityCategory || 'all';
    chips.forEach(item => {
      const active = item === chip;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyOpportunityFilters();
  }));

  resetButton?.addEventListener('click', () => {
    if (locationField) locationField.value = 'all';
    if (typeField) typeField.value = 'all';
    if (bedroomField) bedroomField.value = 'all';
    if (budgetField) budgetField.value = 'all';
    categoryFilter = 'all';
    chips.forEach(chip => {
      const active = chip.dataset.opportunityCategory === 'all';
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    applyOpportunityFilters();
  });

  [locationField, typeField, bedroomField, budgetField].forEach(field => field?.addEventListener('change', applyOpportunityFilters));
  applyOpportunityFilters();

  const selected = new Map();
  const drawer = document.getElementById('compareDrawer');
  const drawerCount = document.getElementById('compareDrawerCount');
  const drawerItems = document.getElementById('compareDrawerItems');
  const clearCompare = document.getElementById('clearCompare');
  const openCompare = document.getElementById('openCompare');
  const compareModal = document.getElementById('compareModal');
  const compareTable = document.getElementById('compareTable');
  const compareEnquire = document.getElementById('compareEnquire');
  let lastCompareTrigger = null;

  const updateCompareUI = () => {
    const count = selected.size;
    if (drawer) drawer.hidden = count === 0;
    document.body.classList.toggle('compare-active', count > 0);
    if (drawerCount) drawerCount.textContent = `${count} selected`;
    if (drawerItems) drawerItems.innerHTML = [...selected.values()].map(card => `<span>${card.dataset.title}</span>`).join('');

    cards.forEach(card => {
      const button = card.querySelector('[data-compare-card]');
      const active = selected.has(card.dataset.id);
      if (button) {
        button.setAttribute('aria-pressed', String(active));
        button.textContent = active ? '✓ Shortlisted' : '＋ Compare';
      }
    });
  };

  cards.forEach(card => card.querySelector('[data-compare-card]')?.addEventListener('click', event => {
    const id = card.dataset.id;
    if (!id) return;
    if (selected.has(id)) {
      selected.delete(id);
    } else if (selected.size < 3) {
      selected.set(id, card);
    } else {
      const button = event.currentTarget;
      const original = button.textContent;
      button.textContent = 'Maximum 3';
      window.setTimeout(() => { button.textContent = original; }, 1200);
      return;
    }
    updateCompareUI();
  }));

  const rows = [
    ['Opportunity', 'title'],
    ['Developer', 'developer'],
    ['Location', 'location'],
    ['Property type', 'type'],
    ['Bedrooms', 'bedrooms'],
    ['Price / offer', 'price'],
    ['Completion', 'completion']
  ];

  const readable = (key, value) => {
    if (key === 'location') return String(value || '').replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (key === 'type') return String(value || '').split(/\s+/).map(v => v.replace(/\b\w/g, c => c.toUpperCase())).join(' / ');
    if (key === 'bedrooms') return String(value || '').replace('4plus', '4+').split(/\s+/).join(', ');
    return value || 'Confirm current details';
  };

  const renderCompare = () => {
    if (!compareTable) return;
    const items = [...selected.values()];
    compareTable.style.setProperty('--compare-count', String(Math.max(items.length, 1)));
    compareTable.innerHTML = rows.map(([label, key]) => {
      const values = items.map(card => `<div class="compare-cell">${key === 'title' ? `<strong>${readable(key, card.dataset[key])}</strong>` : `<span>${readable(key, card.dataset[key])}</span>`}</div>`).join('');
      return `<div class="compare-cell label">${label}</div>${values}`;
    }).join('');
  };

  const setCompareModal = open => {
    if (!compareModal) return;
    compareModal.classList.toggle('open', open);
    compareModal.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('compare-modal-open', open);
    if (open) {
      renderCompare();
      compareModal.querySelector('button[data-close-compare]')?.focus();
    } else {
      lastCompareTrigger?.focus?.();
    }
  };

  openCompare?.addEventListener('click', event => {
    lastCompareTrigger = event.currentTarget;
    setCompareModal(true);
  });
  compareModal?.querySelectorAll('[data-close-compare]').forEach(button => button.addEventListener('click', () => setCompareModal(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && compareModal?.classList.contains('open')) setCompareModal(false);
  });
  clearCompare?.addEventListener('click', () => {
    selected.clear();
    updateCompareUI();
  });
  compareEnquire?.addEventListener('click', () => {
    const titles = [...selected.values()].map(card => card.dataset.title).join(', ');
    setCompareModal(false);
    window.dikoneContact({ interest: 'Developer comparison', message: `Please compare these shortlisted opportunities and share current availability, official prices, payment plans and suitability: ${titles}.` });
  });
  updateCompareUI();

  const priceInput = document.getElementById('financePrice');
  const downInput = document.getElementById('financeDown');
  const termInput = document.getElementById('financeTerm');
  const interestInput = document.getElementById('financeInterest');
  const priceLabel = document.getElementById('financePriceLabel');
  const downLabel = document.getElementById('financeDownLabel');
  const termLabel = document.getElementById('financeTermLabel');
  const interestLabel = document.getElementById('financeInterestLabel');
  const monthlyOutput = document.getElementById('financeMonthly');
  const downOutput = document.getElementById('financeDownAmount');
  const loanOutput = document.getElementById('financeLoanAmount');
  const money = value => `AED ${Math.round(value).toLocaleString('en-US')}`;
  const compactMoney = value => value >= 1000000 ? `AED ${(value / 1000000).toFixed(1)}M` : money(value);

  const updateFinance = () => {
    const price = Number(priceInput?.value || 0);
    const downPercent = Number(downInput?.value || 0);
    const years = Number(termInput?.value || 0);
    const annualRate = Number(interestInput?.value || 0);
    const downAmount = price * downPercent / 100;
    const principal = Math.max(price - downAmount, 0);
    const months = Math.max(years * 12, 1);
    const rate = annualRate / 100 / 12;
    const monthly = rate === 0 ? principal / months : principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);

    if (priceLabel) priceLabel.textContent = compactMoney(price);
    if (downLabel) downLabel.textContent = `${downPercent}%`;
    if (termLabel) termLabel.textContent = `${years} years`;
    if (interestLabel) interestLabel.textContent = `${annualRate.toFixed(1)}%`;
    if (monthlyOutput) monthlyOutput.textContent = money(monthly);
    if (downOutput) downOutput.textContent = money(downAmount);
    if (loanOutput) loanOutput.textContent = money(principal);
  };

  [priceInput, downInput, termInput, interestInput].forEach(input => input?.addEventListener('input', updateFinance));
  updateFinance();
})();

/* ========================================================================== 
   DIKONE REALTY — PREMIUM MOTION CONTROLLER
   Progressive enhancement only; all content remains usable without JS.
   ========================================================================== */
(() => {
  const body = document.body;
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Short, polished brand intro — shorter on repeat views in the same session. */
  let introFinished = false;
  const introStartedAt = performance.now();
  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;
    body.classList.add('is-ready');
    body.classList.remove('is-loading');
    try { sessionStorage.setItem('dikone_intro_seen', '1'); } catch (_) {}
  };
  let repeatVisit = false;
  try { repeatVisit = sessionStorage.getItem('dikone_intro_seen') === '1'; } catch (_) {}
  const minimumIntro = !motionOK ? 0 : (repeatVisit ? 180 : 1050);
  const finishAfterMinimum = () => {
    const remaining = Math.max(minimumIntro - (performance.now() - introStartedAt), 0);
    window.setTimeout(finishIntro, remaining);
  };
  window.addEventListener('load', finishAfterMinimum, { once: true });
  if (document.readyState === 'complete') finishAfterMinimum();
  window.setTimeout(finishIntro, 2400);

  /* Scroll progress line with one rAF per frame maximum. */
  const progressBar = document.getElementById('siteProgressBar');
  let scrollTicking = false;
  const updateProgress = () => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* Stagger related interface groups for a more deliberate entrance. */
  const staggerGroups = [
    '.developer-grid',
    '.opportunity-grid',
    '.journey-steps',
    '.vincitore-award-grid',
    '.vincitore-project-grid',
    '.oasis-feature-grid',
    '.danube-plan-grid',
    '.soma-highlights',
    '.property-grid',
    '.numbers-grid'
  ];
  staggerGroups.forEach(selector => {
    document.querySelectorAll(selector).forEach(group => {
      [...group.children].forEach((item, index) => {
        if (item.classList.contains('reveal')) item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
      });
    });
  });

  /* Section state powers elegant rule-draw animations and nav highlighting. */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('section-in-view', entry.isIntersecting);
        if (entry.isIntersecting && entry.intersectionRatio > .16) {
          const id = entry.target.id;
          navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
        }
      });
    }, { threshold: [0.08, 0.16, 0.35], rootMargin: '-12% 0px -58% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  if (!motionOK || !finePointer) return;

  /* Restrained 3D tilt: low angle, eased reset, disabled on touch and tablet. */
  const tiltTargets = document.querySelectorAll([
    '.developer-card',
    '.opportunity-card',
    '.journey-step',
    '.finance-calculator',
    '.area-navigator',
    '.advisor-identity-card',
    '.danube-plan-card',
    '.tower-explorer'
  ].join(','));

  tiltTargets.forEach(target => {
    target.addEventListener('pointermove', event => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      target.style.setProperty('--tilt-x', `${(-y * 3.2).toFixed(2)}deg`);
      target.style.setProperty('--tilt-y', `${(x * 3.8).toFixed(2)}deg`);
    });
    target.addEventListener('pointerleave', () => {
      target.style.setProperty('--tilt-x', '0deg');
      target.style.setProperty('--tilt-y', '0deg');
    });
  });

  /* Magnetic movement on only the primary conversion controls. */
  const magneticTargets = document.querySelectorAll('.nav-cta, .finder-submit, .hero-actions .button, .form-submit');
  magneticTargets.forEach(target => {
    target.addEventListener('pointermove', event => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      target.style.transform = `translate3d(${(x * .10).toFixed(1)}px, ${(y * .14).toFixed(1)}px, 0)`;
    });
    target.addEventListener('pointerleave', () => { target.style.transform = ''; });
  });

  /* Very slight image parallax while cards are hovered. */
  document.querySelectorAll('.opportunity-card').forEach(card => {
    const image = card.querySelector('.opportunity-media img');
    if (!image) return;
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      image.style.transform = `scale(1.075) translate3d(${(-x * 8).toFixed(1)}px, ${(-y * 6).toFixed(1)}px, 0)`;
    });
    card.addEventListener('pointerleave', () => { image.style.transform = ''; });
  });
})();
