let AbilitiesData = {};
const abilitySelect = document.getElementById('abilitySelect');
const levelSelect = document.getElementById('levelSelect');
const statsDisplay = document.getElementById('statsDisplay');
const ampModeSelect = document.getElementById('ampModeSelect');

const ctx = document.getElementById('radarChart').getContext('2d');
const radarChart = new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
    datasets: [{
      label: 'Stats',
      data: [],
      fill: true,
      backgroundColor: 'rgba(3,102,214,0.15)',
      borderColor: 'rgba(3,102,214,1)',
      pointBackgroundColor: 'rgba(3,102,214,1)',
      pointRadius: 4,
      borderWidth: 2
    }]
  },
  options: {
    responsive: false,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: { stepSize: 2 },
        pointLabels: { font: { size: 14 } }
      }
    },
    elements: { line: { borderJoinStyle: 'round' } }
  }
});

fetch('abilities.json')
  .then(response => response.json())
  .then(data => {
    AbilitiesData = data;
    populateAbilities();
  })
  .catch(err => console.error('Error loading abilities.json:', err));

function populateAbilities() {
  abilitySelect.innerHTML = '';

  Object.keys(AbilitiesData).forEach(tier => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = tier;

    Object.keys(AbilitiesData[tier]).forEach(ability => {
      const option = document.createElement('option');
      option.value = tier + '::' + ability;
      option.textContent = ability;
      optgroup.appendChild(option);
    });

    abilitySelect.appendChild(optgroup);
  });

  populateLevels();
}

function populateLevels() {
  const [tier, ability] = abilitySelect.value.split('::');
  levelSelect.innerHTML = '';

  const levels = Object.keys(AbilitiesData[tier][ability])
    .map(parseFloat)
    .sort((a, b) => a - b);

  levels.forEach(level => {
    const option = document.createElement('option');
    option.value = level.toFixed(1);
    option.textContent = level.toFixed(1);
    levelSelect.appendChild(option);
  });

  updateChart();
}

function updateChart() {
  const [tier, ability] = abilitySelect.value.split('::');
  const level = levelSelect.value;
  let stats = { ...AbilitiesData[tier][ability][level] };

  if (!stats) return;

  const mode = ampModeSelect.value;

  let borderColor = 'rgba(3,102,214,1)';
  let backgroundColor = 'rgba(3,102,214,0.15)';
  let statColor = 'blue';

  if (mode === 'amped') {
    Object.keys(stats).forEach(key => stats[key] = (stats[key] * 1.5).toFixed(1));
    borderColor = 'rgba(0,200,0,1)';
    backgroundColor = 'rgba(0,200,0,0.15)';
    statColor = 'green';
  } else if (mode === 'deamped') {
    Object.keys(stats).forEach(key => stats[key] = (stats[key] / 2).toFixed(1));
    borderColor = 'rgba(255,80,0,1)';
    backgroundColor = 'rgba(255,80,0,0.15)';
    statColor = 'orangered';
  }

  const dataValues = [stats.Pow, stats.Spd, stats.Trick, stats.Recv, stats.Def];

  radarChart.data.labels = [
    `Power  ${stats.Pow}`,
    `Speed  ${stats.Spd}`,
    `Trick  ${stats.Trick}`,
    `Recovery  ${stats.Recv}`,
    `Defense  ${stats.Def}`
  ];

  radarChart.data.datasets[0].data = dataValues;
  radarChart.data.datasets[0].borderColor = borderColor;
  radarChart.data.datasets[0].backgroundColor = backgroundColor;
  radarChart.data.datasets[0].pointBackgroundColor = borderColor;

  radarChart.update();

  statsDisplay.innerHTML = `
    <div><strong>Power:</strong> <strong style="color: ${statColor};">${stats.Pow}</strong></div>
    <div><strong>Speed:</strong> <strong style="color: ${statColor};">${stats.Spd}</strong></div>
    <div><strong>Trick:</strong> <strong style="color: ${statColor};">${stats.Trick}</strong></div>
    <div><strong>Recovery:</strong> <strong style="color: ${statColor};">${stats.Recv}</strong></div>
    <div><strong>Defense:</strong> <strong style="color: ${statColor};">${stats.Def}</strong></div>
  `;
}

abilitySelect.addEventListener('change', populateLevels);
levelSelect.addEventListener('change', updateChart);
ampModeSelect.addEventListener('change', updateChart);
