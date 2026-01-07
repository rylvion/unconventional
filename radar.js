let AbilitiesData = {};
let TagsData = {};
let compareMode = false;
let multiCompareMode = false;
let multiCompareList = []; // Array to store selected abilities for multi-compare
let favorites = []; // Array to store favorite ability keys (tier::ability)
let recent = []; // Array to store recent ability keys (max 5, tier::ability)

const abilitySelect = document.getElementById('abilitySelect');
const levelSelect = document.getElementById('levelSelect');
const ampModeSelect = document.getElementById('ampModeSelect');

const abilitySelect2 = document.getElementById('abilitySelect2');
const levelSelect2 = document.getElementById('levelSelect2');
const ampModeSelect2 = document.getElementById('ampModeSelect2');

const statsDisplay = document.getElementById('statsDisplay');
const compareToggle = document.getElementById('compareToggle');
const compareControls = document.querySelector('.controls.compare');

const ctx = document.getElementById('radarChart').getContext('2d');
const radarChart = new Chart(ctx, {
  type: 'radar',
  data: { labels: [], datasets: [] },
  options: { 
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    scales: { r: { suggestedMin: 0, suggestedMax: 10, ticks: { stepSize: 2 } } }
  }
});

// Progression Chart for level-by-level stat progression
const progressionCtx = document.getElementById('progressionChart').getContext('2d');
const progressionChart = new Chart(progressionCtx, {
  type: 'bar',
  data: { labels: [], datasets: [] },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 500,
      easing: 'easeInOutQuart'
    },
    indexAxis: 'x',
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2 }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        borderRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 12 }
      }
    }
  }
});

// Stats Distribution Chart (histogram of filtered abilities)
const distributionCtx = document.getElementById('distributionChart').getContext('2d');
const distributionChart = new Chart(distributionCtx, {
  type: 'bar',
  data: { labels: [], datasets: [] },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 400, easing: 'easeInOutQuart' },
    scales: {
      x: {
        stacked: false,
        ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Count' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 15, font: { size: 12 } },
        onClick(e, legendItem, legend) {
          const chart = legend.chart;
          // Synthetic 'Selected' item collapses all overlay datasets together
          if (legendItem && legendItem.text === 'Selected') {
            const overlayIdxs = chart.data.datasets
              .map((ds, i) => ({ ds, i }))
              .filter(({ ds }) => ds && typeof ds.label === 'string' && ds.label.startsWith('Selected '))
              .map(({ i }) => i);
            const anyVisible = overlayIdxs.some(idx => chart.isDatasetVisible(idx));
            overlayIdxs.forEach(idx => chart.setDatasetVisibility(idx, !anyVisible));
            chart.update();
          } else {
            // Default toggle behavior
            const index = legendItem.datasetIndex;
            if (typeof index === 'number') {
              chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
              chart.update();
            }
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: 10,
        borderRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 12 }
      }
    }
  }
});

// Legend generateLabels collapsed 'Selected' overlay entry (init-time, avoids reactive recursion)
if (Chart && Chart.defaults && Chart.defaults.plugins && Chart.defaults.plugins.legend) {
  const baseGenerate = Chart.defaults.plugins.legend.labels.generateLabels;
  Chart.defaults.plugins.legend.labels.generateLabels = function(chart) {
    const original = baseGenerate ? baseGenerate(chart) : [];
    try {
      const overlayIdxs = [];
      const labels = [];
      original.forEach((lbl) => {
        const idx = lbl.datasetIndex;
        const ds = chart.data.datasets[idx];
        const text = lbl.text || (ds && ds.label) || '';
        if (ds && typeof text === 'string' && text.startsWith('Selected ')) {
          overlayIdxs.push(idx);
        } else {
          labels.push(lbl);
        }
      });
      if (overlayIdxs.length) {
        const anyVisible = overlayIdxs.some(idx => chart.isDatasetVisible(idx));
        labels.push({
          text: 'Selected',
          fillStyle: 'rgba(16, 185, 129, 0.45)',
          strokeStyle: 'rgba(16, 185, 129, 0.9)',
          lineWidth: 2,
          datasetIndex: -1,
          hidden: !anyVisible
        });
      }
      return labels;
    } catch (e) {
      return original;
    }
  };
}

function updateChartColors() {
  const isDark = document.body.classList.contains('dark-mode');

  radarChart.data.datasets.forEach((dataset, i) => {
    if (i === 0) { 
      // First dataset (blue)
      dataset.borderColor = isDark ? 'rgba(100,200,255,1)' : 'rgba(3,102,214,1)';
      dataset.backgroundColor = isDark ? 'rgba(100,200,255,0.25)' : 'rgba(3,102,214,0.15)';
      dataset.pointBackgroundColor = isDark ? 'rgba(100,200,255,1)' : 'rgba(3,102,214,1)';
      dataset.pointBorderColor = isDark ? '#1a1a2e' : '#fff';
    } else {
      // Second dataset (red)
      dataset.borderColor = isDark ? 'rgba(255,120,140,1)' : 'rgba(255,99,132,1)';
      dataset.backgroundColor = isDark ? 'rgba(255,120,140,0.25)' : 'rgba(255,99,132,0.15)';
      dataset.pointBackgroundColor = isDark ? 'rgba(255,120,140,1)' : 'rgba(255,99,132,1)';
      dataset.pointBorderColor = isDark ? '#1a1a2e' : '#fff';
    }
  });

  radarChart.options.scales.r = {
    suggestedMin: 0,
    suggestedMax: 10,
    ticks: {
      stepSize: 2,
      color: isDark ? '#b0b0b0' : '#666',
      backdropColor: 'transparent',
      font: {
        size: 12,
        weight: '500'
      }
    },
    grid: {
      color: isDark ? '#404050' : '#ddd',
      lineWidth: isDark ? 1.2 : 1
    },
    angleLines: {
      color: isDark ? '#404050' : '#ddd',
      lineWidth: isDark ? 1.2 : 1
    },
    pointLabels: {
      color: isDark ? '#e8e8e8' : '#333',
      font: {
        size: 14,
        weight: '600'
      },
      padding: isDark ? 10 : 8
    }
  };

  radarChart.options.plugins.legend = {
    labels: {
      color: isDark ? '#e8e8e8' : '#333',
      font: {
        size: 13,
        weight: '500'
      },
      padding: 15,
      usePointStyle: true,
      pointStyle: 'circle'
    }
  };

  radarChart.options.plugins.tooltip = {
    backgroundColor: isDark ? '#2a2a3e' : '#fff',
    titleColor: isDark ? '#e8e8e8' : '#000',
    bodyColor: isDark ? '#d0d0d0' : '#000',
    borderColor: isDark ? '#505060' : '#ccc',
    borderWidth: 1,
    padding: 12,
    titleFont: { size: 13, weight: 'bold' },
    bodyFont: { size: 12 },
    displayColors: true,
    callbacks: {
      labelColor: function(context) {
        return {
          borderColor: isDark ? '#505060' : '#999',
          backgroundColor: context.dataset.backgroundColor
        };
      }
    }
  };

  radarChart.update();

  // Update progression chart colors
  if (progressionChart && progressionChart.data.datasets.length > 0) {
    progressionChart.options.scales.y.ticks.color = isDark ? '#b0b0b0' : '#666';
    progressionChart.options.scales.y.grid.color = isDark ? '#404050' : '#e5e5e5';
    progressionChart.options.scales.x.ticks.color = isDark ? '#b0b0b0' : '#666';
    progressionChart.options.scales.x.grid.color = isDark ? '#404050' : '#e5e5e5';
    
    progressionChart.options.plugins.legend.labels.color = isDark ? '#e8e8e8' : '#333';
    progressionChart.options.plugins.tooltip.backgroundColor = isDark ? '#2a2a3e' : '#fff';
    progressionChart.options.plugins.tooltip.titleColor = isDark ? '#e8e8e8' : '#000';
    progressionChart.options.plugins.tooltip.bodyColor = isDark ? '#d0d0d0' : '#000';
    progressionChart.options.plugins.tooltip.borderColor = isDark ? '#505060' : '#ccc';
    
    progressionChart.update();
  }

  // Update distribution chart colors
  if (distributionChart && distributionChart.data.datasets.length > 0) {
    distributionChart.options.scales.y.ticks.color = isDark ? '#b0b0b0' : '#666';
    distributionChart.options.scales.y.grid.color = isDark ? '#404050' : '#e5e5e5';
    distributionChart.options.scales.x.ticks.color = isDark ? '#b0b0b0' : '#666';
    distributionChart.options.scales.x.grid.color = isDark ? '#404050' : '#e5e5e5';

    distributionChart.options.plugins.legend.labels.color = isDark ? '#e8e8e8' : '#333';
    distributionChart.options.plugins.tooltip.backgroundColor = isDark ? '#2a2a3e' : '#fff';
    distributionChart.options.plugins.tooltip.titleColor = isDark ? '#e8e8e8' : '#000';
    distributionChart.options.plugins.tooltip.bodyColor = isDark ? '#d0d0d0' : '#000';
    distributionChart.options.plugins.tooltip.borderColor = isDark ? '#505060' : '#ccc';

    distributionChart.update();
  }
}

const darkModeToggle = document.getElementById('darkModeToggle');

// Load preferences from localStorage
function loadPreferences() {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  const savedAbility1 = localStorage.getItem('ability1');
  const savedLevel1 = localStorage.getItem('level1');
  const savedAmp1 = localStorage.getItem('amp1');
  
  return { savedAbility1, savedLevel1, savedAmp1 };
}

// Save preferences to localStorage
function savePreferences() {
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  localStorage.setItem('ability1', abilitySelect.value);
  localStorage.setItem('level1', levelSelect.value);
  localStorage.setItem('amp1', ampModeSelect.value);
}

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  updateChartColors();
  savePreferences();
});

console.log('Loading abilities.json and tags.json...');

// Load both JSON files
Promise.all([
  fetch('abilities.json').then(res => res.ok ? res.json() : Promise.reject('abilities.json not found')),
  fetch('tags.json').then(res => res.ok ? res.json() : Promise.reject('tags.json not found'))
])
  .then(([abilitiesData, tagsData]) => {
    AbilitiesData = abilitiesData;
    TagsData = tagsData;
    console.log('Abilities data loaded:', AbilitiesData);
    console.log('Tags data loaded:', TagsData);

    // Load favorites from LocalStorage
    loadFavorites();
    
    // Load recent abilities from LocalStorage
    loadRecent();

    const prefs = loadPreferences();
    populateAbilities();
    populateAbilities(abilitySelect2);
    populateAbilities(multiCompareAbilitySelect);
    
    // Load from URL first, then localStorage
    // Both functions now call updateChart() with setTimeout
    const stateLoaded = loadStateFromURL() || restoreFromPreferences(prefs);
    
    // If nothing was loaded from URL or prefs, call updateChart() now
    if (!stateLoaded) {
      updateChart();
    }
    
    // Update chart colors to match current theme
    updateChartColors();
    
    // Setup advanced filters after data is loaded
    setupAdvancedFilters();

    // Initialize distribution chart tier selector and chart
    updateDistributionTierSelect();
    updateStatDistributionChart();
  })
  .catch(err => console.error('Error loading data:', err));function populateAbilities(selectEl = abilitySelect) {
  if (!AbilitiesData || Object.keys(AbilitiesData).length === 0) {
    console.warn('AbilitiesData is empty!');
    return;
  }

  selectEl.innerHTML = '';

  Object.keys(AbilitiesData).forEach(tier => {
    if (tier === '_meta') return;

    const optgroup = document.createElement('optgroup');
    optgroup.label = tier;

    Object.keys(AbilitiesData[tier]).forEach(ability => {
      if (ability === '_meta') return;

      const option = document.createElement('option');
      option.value = tier + '::' + ability;
      option.textContent = ability;
      optgroup.appendChild(option);
    });

    selectEl.appendChild(optgroup);
  });

  selectEl.selectedIndex = 0;
  console.log('Populated ability select:', selectEl.id);
  populateLevels(selectEl);
}


function populateLevels(selectEl = abilitySelect, targetLevelSelect = null) {
  const [tier, ability] = selectEl.value?.split('::') || [];
  
  // Determine which level select to populate
  let levelSelectEl;
  if (targetLevelSelect) {
    levelSelectEl = targetLevelSelect;
  } else if (selectEl === abilitySelect) {
    levelSelectEl = levelSelect;
  } else if (selectEl === abilitySelect2) {
    levelSelectEl = levelSelect2;
  } else if (selectEl === multiCompareAbilitySelect) {
    levelSelectEl = document.getElementById('multiCompareLevelSelect');
  } else {
    levelSelectEl = levelSelect;
  }

  if (!tier || !ability || !AbilitiesData[tier][ability] || !AbilitiesData[tier][ability].levels) {
    console.warn(`Cannot populate levels: tier=${tier}, ability=${ability}`);
    return;
  }

  levelSelectEl.innerHTML = '';

  const abilityData = AbilitiesData[tier][ability];
  const levelsData = abilityData.levels;

  if (ability === 'Phase Shift' && typeof levelsData === 'object' && !Array.isArray(levelsData)) {
    Object.keys(levelsData).forEach(form => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = form;

      const levels = Object.keys(levelsData[form])
        .map(parseFloat)
        .sort((a, b) => a - b);

      levels.forEach(level => {
        const option = document.createElement('option');
        option.value = `${form}::${level.toFixed(1)}`;
        option.textContent = level.toFixed(1);
        optgroup.appendChild(option);
      });

      levelSelectEl.appendChild(optgroup);
    });
  } 
  else {
    const levels = Object.keys(levelsData)
      .map(parseFloat)
      .sort((a, b) => a - b);

    levels.forEach(level => {
      const option = document.createElement('option');
      option.value = level.toFixed(1);
      option.textContent = level.toFixed(1);
      levelSelectEl.appendChild(option);
    });
  }

  levelSelectEl.selectedIndex = 0;
  console.log(`Populated levels for ${ability}:`, levelSelectEl);
  updateChart();
}


function getStats(tier, ability, level, mode) {
  const abilityData = AbilitiesData?.[tier]?.[ability];
  if (!abilityData || !abilityData.levels) {
    console.warn(`Stats not found: ${tier} ${ability} ${level}`);
    return null;
  }

  let stats;

  if (ability === 'Phase Shift' && typeof level === 'string' && level.includes('::')) {
    const [form, lvl] = level.split('::');
    stats = abilityData.levels?.[form]?.[lvl];
    if (!stats) {
      console.warn(`Stats not found: ${tier} ${ability} ${form}::${lvl}`);
      return null;
    }
  } else {
    stats = abilityData.levels?.[level];
    if (!stats) {
      console.warn(`Stats not found: ${tier} ${ability} ${level}`);
      return null;
    }
  }

  stats = { ...stats };
  if (mode === 'amped') Object.keys(stats).forEach(k => stats[k] = parseFloat(stats[k] * 1.5).toFixed(1));
  if (mode === 'deamped') Object.keys(stats).forEach(k => stats[k] = parseFloat(stats[k] / 2).toFixed(1));

  console.log(`Stats for ${ability} (${mode}):`, stats);
  return stats;
}


function updateChart() {
  console.log('Updating chart...');

  const isDark = document.body.classList.contains('dark-mode');

  const [tier, ability] = abilitySelect.value.split('::');
  const level = levelSelect.value;
  const mode = ampModeSelect.value;

  const stats1 = getStats(tier, ability, level, mode);
  if (!stats1) return;
  
  // Track this ability in recent
  const abilityKey = tier + '::' + ability;
  addToRecent(abilityKey);
  
  // Save state to localStorage and URL
  savePreferences();
  updateURL();

  let displayAbility = ability;
  if (ability === 'Phase Shift' && level.includes('::')) {
    const [form] = level.split('::');
    displayAbility = `${ability} (${form})`;
  }

  const labels = ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'];
  const dataValues1 = [stats1.Pow, stats1.Spd, stats1.Trick, stats1.Recv, stats1.Def];

  radarChart.data.labels = labels;

  // Build datasets array based on mode
  if (multiCompareMode && multiCompareList.length > 0) {
    // Multi-compare: show all abilities from the list
    const colors = [
      { bg: 'rgba(59, 130, 246, 0.25)', border: 'rgba(59, 130, 246, 1)' },
      { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 1)' },
      { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(16, 185, 129, 1)' },
      { bg: 'rgba(251, 191, 36, 0.25)', border: 'rgba(251, 191, 36, 1)' },
      { bg: 'rgba(139, 92, 246, 0.25)', border: 'rgba(139, 92, 246, 1)' },
      { bg: 'rgba(236, 72, 153, 0.25)', border: 'rgba(236, 72, 153, 1)' }
    ];
    
    radarChart.data.datasets = multiCompareList.map((item, index) => {
      const stats = getStats(item.tier, item.ability, item.level, item.amp);
      const color = colors[index % colors.length];
      return {
        label: `${item.ability} (Lvl ${item.level}, ${item.amp})`,
        data: [stats.Pow, stats.Spd, stats.Trick, stats.Recv, stats.Def],
        fill: true,
        backgroundColor: color.bg,
        borderColor: color.border,
        pointBackgroundColor: color.border,
        pointRadius: 4,
        borderWidth: 2
      };
    });
  } else {
    // Normal or single compare mode
    radarChart.data.datasets = [{
      label: `${displayAbility} (${mode})`,
      data: dataValues1,
      fill: true,
      backgroundColor: isDark ? 'rgba(100,180,255,0.2)' : 'rgba(3,102,214,0.25)',
      borderColor: isDark ? 'rgba(100,180,255,1)' : 'rgba(3,102,214,1)',
      pointBackgroundColor: isDark ? 'rgba(100,180,255,1)' : 'rgba(3,102,214,1)',
      pointRadius: 4,
      borderWidth: 2
    }];
  }

  let stats2 = null, ability2 = null, displayAbility2 = null, mode2 = null;

  if (compareMode) {
    const [tier2, ab2] = abilitySelect2.value.split('::');
    const level2 = levelSelect2.value;
    mode2 = ampModeSelect2.value;
    stats2 = getStats(tier2, ab2, level2, mode2);
    ability2 = ab2;

    if (stats2) {
      displayAbility2 = ab2;
      if (ab2 === 'Phase Shift' && level2.includes('::')) {
        const [form2] = level2.split('::');
        displayAbility2 = `${ab2} (${form2})`;
      }

      const dataValues2 = [stats2.Pow, stats2.Spd, stats2.Trick, stats2.Recv, stats2.Def];

      radarChart.data.datasets.push({
        label: `${displayAbility2} (${mode2})`,
        data: dataValues2,
        fill: true,
        backgroundColor: isDark ? 'rgba(255,130,150,0.2)' : 'rgba(255,99,132,0.25)',
        borderColor: isDark ? 'rgba(255,130,150,1)' : 'rgba(255,99,132,1)',
        pointBackgroundColor: isDark ? 'rgba(255,130,150,1)' : 'rgba(255,99,132,1)',
        pointRadius: 3,
        borderWidth: 2
      });
    }
  }

  radarChart.options.plugins.tooltip = { enabled: true };
  radarChart.update();
  updateProgressionChart();

  // Only show individual stats display when not in multi-compare mode
  if (multiCompareMode && multiCompareList.length > 0) {
    document.getElementById('statsDisplay').style.display = 'none';
  } else {
    document.getElementById('statsDisplay').style.display = 'block';
    renderStatsCompare(stats1, stats2, displayAbility, displayAbility2);
  }

  if (compareMode && stats2) renderComparison(stats1, stats2, displayAbility, displayAbility2);
  else if (multiCompareMode && multiCompareList.length > 0) renderMultiComparison();
  else document.getElementById('comparisonSummary').classList.add('hidden');
}


function renderStatsCompare(statsA, statsB, nameA, nameB) {
  const [tier, ability] = abilitySelect.value.split('::');
  const abilityData = AbilitiesData?.[tier]?.[ability];
  const iconPath = abilityData?.assets?.icon || '';
  
  // Get ability GIFs
  const abilityGifs = abilityData?.assets || {};
  const gifs = [];
  if (abilityGifs.f && Array.isArray(abilityGifs.f)) gifs.push(...abilityGifs.f);
  if (abilityGifs.r && Array.isArray(abilityGifs.r)) gifs.push(...abilityGifs.r);
  if (abilityGifs.t && Array.isArray(abilityGifs.t)) gifs.push(...abilityGifs.t);
  if (abilityGifs.g && Array.isArray(abilityGifs.g)) gifs.push(...abilityGifs.g);
  if (abilityGifs.passive && Array.isArray(abilityGifs.passive)) gifs.push(...abilityGifs.passive);
  
  let tier2, ability2, abilityData2, iconPath2;
  let gifs2 = [];
  if (statsB) {
    [tier2, ability2] = abilitySelect2.value.split('::');
    abilityData2 = AbilitiesData?.[tier2]?.[ability2];
    iconPath2 = abilityData2?.assets?.icon || '';
    
    const abilityGifs2 = abilityData2?.assets || {};
    if (abilityGifs2.f && Array.isArray(abilityGifs2.f)) gifs2.push(...abilityGifs2.f);
    if (abilityGifs2.r && Array.isArray(abilityGifs2.r)) gifs2.push(...abilityGifs2.r);
    if (abilityGifs2.t && Array.isArray(abilityGifs2.t)) gifs2.push(...abilityGifs2.t);
    if (abilityGifs2.g && Array.isArray(abilityGifs2.g)) gifs2.push(...abilityGifs2.g);
    if (abilityGifs2.passive && Array.isArray(abilityGifs2.passive)) gifs2.push(...abilityGifs2.passive);
  }
  
  // Calculate totals
  const totalA = Object.values(statsA).reduce((sum, val) => sum + parseFloat(val), 0);
  const avgA = (totalA / 5).toFixed(1);
  
  const abilityKeyA = tier + '::' + ability;
  const isFavA = isFavorite(abilityKeyA);
  
  const containerClass = statsB ? 'stats-cards-container' : 'stats-cards-container single-card';
  let html = `<div class="${containerClass}">`;

  html += `<div class="stats-card stats-card-blue">
    <button class="ability-favorite-btn ${isFavA ? 'favorited' : 'unfavorited'}" data-ability-key="${abilityKeyA}" onclick="toggleFavorite('${abilityKeyA}'); updateFavoriteUI();">
      ${isFavA ? '⭐' : '☆'}
    </button>
    ${iconPath ? `<img src="${iconPath}" alt="${nameA} icon" class="ability-icon" onerror="this.style.display='none'">` : ''}
    <h3>${nameA}</h3>`;
  Object.keys(statsA).forEach(key => {
    html += `<div><strong>${key}:</strong> <span>${statsA[key]}</span></div>`;
  });
  html += `<div class="stat-total"><strong>Total:</strong> <span>${totalA.toFixed(1)}</span></div>`;
  html += `<div class="stat-avg"><strong>Average:</strong> <span>${avgA}</span></div>`;
  
  // Add GIFs gallery for ability 1
  if (gifs.length > 0) {
    html += `<details class="ability-gifs-section">
      <summary>🎬 Ability Previews (${gifs.length})</summary>
      <div class="gifs-gallery">
        ${gifs.map(gif => `<img src="${gif}" alt="${nameA} ability" class="ability-gif" loading="lazy" onerror="this.style.display='none'">`).join('')}
      </div>
    </details>`;
  }
  
  html += `</div>`;

  if (statsB) {
    const totalB = Object.values(statsB).reduce((sum, val) => sum + parseFloat(val), 0);
    const avgB = (totalB / 5).toFixed(1);
    
    const abilityKeyB = tier2 + '::' + ability2;
    const isFavB = isFavorite(abilityKeyB);
    
    html += `<div class="stats-card stats-card-red">
      <button class="ability-favorite-btn ${isFavB ? 'favorited' : 'unfavorited'}" data-ability-key="${abilityKeyB}" onclick="toggleFavorite('${abilityKeyB}'); updateFavoriteUI();">
        ${isFavB ? '⭐' : '☆'}
      </button>
      ${iconPath2 ? `<img src="${iconPath2}" alt="${nameB} icon" class="ability-icon" onerror="this.style.display='none'">` : ''}
      <h3>${nameB}</h3>`;
    Object.keys(statsB).forEach(key => {
      html += `<div><strong>${key}:</strong> <span>${statsB[key]}</span></div>`;
    });
    html += `<div class="stat-total"><strong>Total:</strong> <span>${totalB.toFixed(1)}</span></div>`;
    html += `<div class="stat-avg"><strong>Average:</strong> <span>${avgB}</span></div>`;
    
    // Add GIFs gallery for ability 2
    if (gifs2.length > 0) {
      html += `<details class="ability-gifs-section">
        <summary>🎬 Ability Previews (${gifs2.length})</summary>
        <div class="gifs-gallery">
          ${gifs2.map(gif => `<img src="${gif}" alt="${nameB} ability" class="ability-gif" loading="lazy" onerror="this.style.display='none'">`).join('')}
        </div>
      </details>`;
    }
    
    html += `</div>`;
  }

  html += `</div>`;
  
  // Add metadata for both abilities in compare mode
  if (abilityData?._meta) {
    const wrapperClass = (statsB && abilityData2?._meta) ? 'metadata-wrapper' : 'metadata-wrapper single-mode';
    html += `<div class="${wrapperClass}">`;
    html += `<div class="metadata-column">`;
    html += renderMetadata(abilityData._meta, nameA);
    html += `</div>`;
    
    if (statsB && abilityData2?._meta) {
      html += `<div class="metadata-column">`;
      html += renderMetadata(abilityData2._meta, nameB);
      html += `</div>`;
    }
    html += `</div>`;
  }
  
  // Preserve open state of details elements before updating
  const openStates = saveDetailsStates(statsDisplay);
  statsDisplay.innerHTML = html;
  restoreDetailsStates(statsDisplay, openStates);
  
  // Add click handlers for GIF expansion
  document.querySelectorAll('.ability-gif').forEach(gif => {
    gif.addEventListener('click', () => openGifModal(gif.src, gif.alt));
  });
}

function renderComparison(statsA, statsB, nameA, nameB) {
  const compDiv = document.getElementById('comparisonSummary');
  compDiv.classList.remove('hidden');

  const categories = ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'];
  let table = `
    <h3>Comparison Summary</h3>
    <table>
      <thead>
        <tr><th>Stat</th><th>${nameA}</th><th>${nameB}</th><th>Diff</th></tr>
      </thead><tbody>
  `;
  const keyMap = {
  'Power': 'Pow',
  'Speed': 'Spd',
  'Trick': 'Trick',
  'Recovery': 'Recv',
  'Defense': 'Def'
};

  categories.forEach(stat => {
    const key = keyMap[stat];
    const valA = parseFloat(statsA[key]);
    const valB = parseFloat(statsB[key]);
    const diff = (valA - valB).toFixed(1);
    const color = diff > 0 ? 'green' : diff < 0 ? 'red' : 'gray';

    table += `
      <tr>
        <td>${stat}</td>
        <td>${valA}</td>
        <td>${valB}</td>
        <td style="color:${color};">${diff > 0 ? '+' + diff : diff}</td>
      </tr>
    `;
  });

  table += `</tbody></table>`;
  compDiv.innerHTML = table;
}

function renderMultiComparison() {
  const compDiv = document.getElementById('comparisonSummary');
  compDiv.classList.remove('hidden');
  
  if (multiCompareList.length === 0) {
    compDiv.classList.add('hidden');
    return;
  }

  const categories = ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'];
  const keyMap = {
    'Power': 'Pow',
    'Speed': 'Spd',
    'Trick': 'Trick',
    'Recovery': 'Recv',
    'Defense': 'Def'
  };

  // Collect stats for all abilities
  const allStats = [];
  multiCompareList.forEach(item => {
    const stats = getStats(item.tier, item.ability, item.level, item.amp);
    allStats.push({
      name: `${item.ability} (Lvl ${item.level})`,
      stats: stats
    });
  });

  // Build table header
  const colCount = allStats.length;
  let table = `
    <h3>Multi-Comparison Summary</h3>
    <table class="multi-compare-table" style="--mc-cols:${colCount};">
      <thead>
        <tr><th>Stat</th>${allStats.map((s, i) => `<th>${s.name}</th>`).join('')}</tr>
      </thead><tbody>
  `;

  // Build table rows
  categories.forEach(stat => {
    const key = keyMap[stat];
    const rowValues = allStats.map(item => parseFloat(item.stats[key]));
    const maxVal = Math.max(...rowValues);
    table += `<tr><td>${stat}</td>`;
    
    rowValues.forEach(val => {
      const isBest = val === maxVal;
      table += `<td class="${isBest ? 'best-cell' : ''}">${val}</td>`;
    });
    
    table += `</tr>`;
  });

  // Add total row
  const totals = allStats.map(item => categories.reduce((sum, stat) => sum + parseFloat(item.stats[keyMap[stat]]), 0));
  const maxTotal = Math.max(...totals);
  table += `<tr class="total-row"><td><strong>Total</strong></td>`;
  totals.forEach(total => {
    const isBest = total === maxTotal;
    table += `<td class="${isBest ? 'best-cell' : ''}"><strong>${total.toFixed(1)}</strong></td>`;
  });
  table += `</tr>`;

  // Add average row
  table += `<tr class="average-row"><td><strong>Average</strong></td>`;
  categories.forEach(stat => {
    const key = keyMap[stat];
    const avg = allStats.reduce((sum, item) => sum + parseFloat(item.stats[key]), 0) / allStats.length;
    table += `<td><strong>${avg.toFixed(2)}</strong></td>`;
  });
  table += `</tr>`;

  table += `</tbody></table>`;
  compDiv.innerHTML = table;
}

// Clamp and normalize progression level inputs (enforces ability bounds, 0.1 step, and min <= max)
function sanitizeProgressionLevelInputs(minAllowed = 0, maxAllowed = 10) {
  const clampToRange = (val) => Math.min(maxAllowed, Math.max(minAllowed, val));
  if (!progMinLevel || !progMaxLevel) return { minLevel: minAllowed, maxLevel: maxAllowed };

  let min = parseFloat(progMinLevel.value);
  let max = parseFloat(progMaxLevel.value);

  if (Number.isNaN(min)) min = minAllowed;
  if (Number.isNaN(max)) max = maxAllowed;

  min = Math.round(clampToRange(min) * 10) / 10;
  max = Math.round(clampToRange(max) * 10) / 10;

  if (min > max) [min, max] = [max, min];

  progMinLevel.value = min.toFixed(1);
  progMaxLevel.value = max.toFixed(1);

  return { minLevel: min, maxLevel: max };
}

function updateProgressionChart() {
  const stats = ['Pow', 'Spd', 'Trick', 'Recv', 'Def'];
  const statColors = {
    Pow: 'rgba(255, 99, 132, 0.8)',
    Spd: 'rgba(54, 162, 235, 0.8)',
    Trick: 'rgba(255, 206, 86, 0.8)',
    Recv: 'rgba(75, 192, 192, 0.8)',
    Def: 'rgba(153, 102, 255, 0.8)'
  };
  const statBorderColors = {
    Pow: 'rgba(255, 99, 132, 1)',
    Spd: 'rgba(54, 162, 235, 1)',
    Trick: 'rgba(255, 206, 86, 1)',
    Recv: 'rgba(75, 192, 192, 1)',
    Def: 'rgba(153, 102, 255, 1)'
  };

  // Multi-compare snapshot: show all selected abilities at their chosen level
  if (multiCompareMode && multiCompareList.length > 0) {
    const labels = multiCompareList.map(item => `${item.ability} (Lvl ${item.level})`);
    const ampMode = ampModeSelect.value;
    const datasets = stats.map(stat => {
      const data = multiCompareList.map(item => {
        const s = getStats(item.tier, item.ability, item.level, ampMode);
        return parseFloat(s[stat]) || 0;
      });
      return {
        label: stat,
        data,
        backgroundColor: statColors[stat],
        borderColor: statBorderColors[stat],
        borderWidth: 2,
        borderRadius: 4
      };
    });

    const maxVal = Math.max(...datasets.flatMap(d => d.data));
    const yAxisMax = Math.ceil(maxVal * 10) / 10 || 1;
    const stepSize = Math.ceil(yAxisMax / 5) || 1;

    progressionChart.options.scales.y.max = yAxisMax;
    progressionChart.options.scales.y.ticks.stepSize = stepSize;
    progressionChart.data.labels = labels;
    progressionChart.data.datasets = datasets;
    progressionChart.update();
    updateStatDistributionChart();
    return;
  }

  const selectedAbility = abilitySelect.value;
  if (!selectedAbility) {
    progressionChart.data.labels = [];
    progressionChart.data.datasets = [];
    progressionChart.update();
    updateStatDistributionChart();
    return;
  }

  const [tier, ability] = selectedAbility.split('::');
  const abilityData = AbilitiesData[tier] && AbilitiesData[tier][ability];
  if (!abilityData || !abilityData.levels) {
    progressionChart.data.labels = [];
    progressionChart.data.datasets = [];
    progressionChart.update();
    return;
  }

  let levelsObj = abilityData.levels;

  // Handle Phase Shift's nested form structure
  if (ability === 'Phase Shift' || (levelsObj && Object.keys(levelsObj).length > 0 && typeof Object.values(levelsObj)[0] === 'object' && !('Pow' in Object.values(levelsObj)[0]))) {
    const formKey = levelSelect.value.split('::')[0]; // Extract form from "form::level"
    if (levelsObj[formKey]) {
      levelsObj = levelsObj[formKey];
    }
  }

  // Determine available numeric level bounds for this ability
  const numericLevels = Object.keys(levelsObj)
    .map(k => parseFloat(k))
    .filter(v => !Number.isNaN(v));
  const minAllowed = numericLevels.length ? Math.min(...numericLevels) : 0;
  const maxAllowed = numericLevels.length ? Math.max(...numericLevels) : 10;

  const { minLevel: progMin, maxLevel: progMax } = sanitizeProgressionLevelInputs(minAllowed, maxAllowed);

  // Sort levels numerically and filter by range
  const levelKeys = Object.keys(levelsObj)
    .map(key => ({ key, num: parseFloat(key) }))
    .filter(({ num }) => Number.isNaN(num) ? true : (num >= progMin && num <= progMax))
    .sort((a, b) => (Number.isNaN(a.num) ? 0 : a.num) - (Number.isNaN(b.num) ? 0 : b.num))
    .map(item => item.key);

  // Extract data for each stat and find overall max value
  const datasets = [];
  let maxStatValue = 0;
  const ampMode = ampModeSelect.value;
  
  // First pass: find max stat value across all levels and stats
  stats.forEach(stat => {
    levelKeys.forEach(level => {
      const levelData = levelsObj[level];
      let value = parseFloat(levelData[stat]) || 0;
      
      if (ampMode === 'amped') {
        value = value * 1.5;
      } else if (ampMode === 'deamped') {
        value = value * 0.5;
      }
      
      maxStatValue = Math.max(maxStatValue, value);
    });
  });
  
  // Second pass: create datasets
  stats.forEach(stat => {
    const data = levelKeys.map(level => {
      const levelData = levelsObj[level];
      let value = parseFloat(levelData[stat]) || 0;
      
      // Apply amp mode
      if (ampMode === 'amped') {
        value = (value * 1.5).toFixed(1);
      } else if (ampMode === 'deamped') {
        value = (value * 0.5).toFixed(1);
      }
      
      return value;
    });

    datasets.push({
      label: stat,
      data: data,
      backgroundColor: statColors[stat],
      borderColor: statBorderColors[stat],
      borderWidth: 2,
      borderRadius: 4
    });
  });

  // Dynamically set Y-axis max based on highest stat value across all levels, rounded up to nearest 0.1
  const yAxisMax = Math.ceil(maxStatValue * 10) / 10;
  const stepSize = Math.ceil(yAxisMax / 5) || 1; // Create ~5 steps, minimum 1

  progressionChart.options.scales.y.max = yAxisMax;
  progressionChart.options.scales.y.ticks.stepSize = stepSize;

  progressionChart.data.labels = levelKeys;
  progressionChart.data.datasets = datasets;
  progressionChart.update();

  // Keep distribution chart in sync with filters/amp mode
  updateStatDistributionChart();
}

// Clamp and normalize distribution level inputs (enforces bounds, 0.1 step, and min <= max)
function sanitizeDistLevelInputs(minAllowed = 0, maxAllowed = 10) {
  const clampToRange = (val) => Math.min(maxAllowed, Math.max(minAllowed, val));
  if (!distMinLevel || !distMaxLevel) return { minLevel: minAllowed, maxLevel: maxAllowed };

  let min = parseFloat(distMinLevel.value);
  let max = parseFloat(distMaxLevel.value);

  if (Number.isNaN(min)) min = minAllowed;
  if (Number.isNaN(max)) max = maxAllowed;

  // Snap to 0.1 increments to match input step
  min = Math.round(clampToRange(min) * 10) / 10;
  max = Math.round(clampToRange(max) * 10) / 10;

  if (min > max) [min, max] = [max, min];

  // Reflect sanitized values back to the inputs
  distMinLevel.value = min.toFixed(1);
  distMaxLevel.value = max.toFixed(1);

  return { minLevel: min, maxLevel: max };
}

// Build histogram of stat values across filtered abilities (respects filters + amp mode)
function updateStatDistributionChart(tierFilter = '', abilityFilter = '') {
  const filteredAbilities = getAbilitiesMatchingFilters();
  const ampMode = ampModeSelect.value;

  // Determine available level bounds across the filtered selection (respecting tier/ability filters)
  const numericLevels = [];
  Object.keys(filteredAbilities).forEach(tier => {
    if (tierFilter && tier !== tierFilter) return;

    Object.keys(filteredAbilities[tier]).forEach(ability => {
      if (abilityFilter && ability !== abilityFilter) return;

      const abilityData = filteredAbilities[tier][ability];
      const levels = abilityData?.levels || {};

      Object.entries(levels).forEach(([levelKey, levelData]) => {
        if (levelData && typeof levelData === 'object' && !('Pow' in levelData)) {
          Object.keys(levelData).forEach(formLevelKey => {
            const num = parseFloat(formLevelKey);
            if (!Number.isNaN(num)) numericLevels.push(num);
          });
        } else {
          const num = parseFloat(levelKey);
          if (!Number.isNaN(num)) numericLevels.push(num);
        }
      });
    });
  });

  const minAllowed = numericLevels.length ? Math.min(...numericLevels) : 0;
  const maxAllowed = numericLevels.length ? Math.max(...numericLevels) : 10;

  const { minLevel, maxLevel } = sanitizeDistLevelInputs(minAllowed, maxAllowed);

  // Get visible stats from checkboxes
  const visibleStats = Array.from(document.querySelectorAll('.dist-stat-filter:checked')).map(el => el.value);
  const statKeys = ['Pow', 'Spd', 'Trick', 'Recv', 'Def'].filter(key => visibleStats.includes(key));
  
  const statLabels = {
    Pow: 'Power',
    Spd: 'Speed',
    Trick: 'Trick',
    Recv: 'Recovery',
    Def: 'Defense'
  };

  // Bin labels 1-2 ... 10-11, and 11+ (skip 0-1 as stats don't go below 1)
  const binLabels = Array.from({ length: 10 }, (_, i) => `${i + 1}-${i + 2}`).concat(['11+']);
  const binCount = binLabels.length;

  // Initialize counts per stat
  const counts = {};
  statKeys.forEach(key => {
    counts[key] = Array(binCount).fill(0);
  });

  // Overlay counts for the currently selected multi-compare abilities
  const selectedCounts = (multiCompareMode && multiCompareList.length > 0) ? statKeys.reduce((acc, key) => {
    acc[key] = Array(binCount).fill(0);
    return acc;
  }, {}) : null;

  const applyAmp = (val) => {
    if (ampMode === 'amped') return val * 1.5;
    if (ampMode === 'deamped') return val * 0.5;
    return val;
  };

  const addStatValues = (statsObj) => {
    statKeys.forEach(key => {
      let val = parseFloat(statsObj[key]);
      if (Number.isNaN(val)) return;
      val = applyAmp(val);
      // Adjust bin index for 1-based bins (1-2 is index 0, 2-3 is index 1, etc.)
      const binIndex = Math.min(Math.max(Math.floor(val) - 1, 0), binCount - 1);
      counts[key][binIndex] += 1;
    });
  };

  const addSelectedStatValues = (statsObj) => {
    if (!selectedCounts) return;
    statKeys.forEach(key => {
      let val = parseFloat(statsObj[key]);
      if (Number.isNaN(val)) return;
      val = applyAmp(val);
      const binIndex = Math.min(Math.max(Math.floor(val) - 1, 0), binCount - 1);
      selectedCounts[key][binIndex] += 1;
    });
  };

  // Flatten and collect stats from matching abilities/levels
  Object.keys(filteredAbilities).forEach(tier => {
    if (tierFilter && tier !== tierFilter) return; // Skip if tier filter active and doesn't match

    Object.keys(filteredAbilities[tier]).forEach(ability => {
      if (abilityFilter && ability !== abilityFilter) return; // Skip if ability filter active and doesn't match

      const abilityData = filteredAbilities[tier][ability];
      const levels = abilityData?.levels || {};

      Object.entries(levels).forEach(([levelKey, levelData]) => {
        // Handle Phase Shift / nested forms with form::level keys
        if (levelData && typeof levelData === 'object' && !('Pow' in levelData)) {
          Object.entries(levelData).forEach(([formLevelKey, formLevel]) => {
            if (!formLevel || typeof formLevel !== 'object') return;
            const numeric = parseFloat(formLevelKey);
            if (!Number.isNaN(numeric) && (numeric < minLevel || numeric > maxLevel)) return;
            addStatValues(formLevel);
          });
        } else if (levelData && typeof levelData === 'object') {
          const numeric = parseFloat(levelKey);
          if (!Number.isNaN(numeric) && (numeric < minLevel || numeric > maxLevel)) return;
          addStatValues(levelData);
        }
      });
    });
  });

  // Overlay: include only the selected multi-compare abilities at their chosen levels
  const showOverlay = !!(distOverlayToggle && distOverlayToggle.checked);
  if (selectedCounts && showOverlay) {
    multiCompareList.forEach(item => {
      const stats = getStats(item.tier, item.ability, item.level, ampModeSelect.value);
      addSelectedStatValues(stats);
    });
  }

  // Build datasets
  const colors = {
    Pow: 'rgba(239, 68, 68, 0.7)',
    Spd: 'rgba(59, 130, 246, 0.7)',
    Trick: 'rgba(251, 191, 36, 0.8)',
    Recv: 'rgba(16, 185, 129, 0.75)',
    Def: 'rgba(139, 92, 246, 0.75)'
  };

  const isStacked = document.getElementById('distStackToggle')?.checked || false;
  
  distributionChart.data.labels = binLabels;
  const datasets = statKeys.map(key => ({
    label: statLabels[key],
    data: counts[key],
    backgroundColor: colors[key],
    borderColor: colors[key].replace('0.7', '1').replace('0.75', '1').replace('0.8', '1'),
    borderWidth: 1,
    maxBarThickness: isStacked ? 28 : 22,
    // Only set stack key when stacked mode is on
    ...(isStacked ? { stack: 'all' } : {})
  }));

  // Overlay selected abilities as dashed bars
  if (selectedCounts && showOverlay) {
    const overlayColors = {
      Pow: 'rgba(239, 68, 68, 0.4)',
      Spd: 'rgba(59, 130, 246, 0.4)',
      Trick: 'rgba(251, 191, 36, 0.45)',
      Recv: 'rgba(16, 185, 129, 0.45)',
      Def: 'rgba(139, 92, 246, 0.45)'
    };

    statKeys.forEach(key => {
      const overlayDataset = {
        label: `Selected ${statLabels[key]}`,
        data: selectedCounts[key],
        backgroundColor: overlayColors[key],
        borderColor: overlayColors[key].replace('0.4', '0.9').replace('0.45', '0.9'),
        borderWidth: 2,
        borderDash: [4, 2],
        maxBarThickness: isStacked ? 24 : 18
      };
      // Only stack overlay when stacked mode is on; otherwise group side-by-side
      if (isStacked) overlayDataset.stack = 'selected';
      datasets.push(overlayDataset);
    });
  }

  distributionChart.data.datasets = datasets;

  // Update stacking option
  if (distributionChart.options.scales && distributionChart.options.scales.x) {
    distributionChart.options.scales.x.stacked = isStacked;
  }
  if (distributionChart.options.scales && distributionChart.options.scales.y) {
    distributionChart.options.scales.y.stacked = isStacked;
  }

  // Note: Avoid modifying legend options here to prevent Chart.js reactive proxy recursion.

  distributionChart.update();
}

const multiCompareToggle = document.getElementById('multiCompareToggle');
const multiCompareControls = document.getElementById('multiCompareControls');
const multiCompareAbilitySelect = document.getElementById('multiCompareAbilitySelect');
const multiCompareLevelSelect = document.getElementById('multiCompareLevelSelect');
const multiCompareAmpModeSelect = document.getElementById('multiCompareAmpModeSelect');
const addToMultiCompareBtn = document.getElementById('addToMultiCompare');
const progMinLevel = document.getElementById('progMinLevel');
const progMaxLevel = document.getElementById('progMaxLevel');

abilitySelect.addEventListener('change', () => populateLevels(abilitySelect));
levelSelect.addEventListener('change', updateChart);
ampModeSelect.addEventListener('change', updateChart);

abilitySelect2.addEventListener('change', () => populateLevels(abilitySelect2));
levelSelect2.addEventListener('change', updateChart);
ampModeSelect2.addEventListener('change', updateChart);

progMinLevel?.addEventListener('change', () => {
  updateProgressionChart();
});

progMaxLevel?.addEventListener('change', () => {
  updateProgressionChart();
});

compareToggle.addEventListener('click', () => {
  compareMode = !compareMode;
  if (compareMode) multiCompareMode = false; // Disable multi-compare when enabling regular compare
  compareControls.classList.toggle('hidden', !compareMode);
  document.getElementById('multiCompareControls')?.classList.add('hidden');
  compareToggle.textContent = compareMode ? 'Disable Compare Mode' : 'Enable Compare Mode';
  console.log('Compare mode toggled:', compareMode);
  updateChart();
});

multiCompareToggle.addEventListener('click', () => {
  multiCompareMode = !multiCompareMode;
  if (multiCompareMode) {
    compareMode = false; // Disable regular compare when enabling multi-compare
    compareControls.classList.add('hidden');
    compareToggle.textContent = 'Enable Compare Mode';
    multiCompareList = [];
    updateMultiCompareUI();
  }
  multiCompareControls.classList.toggle('hidden', !multiCompareMode);
  multiCompareToggle.textContent = multiCompareMode ? '🔀 Multi-Compare (Active)' : '🔀 Multi-Compare';
  updateChart();
});

multiCompareAbilitySelect.addEventListener('change', () => {
  const levelSelect = document.getElementById('multiCompareLevelSelect');
  if (levelSelect && multiCompareAbilitySelect.value) {
    populateLevels(multiCompareAbilitySelect, levelSelect);
  }
});

addToMultiCompareBtn.addEventListener('click', () => {
  const abilityValue = multiCompareAbilitySelect.value;
  const levelValue = multiCompareLevelSelect.value;
  const ampMode = multiCompareAmpModeSelect.value;
  
  if (!abilityValue || !levelValue) {
    alert('Please select both ability and level');
    return;
  }
  
  // Check if already in list
  if (multiCompareList.some(item => item.ability === abilityValue && item.level === levelValue && item.amp === ampMode)) {
    alert('This combination is already in the comparison list');
    return;
  }
  
  const [tier, ability] = abilityValue.split('::');
  multiCompareList.push({
    tier: tier,
    ability: ability,
    level: levelValue,
    amp: ampMode,
    fullValue: abilityValue
  });
  
  updateMultiCompareUI();
  updateChart();
});

function updateMultiCompareUI() {
  const list = document.getElementById('multiCompareList');
  list.innerHTML = '';
  
  multiCompareList.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'multi-compare-item';
    itemDiv.innerHTML = `
      <span>${item.ability} - Lvl ${item.level} (${item.amp})</span>
      <button class="multi-compare-item-remove" onclick="removeFromMultiCompare(${index})">✕</button>
    `;
    list.appendChild(itemDiv);
  });
}

function removeFromMultiCompare(index) {
  multiCompareList.splice(index, 1);
  updateMultiCompareUI();
  updateChart();
}

// Distribution Chart Controls Event Listeners
function updateDistributionTierSelect() {
  const filteredAbilities = getAbilitiesMatchingFilters();
  const distTierSelect = document.getElementById('distTierSelect');
  const tiers = Object.keys(filteredAbilities).sort();
  
  // Keep the first option ("All Filtered"), remove others, then add tier options
  const currentValue = distTierSelect.value;
  distTierSelect.innerHTML = '<option value="">All Filtered</option>';
  
  tiers.forEach(tier => {
    const option = document.createElement('option');
    option.value = tier;
    option.textContent = tier;
    distTierSelect.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (currentValue && Array.from(distTierSelect.options).find(o => o.value === currentValue)) {
    distTierSelect.value = currentValue;
  } else {
    distTierSelect.value = '';
  }
}

function updateDistributionAbilitySelect() {
  const filteredAbilities = getAbilitiesMatchingFilters();
  const distTierSelect = document.getElementById('distTierSelect');
  const distAbilitySelect = document.getElementById('distAbilitySelect');
  const selectedTier = distTierSelect.value;
  
  const currentAbilityValue = distAbilitySelect.value;
  distAbilitySelect.innerHTML = '<option value="">All in Tier</option>';
  
  if (selectedTier && filteredAbilities[selectedTier]) {
    const abilities = Object.keys(filteredAbilities[selectedTier]).sort();
    abilities.forEach(ability => {
      const option = document.createElement('option');
      option.value = ability;
      option.textContent = ability;
      distAbilitySelect.appendChild(option);
    });
  }
  
  // Reset ability selection when tier changes
  distAbilitySelect.value = '';
}

const distTierSelect = document.getElementById('distTierSelect');
const distAbilitySelect = document.getElementById('distAbilitySelect');
const distStackToggle = document.getElementById('distStackToggle');
const distOverlayToggle = document.getElementById('distOverlayToggle');
const distMinLevel = document.getElementById('distMinLevel');
const distMaxLevel = document.getElementById('distMaxLevel');
const distStatFilters = document.querySelectorAll('.dist-stat-filter');

distTierSelect.addEventListener('change', () => {
  updateDistributionAbilitySelect();
  updateStatDistributionChart(distTierSelect.value, '');
});

distAbilitySelect.addEventListener('change', () => {
  updateStatDistributionChart(distTierSelect.value, distAbilitySelect.value);
});

distStackToggle.addEventListener('change', () => {
  updateStatDistributionChart(distTierSelect.value, distAbilitySelect.value);
});

distOverlayToggle?.addEventListener('change', () => {
  updateStatDistributionChart(distTierSelect.value, distAbilitySelect.value);
});

distMinLevel?.addEventListener('change', () => {
  sanitizeDistLevelInputs();
  updateStatDistributionChart(distTierSelect.value, distAbilitySelect.value);
});

distMaxLevel?.addEventListener('change', () => {
  sanitizeDistLevelInputs();
  updateStatDistributionChart(distTierSelect.value, distAbilitySelect.value);
});

distStatFilters.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    updateStatDistributionChart(distTierSelect.value, distAbilitySelect.value);
  });
});

// URL State Management
function updateURL() {
  const params = new URLSearchParams();
  params.set('ability', abilitySelect.value);
  params.set('level', levelSelect.value);
  params.set('amp', ampModeSelect.value);
  
  if (compareMode) {
    params.set('compare', 'true');
    params.set('ability2', abilitySelect2.value);
    params.set('level2', levelSelect2.value);
    params.set('amp2', ampModeSelect2.value);
  }
  
  const newURL = window.location.pathname + '?' + params.toString();
  window.history.replaceState({}, '', newURL);
}

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('ability')) return false;
  
  const ability = params.get('ability');
  const level = params.get('level');
  const amp = params.get('amp');
  
  if (ability) {
    abilitySelect.value = ability;
    console.log('URL: Set ability to', ability);
    
    // Wait a tick to ensure populateLevels completes before setting level
    setTimeout(() => {
      populateLevels(abilitySelect);
      
      if (level) {
        levelSelect.value = level;
        console.log('URL: Set level to', level);
      }
      if (amp) {
        ampModeSelect.value = amp;
        console.log('URL: Set amp to', amp);
      }
      
      updateChart();
    }, 0);
  } else {
    return false;
  }
  
  if (params.get('compare') === 'true') {
    compareMode = true;
    compareControls.classList.remove('hidden');
    compareToggle.textContent = 'Disable Compare Mode';
    
    const ability2 = params.get('ability2');
    const level2 = params.get('level2');
    const amp2 = params.get('amp2');
    
    if (ability2) {
      abilitySelect2.value = ability2;
      populateLevels(abilitySelect2);
      
      if (level2) {
        levelSelect2.value = level2;
      }
      if (amp2) ampModeSelect2.value = amp2;
    }
  }
  
  return true;
}

function restoreFromPreferences(prefs) {
  const { savedAbility1, savedLevel1, savedAmp1 } = prefs;
  
  if (savedAbility1) {
    abilitySelect.value = savedAbility1;
    console.log('Prefs: Restored ability to', savedAbility1);
    
    // Wait a tick to ensure populateLevels completes before setting level
    setTimeout(() => {
      populateLevels(abilitySelect);
      
      if (savedLevel1) {
        levelSelect.value = savedLevel1;
        console.log('Prefs: Restored level to', savedLevel1);
      }
      if (savedAmp1) {
        ampModeSelect.value = savedAmp1;
        console.log('Prefs: Restored amp to', savedAmp1);
      }
      
      updateChart();
    }, 0);
  }
}

// Get tag definition from tags.json
function getTagDefinition(tagName) {
  // Check in general-tags
  if (TagsData['general-tags']?.[tagName]) {
    const tag = TagsData['general-tags'][tagName];
    let tooltip = `${tagName}\n`;
    if (tag.Description) tooltip += `\n${tag.Description}`;
    if (tag.Gameplay) tooltip += `\n\nGameplay: ${tag.Gameplay}`;
    if (tag.Strengths) tooltip += `\n\nStrengths: ${tag.Strengths}`;
    if (tag.Weaknesses) tooltip += `\n\nWeaknesses: ${tag.Weaknesses}`;
    if (tag.Synergy) tooltip += `\n\nSynergy: ${tag.Synergy}`;
    return tooltip;
  }
  
  // Check in ability-state
  if (TagsData['ability-state']?.[tagName]) {
    return `${tagName}\n\n${TagsData['ability-state'][tagName]}`;
  }
  
  return tagName;
}

// Get weakness definition from tags.json
function getWeaknessDefinition(weaknessName) {
  if (TagsData['ability-tags']?.['Weaknesses']?.[weaknessName]) {
    return `${weaknessName}\n\n${TagsData['ability-tags']['Weaknesses'][weaknessName]}`;
  }
  return weaknessName;
}

// Metadata display
function renderMetadata(meta, abilityName) {
  let html = '<div class="metadata-container">';
  
  if (meta.description) {
    html += `<details class="metadata-section">
      <summary>📖 About ${abilityName}</summary>
      <p>${meta.description}</p>
    </details>`;
  }
  
  if (meta.tags && meta.tags.length > 0) {
    html += `<details class="metadata-section">
      <summary>🏷️ Tags</summary>
      <div class="tags-container">
        ${meta.tags.map(tag => {
          const definition = getTagDefinition(tag);
          return `<span class="tag" data-tooltip="${definition.replace(/"/g, '&quot;')}">${tag}</span>`;
        }).join('')}
      </div>
    </details>`;
  }
  
  if (meta['target-rating']) {
    const rating = meta['target-rating'];
    html += `<details class="metadata-section">
      <summary>🎯 Target Rating: ${rating.score}/10</summary>
      <p><strong>Explanation:</strong> ${rating.explanation}</p>`;
    if (rating.Weaknesses && rating.Weaknesses.length > 0) {
      html += `<div class="weaknesses-container">
        <p><strong>Weaknesses:</strong></p>
        <div class="weakness-tags">
          ${rating.Weaknesses.map(weakness => {
            const definition = getWeaknessDefinition(weakness);
            return `<span class="weakness-tag" data-tooltip="${definition.replace(/"/g, '&quot;')}">${weakness}</span>`;
          }).join('')}
        </div>
      </div>`;
    }
    html += `</details>`;
  }
  
  if (meta.faq) {
    html += `<details class="metadata-section">
      <summary>❓ FAQ</summary>
      <p>${meta.faq}</p>
    </details>`;
  }
  
  html += '</div>';
  return html;
}

// Helper functions to preserve details element open/closed state
function saveDetailsStates(container) {
  const states = [];
  if (!container) return states;
  
  container.querySelectorAll('details').forEach((details, index) => {
    states.push({
      index: index,
      summary: details.querySelector('summary')?.textContent || '',
      open: details.open
    });
  });
  return states;
}

function restoreDetailsStates(container, states) {
  if (!container || !states.length) return;
  
  container.querySelectorAll('details').forEach((details, index) => {
    const state = states.find(s => s.summary === details.querySelector('summary')?.textContent);
    if (state && state.open) {
      details.open = true;
    }
  });
}

// Export chart as image
function exportChart(format = 'png', chartType = 'both') {
  const radarCanvas = document.getElementById('radarChart');
  const progressionCanvas = document.getElementById('progressionChart');
  const [tier, ability] = abilitySelect.value.split('::');
  const level = levelSelect.value;
  
  if (format === 'png') {
    if (chartType === 'radar') {
      // Export radar only
      const link = document.createElement('a');
      link.download = `${ability}_${level}_radar.png`;
      link.href = radarCanvas.toDataURL('image/png');
      link.click();
    } else if (chartType === 'progression') {
      // Export progression only
      const link = document.createElement('a');
      link.download = `${ability}_${level}_progression.png`;
      link.href = progressionCanvas.toDataURL('image/png');
      link.click();
    } else {
      // Export both side by side
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      tempCanvas.width = radarCanvas.width + progressionCanvas.width + 40;
      tempCanvas.height = Math.max(radarCanvas.height, progressionCanvas.height);
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      const radarImg = new Image();
      radarImg.onload = function() {
        ctx.drawImage(radarImg, 0, 0);
        
        const progressionImg = new Image();
        progressionImg.onload = function() {
          ctx.drawImage(progressionImg, radarCanvas.width + 40, 0);
          
          const link = document.createElement('a');
          link.download = `${ability}_${level}_charts.png`;
          link.href = tempCanvas.toDataURL('image/png');
          link.click();
          
          document.getElementById('exportMenu')?.classList.remove('show');
        };
        progressionImg.src = progressionCanvas.toDataURL('image/png');
      };
      radarImg.src = radarCanvas.toDataURL('image/png');
      return;
    }
  } else if (format === 'svg') {
    if (chartType === 'radar') {
      // Export radar only as SVG
      const dataURL = radarCanvas.toDataURL('image/png');
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${radarCanvas.width}" height="${radarCanvas.height}">
  <image width="${radarCanvas.width}" height="${radarCanvas.height}" xlink:href="${dataURL}"/>
</svg>`;
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${ability}_${level}_radar.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else if (chartType === 'progression') {
      // Export progression only as SVG
      const dataURL = progressionCanvas.toDataURL('image/png');
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${progressionCanvas.width}" height="${progressionCanvas.height}">
  <image width="${progressionCanvas.width}" height="${progressionCanvas.height}" xlink:href="${dataURL}"/>
</svg>`;
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${ability}_${level}_progression.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Export both as SVG side by side
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      tempCanvas.width = radarCanvas.width + progressionCanvas.width + 40;
      tempCanvas.height = Math.max(radarCanvas.height, progressionCanvas.height);
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      const radarImg = new Image();
      radarImg.onload = function() {
        ctx.drawImage(radarImg, 0, 0);
        
        const progressionImg = new Image();
        progressionImg.onload = function() {
          ctx.drawImage(progressionImg, radarCanvas.width + 40, 0);
          
          const dataURL = tempCanvas.toDataURL('image/png');
          const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${tempCanvas.width}" height="${tempCanvas.height}">
  <image width="${tempCanvas.width}" height="${tempCanvas.height}" xlink:href="${dataURL}"/>
</svg>`;
          
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${ability}_${level}_charts.svg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          document.getElementById('exportMenu')?.classList.remove('show');
        };
        progressionImg.src = progressionCanvas.toDataURL('image/png');
      };
      radarImg.src = radarCanvas.toDataURL('image/png');
      return;
    }
  }
  
  document.getElementById('exportMenu')?.classList.remove('show');
}

// Export distribution chart as image
function exportDistributionChart(format = 'png') {
  const distributionCanvas = document.getElementById('distributionChart');
  const tier = document.getElementById('distTierSelect').value || 'AllFiltered';
  const ability = document.getElementById('distAbilitySelect').value || 'All';
  const filename = `stats-distribution_${tier}_${ability}`;
  
  if (format === 'png') {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = distributionCanvas.toDataURL('image/png');
    link.click();
  }
  
  document.getElementById('exportMenu')?.classList.remove('show');
}

// Export distribution data as JSON
function exportDistributionDataAsJSON() {
  const tier = document.getElementById('distTierSelect').value || 'All Filtered';
  const ability = document.getElementById('distAbilitySelect').value || 'All';
  const isStacked = document.getElementById('distStackToggle')?.checked || false;
  
  // Gather visible stats
  const visibleStats = Array.from(document.querySelectorAll('.dist-stat-filter:checked')).map(el => el.value);
  
  // Get chart data
  const chartData = distributionChart.data;
  const datasets = chartData.datasets.map(dataset => ({
    stat: dataset.label,
    data: dataset.data
  }));
  
  const exportData = {
    exportDate: new Date().toISOString(),
    tierFilter: tier,
    abilityFilter: ability,
    ampMode: ampModeSelect.value,
    stackedMode: isStacked,
    visibleStats: visibleStats,
    binLabels: chartData.labels,
    datasets: datasets
  };
  
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `stats-distribution_${tier}_${ability}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  
  document.getElementById('exportMenu')?.classList.remove('show');
}

// Export distribution data as CSV
function exportDistributionDataAsCSV() {
  const tier = document.getElementById('distTierSelect').value || 'All Filtered';
  const ability = document.getElementById('distAbilitySelect').value || 'All';
  
  const chartData = distributionChart.data;
  const labels = chartData.labels;
  const datasets = chartData.datasets;
  
  // Build CSV header
  let csv = 'Bin,' + datasets.map(d => d.label).join(',') + '\n';
  
  // Build CSV rows
  for (let i = 0; i < labels.length; i++) {
    const row = [labels[i]];
    datasets.forEach(dataset => {
      row.push(dataset.data[i] || 0);
    });
    csv += row.join(',') + '\n';
  }
  
  // Add metadata
  csv += '\n\nMetadata\n';
  csv += `Export Date,${new Date().toISOString()}\n`;
  csv += `Tier Filter,${tier}\n`;
  csv += `Ability Filter,${ability}\n`;
  csv += `Amp Mode,${ampModeSelect.value}\n`;
  csv += `Stacked Mode,${document.getElementById('distStackToggle')?.checked || false}\n`;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `stats-distribution_${tier}_${ability}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  
  document.getElementById('exportMenu')?.classList.remove('show');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Alt+C: Toggle compare mode
  if (e.altKey && e.key === 'c') {
    e.preventDefault();
    compareToggle.click();
  }
  
  // Alt+D: Toggle dark mode
  if (e.altKey && e.key === 'd') {
    e.preventDefault();
    darkModeToggle.click();
  }
  
  // Alt+E: Export chart
  if (e.altKey && e.key === 'e') {
    e.preventDefault();
    showExportMenu();
  }
  
  // Alt+S: Focus search
  if (e.altKey && e.key === 's') {
    e.preventDefault();
    const searchInput = document.getElementById('abilitySearch');
    if (searchInput) searchInput.focus();
  }
  
  // Escape: Close modal
  if (e.key === 'Escape') {
    closeGifModal();
    document.getElementById('exportMenu')?.classList.remove('show');
  }
});

// Custom search filter
function setupSearch() {
  const searchInput = document.getElementById('abilitySearch');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchResults = document.getElementById('searchResults');
  if (!searchInput || !searchDropdown || !searchResults) return;
  
  let selectedIndex = -1;
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    selectedIndex = -1;
    
    if (searchTerm.length === 0) {
      searchDropdown.classList.remove('show');
      searchDropdown.classList.add('hidden');
      return;
    }
    
    renderSearchResults(searchTerm);
    searchDropdown.classList.add('show');
    searchDropdown.classList.remove('hidden');
  });
  
  searchInput.addEventListener('keydown', (e) => {
    const items = searchResults.querySelectorAll('.search-result-item');
    const dropdownVisible = searchDropdown.classList.contains('show') && !searchDropdown.classList.contains('hidden');
    
    if (e.key === 'ArrowDown') {
      if (!dropdownVisible || items.length === 0) return;
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelectedItem(items, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      if (!dropdownVisible || items.length === 0) return;
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelectedItem(items, selectedIndex);
    } else if (e.key === 'Enter') {
      if (!dropdownVisible) return;
      e.preventDefault();
      if (items.length === 0) return;
      if (selectedIndex < 0) {
        selectedIndex = 0;
        updateSelectedItem(items, selectedIndex);
      }
      const item = items[selectedIndex];
      if (item) {
        const value = item.dataset.value;
        abilitySelect.value = value;
        searchInput.value = '';
        populateLevels(abilitySelect);
        searchDropdown.classList.remove('show');
        searchDropdown.classList.add('hidden');
        selectedIndex = -1;
      }
    } else if (e.key === 'Escape') {
      searchInput.value = '';
      searchDropdown.classList.remove('show');
      searchDropdown.classList.add('hidden');
      selectedIndex = -1;
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      searchDropdown.classList.remove('show');
      searchDropdown.classList.add('hidden');
    }
  });
}

function renderSearchResults(searchTerm) {
  const searchResults = document.getElementById('searchResults');
  const dropdown = document.getElementById('searchDropdown');
  let html = '';
  let hasResults = false;
  
  Object.keys(AbilitiesData).forEach(tier => {
    if (tier === '_meta') return;
    
    const tierName = tier.toLowerCase();
    const tierMatches = tierName.includes(searchTerm);
    const matchedAbilities = [];
    
    Object.keys(AbilitiesData[tier]).forEach(ability => {
      if (ability === '_meta') return;
      
      const abilityName = ability.toLowerCase();
      const abilityValue = (tier + '::' + ability).toLowerCase();
      
      const matches = tierMatches || 
                      abilityName.includes(searchTerm) || 
                      abilityValue.includes(searchTerm) ||
                      abilityName.replace(/[-\s]/g, '').includes(searchTerm.replace(/[-\s]/g, ''));
      
      if (matches) {
        matchedAbilities.push(ability);
        hasResults = true;
      }
    });
    
    if (matchedAbilities.length > 0) {
      html += `<div class="search-result-group">`;
      html += `<div class="search-result-group-label">${tier}</div>`;
      
      matchedAbilities.forEach(ability => {
        const value = tier + '::' + ability;
        const isFav = isFavorite(value);
        const star = isFav ? '⭐' : '☆';
        html += `<div class="search-result-item" data-value="${value}" data-tier="${tier}" data-ability="${ability}">
          <div class="search-result-item-wrapper">
            <span>${ability}</span>
            <span class="favorite-star ${isFav ? 'favorited' : 'unfavorited'}" data-ability-key="${value}" onclick="event.stopPropagation(); toggleFavorite('${value}'); renderSearchResults('${searchTerm.replace(/'/g, "\\'")}');">${star}</span>
          </div>
        </div>`;
      });
      
      html += `</div>`;
    }
  });
  
  if (!hasResults) {
    html = '<div class="search-result-empty">No abilities found</div>';
  }
  
  searchResults.innerHTML = html;
  
  // Add click handlers
  document.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const value = item.dataset.value;
      abilitySelect.value = value;
      document.getElementById('abilitySearch').value = '';
      populateLevels(abilitySelect);
      
      // Close dropdown
      dropdown.classList.remove('show');
      dropdown.classList.add('hidden');
      selectedIndex = -1;
    });
  });
}

function updateSelectedItem(items, index) {
  items.forEach((item, i) => {
    if (i === index) {
      item.classList.add('highlighted');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('highlighted');
    }
  });
}

// Initialize search on page load
setTimeout(setupSearch, 100);

// GIF Modal functions
function openGifModal(src, alt) {
  const modal = document.getElementById('gifModal');
  const modalImg = document.getElementById('gifModalImage');
  const caption = document.getElementById('gifModalCaption');
  
  modal.classList.remove('hidden');
  modalImg.src = src;
  caption.textContent = alt;
  
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

function closeGifModal() {
  const modal = document.getElementById('gifModal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  
  // Clear image src to stop GIF animation
  const modalImg = document.getElementById('gifModalImage');
  modalImg.src = '';
}

// Close modal on click outside image, keyboard, and touch gestures
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('gifModal');
  if (modal) {
    // Click to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        closeGifModal();
      }
    });
    
    // Touch/swipe gestures for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    modal.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    });
    
    modal.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeDistance = touchStartY - touchEndY;
      // Swipe up or down more than 50px to close
      if (Math.abs(swipeDistance) > 50) {
        closeGifModal();
      }
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeGifModal();
      }
    });
  }
});

// Export functions
function exportAsJSON() {
  const [tier, ability] = abilitySelect.value.split('::');
  const level = levelSelect.value;
  const mode = ampModeSelect.value;
  const stats = getStats(tier, ability, level, mode);
  
  const data = {
    ability: ability,
    tier: tier,
    level: level,
    mode: mode,
    stats: stats,
    timestamp: new Date().toISOString()
  };
  
  if (compareMode) {
    const [tier2, ability2] = abilitySelect2.value.split('::');
    const level2 = levelSelect2.value;
    const mode2 = ampModeSelect2.value;
    const stats2 = getStats(tier2, ability2, level2, mode2);
    
    data.comparison = {
      ability: ability2,
      tier: tier2,
      level: level2,
      mode: mode2,
      stats: stats2
    };
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${ability}_${level}_stats.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  
  // Close the export menu
  document.getElementById('exportMenu')?.classList.remove('show');
}

function exportAsCSV() {
  const [tier, ability] = abilitySelect.value.split('::');
  const level = levelSelect.value;
  const mode = ampModeSelect.value;
  const stats = getStats(tier, ability, level, mode);
  
  let csv = 'Ability,Tier,Level,Mode,Power,Speed,Trick,Recovery,Defense\n';
  csv += `${ability},${tier},${level},${mode},${stats.Pow},${stats.Spd},${stats.Trick},${stats.Recv},${stats.Def}\n`;
  
  if (compareMode) {
    const [tier2, ability2] = abilitySelect2.value.split('::');
    const level2 = levelSelect2.value;
    const mode2 = ampModeSelect2.value;
    const stats2 = getStats(tier2, ability2, level2, mode2);
    csv += `${ability2},${tier2},${level2},${mode2},${stats2.Pow},${stats2.Spd},${stats2.Trick},${stats2.Recv},${stats2.Def}\n`;
  }
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${ability}_${level}_stats.csv`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  
  // Close the export menu
  document.getElementById('exportMenu')?.classList.remove('show');
}

function exportAsSVG() {
  const radarCanvas = document.getElementById('radarChart');
  const progressionCanvas = document.getElementById('progressionChart');
  
  // Create a temporary canvas to combine both charts
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');
  
  // Set dimensions: side by side layout
  tempCanvas.width = radarCanvas.width + progressionCanvas.width + 40; // 40px gap
  tempCanvas.height = Math.max(radarCanvas.height, progressionCanvas.height);
  
  // Fill white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  // Draw radar chart on the left
  const radarImg = new Image();
  radarImg.onload = function() {
    ctx.drawImage(radarImg, 0, 0);
    
    // Draw progression chart on the right
    const progressionImg = new Image();
    progressionImg.onload = function() {
      ctx.drawImage(progressionImg, radarCanvas.width + 40, 0);
      
      // Convert combined canvas to SVG
      const dataURL = tempCanvas.toDataURL('image/png');
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${tempCanvas.width}" height="${tempCanvas.height}">
  <image width="${tempCanvas.width}" height="${tempCanvas.height}" xlink:href="${dataURL}"/>
</svg>`;
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const [tier, ability] = abilitySelect.value.split('::');
      const level = levelSelect.value;
      link.download = `${ability}_${level}_charts.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      // Close the export menu
      document.getElementById('exportMenu')?.classList.remove('show');
    };
    progressionImg.src = progressionCanvas.toDataURL('image/png');
  };
  radarImg.src = radarCanvas.toDataURL('image/png');
}

function showExportMenu() {
  const menu = document.getElementById('exportMenu');
  menu.classList.toggle('show');
}

// Close export menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#exportBtn') && !e.target.closest('#exportMenu')) {
    document.getElementById('exportMenu')?.classList.remove('show');
  }
});

// Export and Share button handlers
document.getElementById('exportBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  showExportMenu();
});

document.getElementById('shareBtn')?.addEventListener('click', () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('shareBtn');
    const originalText = btn.textContent;
    btn.textContent = '✅ Link Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Share link: ' + url);
  });
});

// Advanced Filters System
let activeFilters = {
  minPower: 0,
  minSpeed: 0,
  minTrick: 0,
  minRecovery: 0,
  minDefense: 0,
  selectedTiers: [],
  selectedStates: [],
  selectedTags: [],
  mode: 'and' // 'and' for strict, 'or' for flexible
};

function setupAdvancedFilters() {
  const filterToggle = document.getElementById('filterToggle');
  const advancedFilters = document.getElementById('advancedFilters');
  const applyFiltersBtn = document.querySelector('.filter-btn.apply');
  const clearFiltersBtn = document.querySelector('.filter-btn.clear');

  if (filterToggle && advancedFilters) {
    filterToggle.addEventListener('click', () => {
      const isOpen = advancedFilters.classList.toggle('active');
      filterToggle.classList.toggle('active');

      if (isOpen) {
        advancedFilters.classList.remove('hidden'); 
      } else {
        advancedFilters.classList.add('hidden');
      }
    });
  }


  // Populate tier checkboxes
  const tierSection = document.querySelector('[data-filter="tiers"]');
  if (tierSection) {
    const tiersContainer = tierSection.querySelector('.filter-checkboxes');
    tiersContainer.innerHTML = '';
    
    Object.keys(AbilitiesData).forEach(tier => {
      if (tier === '_meta') return;
      
      const label = document.createElement('label');
      label.className = 'filter-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" class="tier-filter" value="${tier}" data-tier="${tier}">
        <span>${tier}</span>
      `;
      tiersContainer.appendChild(label);
      
      // Add dynamic listener
      label.querySelector('input').addEventListener('change', updateFiltersRealtime);
    });
  }

  // Populate tag checkboxes
  const tagsSection = document.querySelector('[data-filter="tags"]');
  if (tagsSection) {
    const tagsContainer = tagsSection.querySelector('.filter-checkboxes');
    tagsContainer.innerHTML = '';
    
    const allTags = new Set();
    Object.keys(AbilitiesData).forEach(tier => {
      if (tier === '_meta') return;
      Object.keys(AbilitiesData[tier]).forEach(ability => {
        if (ability === '_meta') return;
        const abilityData = AbilitiesData[tier][ability];
        if (abilityData._meta && abilityData._meta.tags) {
          abilityData._meta.tags.forEach(tag => allTags.add(tag));
        }
      });
    });

    Array.from(allTags).sort().forEach(tag => {
      const label = document.createElement('label');
      label.className = 'filter-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" class="tag-filter" value="${tag}" data-tag="${tag}">
        <span>${tag}</span>
      `;
      tagsContainer.appendChild(label);
      
      // Add dynamic listener
      label.querySelector('input').addEventListener('change', updateFiltersRealtime);
    });
  }

  // Setup slider listeners
  const sliders = document.querySelectorAll('.filter-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const container = e.target.parentElement;
      const display = container ? container.querySelector('.filter-value-display') : e.target.nextElementSibling;
      if (display) {
        display.textContent = e.target.value;
      }
      
      // Update filters in real-time
      updateFiltersRealtime();
    });
  });

  // Apply filters button
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }

  // Clear filters button
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }

  // Setup state filter listeners
  const stateCheckboxes = document.querySelectorAll('.state-filter');
  stateCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateFiltersRealtime);
  });

  // Setup filter mode listeners
  const filterModeRadios = document.querySelectorAll('.filter-mode-radio');
  filterModeRadios.forEach(radio => {
    radio.addEventListener('change', updateFiltersRealtime);
  });
}

// Real-time filter update function
function updateFiltersRealtime() {
  // Gather current filter values
  const minPower = parseInt(document.getElementById('powerSlider')?.value || 0);
  const minSpeed = parseInt(document.getElementById('speedSlider')?.value || 0);
  const minTrick = parseInt(document.getElementById('trickSlider')?.value || 0);
  const minRecovery = parseInt(document.getElementById('recoverySlider')?.value || 0);
  const minDefense = parseInt(document.getElementById('defenseSlider')?.value || 0);

  const selectedTiers = Array.from(
    document.querySelectorAll('.tier-filter:checked')
  ).map(cb => cb.value);

  const selectedStates = Array.from(
    document.querySelectorAll('.state-filter:checked')
  ).map(cb => cb.value);

  const selectedTags = Array.from(
    document.querySelectorAll('.tag-filter:checked')
  ).map(cb => cb.value);

  const filterMode = document.querySelector('input[name="filterMode"]:checked')?.value || 'and';

  // Create temp filter object
  const tempFilters = {
    minPower,
    minSpeed,
    minTrick,
    minRecovery,
    minDefense,
    selectedTiers,
    selectedStates,
    selectedTags,
    mode: filterMode
  };

  // Get matching abilities
  const matchingAbilities = getAbilitiesMatchingFiltersTemp(tempFilters);
  const matchCount = Object.values(matchingAbilities).reduce((sum, tier) => sum + Object.keys(tier).length, 0);

  // Update UI with match count
  updateAbilityOptionsPreview(matchingAbilities, matchCount);
}

// Temporary filter matching function (doesn't affect activeFilters)
function getAbilitiesMatchingFiltersTemp(filters) {
  const matching = {};

  Object.keys(AbilitiesData).forEach(tier => {
    if (tier === '_meta') return;

    matching[tier] = {};

    Object.keys(AbilitiesData[tier]).forEach(ability => {
      if (ability === '_meta') return;

      const abilityData = AbilitiesData[tier][ability];
      const levels = abilityData.levels || {};

      // Check if any level meets stat requirements (always required)
      let meetsStatRequirements = false;
      Object.keys(levels).forEach(level => {
        const stats = levels[level];
        if (stats.Pow >= filters.minPower &&
            stats.Spd >= filters.minSpeed &&
            stats.Trick >= filters.minTrick &&
            stats.Recv >= filters.minRecovery &&
            stats.Def >= filters.minDefense) {
          meetsStatRequirements = true;
        }
      });

      if (!meetsStatRequirements) return;

      // Check tier filter
      let meetsTierFilter = true;
      if (filters.selectedTiers.length > 0) {
        meetsTierFilter = filters.selectedTiers.includes(tier);
      }

      // Check ability state filter
      let meetsStateFilter = true;
      if (filters.selectedStates.length > 0) {
        const abilityState = abilityData._meta?.['ability-state'];
        // Only apply filter if ability has a state defined; abilities without state pass by default
        if (abilityState) {
          meetsStateFilter = filters.selectedStates.includes(abilityState);
        }
      }

      // Check tag filter
      let meetsTagFilter = true;
      if (filters.selectedTags.length > 0) {
        const abilityTags = abilityData._meta?.tags || [];
        if (filters.mode === 'and') {
          // AND mode: ability must have ALL selected tags
          meetsTagFilter = filters.selectedTags.every(tag => abilityTags.includes(tag));
        } else {
          // OR mode: ability must have ANY selected tag
          meetsTagFilter = filters.selectedTags.some(tag => abilityTags.includes(tag));
        }
      }

      // Apply filter mode logic across ALL filters (tiers, states, tags)
      let meetsFilters = true;
      
      if (filters.mode === 'and') {
        // AND mode: ALL selected filters must match
        meetsFilters = meetsTierFilter && meetsStateFilter && meetsTagFilter;
      } else {
        // OR mode: Include ability if it passes any active filter
        // (A filter is "active" if selections exist for that category)
        const hasActiveTierFilter = filters.selectedTiers.length > 0;
        const hasActiveStateFilter = filters.selectedStates.length > 0;
        const hasActiveTagFilter = filters.selectedTags.length > 0;
        
        meetsFilters = 
          (!hasActiveTierFilter || meetsTierFilter) &&
          (!hasActiveStateFilter || meetsStateFilter) &&
          (!hasActiveTagFilter || meetsTagFilter);
      }

      if (!meetsFilters) return;

      matching[tier][ability] = abilityData;
    });
  });

  return matching;
}

// Update ability options with preview
function updateAbilityOptionsPreview(filteredAbilities, matchCount) {
  // Update the apply button to show match count
  const applyBtn = document.querySelector('.filter-btn.apply');
  if (applyBtn) {
    applyBtn.textContent = `Apply Filters (${matchCount} match${matchCount !== 1 ? 'es' : ''})`;
  }
}

function applyFilters() {
  // Gather filter values
  activeFilters.minPower = parseInt(document.getElementById('powerSlider')?.value || 0);
  activeFilters.minSpeed = parseInt(document.getElementById('speedSlider')?.value || 0);
  activeFilters.minTrick = parseInt(document.getElementById('trickSlider')?.value || 0);
  activeFilters.minRecovery = parseInt(document.getElementById('recoverySlider')?.value || 0);
  activeFilters.minDefense = parseInt(document.getElementById('defenseSlider')?.value || 0);

  // Get selected tiers
  activeFilters.selectedTiers = Array.from(
    document.querySelectorAll('.tier-filter:checked')
  ).map(cb => cb.value);

  // Get selected states
  activeFilters.selectedStates = Array.from(
    document.querySelectorAll('.state-filter:checked')
  ).map(cb => cb.value);

  // Get selected tags
  activeFilters.selectedTags = Array.from(
    document.querySelectorAll('.tag-filter:checked')
  ).map(cb => cb.value);

  // Get filter mode
  activeFilters.mode = document.querySelector('input[name="filterMode"]:checked')?.value || 'and';

  // Update ability options
  updateAbilityOptions();
  updateDistributionTierSelect();
  updateStatDistributionChart();
}

function clearFilters() {
  // Reset filter values
  activeFilters = {
    minPower: 0,
    minSpeed: 0,
    minTrick: 0,
    minRecovery: 0,
    minDefense: 0,
    selectedTiers: [],
    selectedStates: [],
    selectedTags: [],
    mode: 'and'
  };

  // Reset UI
  document.getElementById('powerSlider').value = 0;
  document.getElementById('speedSlider').value = 0;
  document.getElementById('trickSlider').value = 0;
  document.getElementById('recoverySlider').value = 0;
  document.getElementById('defenseSlider').value = 0;

  document.getElementById('powerDisplay').textContent = '0';
  document.getElementById('speedDisplay').textContent = '0';
  document.getElementById('trickDisplay').textContent = '0';
  document.getElementById('recoveryDisplay').textContent = '0';
  document.getElementById('defenseDisplay').textContent = '0';

  document.querySelectorAll('.tier-filter, .state-filter, .tag-filter').forEach(cb => {
    cb.checked = false;
  });

  // Reset filter mode to AND
  document.querySelector('input[name="filterMode"][value="and"]').checked = true;

  // Update ability options
  updateAbilityOptions();
  updateDistributionTierSelect();
  updateStatDistributionChart();
}

function getAbilitiesMatchingFilters() {
  const matching = {};

  Object.keys(AbilitiesData).forEach(tier => {
    if (tier === '_meta') return;

    matching[tier] = {};

    Object.keys(AbilitiesData[tier]).forEach(ability => {
      if (ability === '_meta') return;

      const abilityData = AbilitiesData[tier][ability];
      const levels = abilityData.levels || {};

      // Check if any level meets stat requirements (always required)
      let meetsStatRequirements = false;
      Object.keys(levels).forEach(level => {
        const stats = levels[level];

        // Handle nested form levels (e.g., Phase Shift)
        if (stats && typeof stats === 'object' && !('Pow' in stats)) {
          Object.values(stats).forEach(formStats => {
            if (!formStats || typeof formStats !== 'object') return;
            if (formStats.Pow >= activeFilters.minPower &&
                formStats.Spd >= activeFilters.minSpeed &&
                formStats.Trick >= activeFilters.minTrick &&
                formStats.Recv >= activeFilters.minRecovery &&
                formStats.Def >= activeFilters.minDefense) {
              meetsStatRequirements = true;
            }
          });
        } else if (stats && typeof stats === 'object') {
          if (stats.Pow >= activeFilters.minPower &&
              stats.Spd >= activeFilters.minSpeed &&
              stats.Trick >= activeFilters.minTrick &&
              stats.Recv >= activeFilters.minRecovery &&
              stats.Def >= activeFilters.minDefense) {
            meetsStatRequirements = true;
          }
        }
      });

      if (!meetsStatRequirements) return;

      // Check tier filter
      let meetsTierFilter = true;
      if (activeFilters.selectedTiers.length > 0) {
        meetsTierFilter = activeFilters.selectedTiers.includes(tier);
      }

      // Check ability state filter
      let meetsStateFilter = true;
      if (activeFilters.selectedStates.length > 0) {
        const abilityState = abilityData._meta?.['ability-state'];
        // Only apply filter if ability has a state defined; abilities without state pass by default
        if (abilityState) {
          meetsStateFilter = activeFilters.selectedStates.includes(abilityState);
        }
      }

      // Check tag filter
      let meetsTagFilter = true;
      if (activeFilters.selectedTags.length > 0) {
        const abilityTags = abilityData._meta?.tags || [];
        if (activeFilters.mode === 'and') {
          // AND mode: ability must have ALL selected tags
          meetsTagFilter = activeFilters.selectedTags.every(tag => abilityTags.includes(tag));
        } else {
          // OR mode: ability must have ANY selected tag
          meetsTagFilter = activeFilters.selectedTags.some(tag => abilityTags.includes(tag));
        }
      }

      // Apply AND/OR logic across ALL filters (tiers, states, tags)
      let meetsFilters = true;
      if (activeFilters.mode === 'and') {
        // AND mode: ALL selected filters must match
        meetsFilters = meetsTierFilter && meetsStateFilter && meetsTagFilter;
      } else {
        // OR mode: Include ability if it passes any active filter
        // (A filter is "active" if selections exist for that category)
        const hasActiveTierFilter = activeFilters.selectedTiers.length > 0;
        const hasActiveStateFilter = activeFilters.selectedStates.length > 0;
        const hasActiveTagFilter = activeFilters.selectedTags.length > 0;
        
        meetsFilters = 
          (!hasActiveTierFilter || meetsTierFilter) &&
          (!hasActiveStateFilter || meetsStateFilter) &&
          (!hasActiveTagFilter || meetsTagFilter);
      }

      if (!meetsFilters) return;

      matching[tier][ability] = abilityData;
    });
  });

  return matching;
}

function updateAbilityOptions() {
  const filteredAbilities = getAbilitiesMatchingFilters();
  
  // Update abilitySelect with filtered options
  abilitySelect.innerHTML = '';
  let hasOptions = false;

  Object.keys(filteredAbilities).forEach(tier => {
    if (Object.keys(filteredAbilities[tier]).length === 0) return;

    const optgroup = document.createElement('optgroup');
    optgroup.label = tier;

    Object.keys(filteredAbilities[tier]).sort().forEach(ability => {
      const option = document.createElement('option');
      option.value = tier + '::' + ability;
      option.textContent = ability;
      optgroup.appendChild(option);
      hasOptions = true;
    });

    abilitySelect.appendChild(optgroup);
  });

  // If no options match, show message
  if (!hasOptions) {
    const option = document.createElement('option');
    option.disabled = true;
    option.textContent = 'No abilities match filters';
    abilitySelect.appendChild(option);
  } else {
    // Select first available option
    abilitySelect.value = abilitySelect.options[1]?.value || '';
    populateLevels(abilitySelect);
  }
}

// Favorites System
function saveFavorites() {
  localStorage.setItem('uncon-radar-favorites', JSON.stringify(favorites));
  updateFavoriteCount();
}

function loadFavorites() {
  const stored = localStorage.getItem('uncon-radar-favorites');
  favorites = stored ? JSON.parse(stored) : [];
  updateFavoriteCount();
  console.log('Favorites loaded:', favorites);
}

function isFavorite(abilityKey) {
  return favorites.includes(abilityKey);
}

function toggleFavorite(abilityKey) {
  const index = favorites.indexOf(abilityKey);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(abilityKey);
  }
  saveFavorites();
  updateFavoriteUI();
}

function getFavoritesList() {
  return favorites.map(key => {
    const [tier, ability] = key.split('::');
    return { tier, ability, key };
  }).sort((a, b) => a.ability.localeCompare(b.ability));
}

function clearAllFavorites() {
  favorites = [];
  saveFavorites();
  updateFavoriteUI();
  renderFavoritesModal();
}

function updateFavoriteCount() {
  const countEl = document.getElementById('favoriteCount');
  if (countEl) {
    countEl.textContent = favorites.length;
  }
}

function updateFavoriteUI() {
  // Update all star icons
  document.querySelectorAll('.favorite-star').forEach(star => {
    const abilityKey = star.dataset.abilityKey;
    if (isFavorite(abilityKey)) {
      star.textContent = '⭐';
      star.classList.add('favorited');
      star.classList.remove('unfavorited');
    } else {
      star.textContent = '☆';
      star.classList.remove('favorited');
      star.classList.add('unfavorited');
    }
  });

  // Update ability favorite buttons
  document.querySelectorAll('.ability-favorite-btn').forEach(btn => {
    const abilityKey = btn.dataset.abilityKey;
    if (isFavorite(abilityKey)) {
      btn.textContent = '⭐';
      btn.classList.add('favorited');
      btn.classList.remove('unfavorited');
    } else {
      btn.textContent = '☆';
      btn.classList.remove('favorited');
      btn.classList.add('unfavorited');
    }
  });

  // Update favorites modal
  if (!document.getElementById('favoritesModal').classList.contains('hidden')) {
    renderFavoritesModal();
  }
}

function renderFavoritesModal() {
  const modal = document.getElementById('favoritesModal');
  const listEl = document.getElementById('favoritesList');

  if (favorites.length === 0) {
    listEl.innerHTML = '<div class="favorites-list-empty"><p>⭐ No favorites yet</p><p style="font-size: 0.9rem; opacity: 0.8;">Star your favorite abilities to add them here!</p></div>';
    return;
  }

  const favoritesList = getFavoritesList();
  let html = '';

  favoritesList.forEach(({ tier, ability, key }) => {
    html += `<div class="favorites-list-item">
      <div class="favorites-list-item-info" onclick="selectFavoriteAbility('${key}')">
        <div class="favorites-list-item-name">${ability}</div>
        <div class="favorites-list-item-tier">${tier}</div>
      </div>
      <div class="favorites-list-item-actions">
        <button class="favorites-list-item-select" onclick="selectFavoriteAbility('${key}')" title="Select this ability" aria-label="Select ${ability}">Select</button>
        <button class="favorites-list-item-action" onclick="removeFavorite('${key}')" title="Remove from favorites" aria-label="Remove ${ability} from favorites">✕</button>
      </div>
    </div>`;
  });

  listEl.innerHTML = html;
}

function selectFavoriteAbility(abilityKey) {
  const [tier, ability] = abilityKey.split('::');
  const fullValue = tier + '::' + ability;
  abilitySelect.value = fullValue;
  populateLevels(abilitySelect);
  closeFavoritesModal();
}

function removeFavorite(abilityKey) {
  toggleFavorite(abilityKey);
  renderFavoritesModal();
}

function openFavoritesModal() {
  const modal = document.getElementById('favoritesModal');
  modal.classList.remove('hidden');
  modal.classList.add('show');
  renderFavoritesModal();
  document.body.style.overflow = 'hidden';
}

function closeFavoritesModal() {
  const modal = document.getElementById('favoritesModal');
  modal.classList.add('hidden');
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// Keyboard shortcut for favorites
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'f') {
    e.preventDefault();
    const modal = document.getElementById('favoritesModal');
    if (modal.classList.contains('hidden')) {
      openFavoritesModal();
    } else {
      closeFavoritesModal();
    }
  }
});

// Setup favorites button handlers
document.getElementById('favoritesBtn')?.addEventListener('click', () => {
  const modal = document.getElementById('favoritesModal');
  if (modal.classList.contains('hidden')) {
    openFavoritesModal();
  } else {
    closeFavoritesModal();
  }
});

document.getElementById('favoritesModalClose')?.addEventListener('click', closeFavoritesModal);

document.getElementById('clearFavoritesBtn')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all favorites?')) {
    clearAllFavorites();
  }
});

// Close modal when clicking outside
document.getElementById('favoritesModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'favoritesModal') {
    closeFavoritesModal();
  }
});

// Recent Abilities System
function saveRecent() {
  localStorage.setItem('uncon-radar-recent', JSON.stringify(recent));
  updateRecentCount();
}

function loadRecent() {
  const stored = localStorage.getItem('uncon-radar-recent');
  recent = stored ? JSON.parse(stored) : [];
  updateRecentCount();
  console.log('Recent abilities loaded:', recent);
}

function addToRecent(abilityKey) {
  // Remove if already exists (to move it to top)
  const index = recent.indexOf(abilityKey);
  if (index > -1) {
    recent.splice(index, 1);
  }
  
  // Add to beginning
  recent.unshift(abilityKey);
  
  // Keep only last 5
  if (recent.length > 5) {
    recent.pop();
  }
  
  saveRecent();
  updateRecentUI();
}

function getRecentAbilities() {
  return recent.map(key => {
    const [tier, ability] = key.split('::');
    return { tier, ability, key };
  });
}

function clearRecent() {
  recent = [];
  saveRecent();
  updateRecentUI();
}

function updateRecentCount() {
  const countEl = document.getElementById('recentCount');
  if (countEl) {
    countEl.textContent = recent.length;
  }
}

function updateRecentUI() {
  renderRecentList();
}

function renderRecentList() {
  const listEl = document.getElementById('recentList');

  if (recent.length === 0) {
    listEl.innerHTML = '<div class="recent-list-empty">No recent abilities</div>';
    return;
  }
  // Build elements to avoid nested button issues
  listEl.innerHTML = '';
  getRecentAbilities().forEach(({ tier, ability, key }) => {
    const item = document.createElement('div');
    item.className = 'recent-item';
    item.tabIndex = 0;

    const content = document.createElement('div');
    content.className = 'recent-item-content';

    const name = document.createElement('div');
    name.className = 'recent-item-name';
    name.textContent = ability + (isFavorite(key) ? ' ⭐' : '');

    const tierEl = document.createElement('div');
    tierEl.className = 'recent-item-tier';
    tierEl.textContent = tier;

    content.appendChild(name);
    content.appendChild(tierEl);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'recent-remove';
    removeBtn.type = 'button';
    removeBtn.title = 'Remove from recent';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', (ev) => { ev.stopPropagation(); removeFromRecent(key); });

    item.appendChild(content);
    item.appendChild(removeBtn);

    item.addEventListener('click', () => selectRecentAbility(key));
    item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') selectRecentAbility(key); });

    listEl.appendChild(item);
  });
}

function selectRecentAbility(abilityKey) {
  const [tier, ability] = abilityKey.split('::');
  const fullValue = tier + '::' + ability;
  abilitySelect.value = fullValue;
  populateLevels(abilitySelect);
  closeRecentDropdown();
}

function removeFromRecent(abilityKey) {
  const index = recent.indexOf(abilityKey);
  if (index > -1) {
    recent.splice(index, 1);
  }
  saveRecent();
  updateRecentUI();
}

function openRecentDropdown() {
  const dropdown = document.getElementById('recentDropdown');
  dropdown.classList.add('show');
}

function closeRecentDropdown() {
  const dropdown = document.getElementById('recentDropdown');
  dropdown.classList.remove('show');
}

// Keyboard shortcut for recent
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'r') {
    e.preventDefault();
    const dropdown = document.getElementById('recentDropdown');
    if (dropdown.classList.contains('show')) {
      closeRecentDropdown();
    } else {
      openRecentDropdown();
    }
  }
});

// Setup recent button handlers
document.getElementById('recentToggle')?.addEventListener('click', () => {
  const dropdown = document.getElementById('recentDropdown');
  if (dropdown.classList.contains('show')) {
    closeRecentDropdown();
  } else {
    openRecentDropdown();
  }
});

document.getElementById('clearRecentBtn')?.addEventListener('click', () => {
  clearRecent();
});

// Close recent dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.recent-abilities-container')) {
    closeRecentDropdown();
  }
});
