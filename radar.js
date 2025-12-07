let AbilitiesData = {};
let compareMode = false;

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
    responsive: false,
    scales: { r: { suggestedMin: 0, suggestedMax: 10, ticks: { stepSize: 2 } } }
  }
});

function updateChartColors() {
  const isDark = document.body.classList.contains('dark-mode');

  radarChart.data.datasets.forEach((dataset, i) => {
    if (i === 0) { 
      dataset.borderColor = isDark ? 'rgba(100,180,255,1)' : 'rgba(3,102,214,1)';
      dataset.backgroundColor = isDark ? 'rgba(100,180,255,0.2)' : 'rgba(3,102,214,0.15)';
      dataset.pointBackgroundColor = isDark ? 'rgba(100,180,255,1)' : 'rgba(3,102,214,1)';
    } else {
      dataset.borderColor = isDark ? 'rgba(255,130,150,1)' : 'rgba(255,99,132,1)';
      dataset.backgroundColor = isDark ? 'rgba(255,130,150,0.2)' : 'rgba(255,99,132,0.15)';
      dataset.pointBackgroundColor = isDark ? 'rgba(255,130,150,1)' : 'rgba(255,99,132,1)';
    }
  });

  radarChart.options.scales.r = {
    suggestedMin: 0,
    suggestedMax: 10,
    ticks: {
      stepSize: 2,
      color: isDark ? '#aaa' : '#666',
      backdropColor: 'transparent'
    },
    grid: {
      color: isDark ? '#444' : '#ccc'
    },
    angleLines: {
      color: isDark ? '#444' : '#ccc'
    },
    pointLabels: {
      color: isDark ? '#f0f0f0' : '#333',
      font: {
        size: 14
      }
    }
  };

  radarChart.options.plugins.legend = {
    labels: {
      color: isDark ? '#f0f0f0' : '#333'
    }
  };

  radarChart.options.plugins.tooltip = {
    backgroundColor: isDark ? '#333' : '#fff',
    titleColor: isDark ? '#f0f0f0' : '#000',
    bodyColor: isDark ? '#ddd' : '#000',
    borderColor: isDark ? '#555' : '#ccc',
    borderWidth: 1
  };

  radarChart.update();
}



const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  updateChartColors();
});

console.log('Loading abilities.json...');
fetch('abilities.json')
  .then(response => {
    if (!response.ok) throw new Error('JSON file not found!');
    return response.json();
  })
  .then(data => {
    AbilitiesData = data;
    console.log('Abilities data loaded:', AbilitiesData);

    populateAbilities();
    populateAbilities(abilitySelect2);
    updateChart(); 
  })
  .catch(err => console.error('Error loading abilities.json:', err));
  
function populateAbilities(selectEl = abilitySelect) {
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


function populateLevels(selectEl = abilitySelect) {
  const [tier, ability] = selectEl.value?.split('::') || [];
  const levelSelectEl = (selectEl === abilitySelect) ? levelSelect : levelSelect2;

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

  let displayAbility = ability;
  if (ability === 'Phase Shift' && level.includes('::')) {
    const [form] = level.split('::');
    displayAbility = `${ability} (${form})`;
  }

  const labels = ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'];
  const dataValues1 = [stats1.Pow, stats1.Spd, stats1.Trick, stats1.Recv, stats1.Def];

  radarChart.data.labels = labels;

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

  renderStatsCompare(stats1, stats2, displayAbility, displayAbility2);

  if (compareMode && stats2) renderComparison(stats1, stats2, displayAbility, displayAbility2);
  else document.getElementById('comparisonSummary').classList.add('hidden');
}


function renderStatsCompare(statsA, statsB, nameA, nameB) {
  let html = `<div class="stats-cards-container">`;

  html += `<div class="stats-card stats-card-blue">
    <h3>${nameA}</h3>`;
  Object.keys(statsA).forEach(key => {
    html += `<div><strong>${key}:</strong> <span>${statsA[key]}</span></div>`;
  });
  html += `</div>`;

  if (statsB) {
    html += `<div class="stats-card stats-card-red">
      <h3>${nameB}</h3>`;
    Object.keys(statsB).forEach(key => {
      html += `<div><strong>${key}:</strong> <span>${statsB[key]}</span></div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  statsDisplay.innerHTML = html;
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

abilitySelect.addEventListener('change', () => populateLevels(abilitySelect));
levelSelect.addEventListener('change', updateChart);
ampModeSelect.addEventListener('change', updateChart);

abilitySelect2.addEventListener('change', () => populateLevels(abilitySelect2));
levelSelect2.addEventListener('change', updateChart);
ampModeSelect2.addEventListener('change', updateChart);

compareToggle.addEventListener('click', () => {
  compareMode = !compareMode;
  compareControls.classList.toggle('hidden', !compareMode);
  compareToggle.textContent = compareMode ? 'Disable Compare Mode' : 'Enable Compare Mode';
  console.log('Compare mode toggled:', compareMode);
  updateChart();
});
