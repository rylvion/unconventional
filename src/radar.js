let AbilitiesData = {};
const abilitySelect = document.getElementById('abilitySelect');
const levelSelect = document.getElementById('levelSelect');
const statsDisplay = document.getElementById('statsDisplay');

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
  Object.keys(AbilitiesData).forEach(ability => {
    const option = document.createElement('option');
    option.value = ability;
    option.textContent = ability;
    abilitySelect.appendChild(option);
  });
  populateLevels();
}

function populateLevels() {
  const ability = abilitySelect.value;
  levelSelect.innerHTML = '';

  const levels = Object.keys(AbilitiesData[ability])
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
  const ability = abilitySelect.value;
  const level = levelSelect.value;
  const stats = AbilitiesData[ability][level];

  if (!stats) return;

  const dataValues = [stats.Pow, stats.Spd, stats.Trick, stats.Recv, stats.Def];

  radarChart.data.labels = [
    `Power  ${stats.Pow}`,
    `Speed  ${stats.Spd}`,
    `Trick  ${stats.Trick}`,
    `Recovery  ${stats.Recv}`,
    `Defense  ${stats.Def}`
  ];

  radarChart.data.datasets[0].data = dataValues;
  radarChart.update();

  statsDisplay.innerHTML = `
    <div><strong>Power:</strong> <strong style="color: blue;">${stats.Pow}</strong></div>
    <div><strong>Speed:</strong> <strong style="color: blue;">${stats.Spd}</strong></div>
    <div><strong>Trick:</strong> <strong style="color: blue;">${stats.Trick}</strong></div>
    <div><strong>Recovery:</strong> <strong style="color: blue;">${stats.Recv}</strong></div>
    <div><strong>Defense:</strong> <strong style="color: blue;">${stats.Def}</strong></div>
  `;
}

abilitySelect.addEventListener('change', populateLevels);
levelSelect.addEventListener('change', updateChart);