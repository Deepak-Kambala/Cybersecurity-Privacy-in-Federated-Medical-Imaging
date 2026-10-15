(function () {
  // Attack demo
  var toggle = document.getElementById('attack-toggle');
  var bad = document.getElementById('share-bad');
  var ok = document.getElementById('share-ok');
  var badL = document.getElementById('share-bad-label');
  var okL = document.getElementById('share-ok-label');
  var acc = document.getElementById('demo-acc');
  toggle.addEventListener('click', function () {
    var on = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(on));
    toggle.textContent = on ? 'Remove the attack' : 'Apply label flipping and 8\u00d7 scaling';
    bad.style.width = on ? '68%' : '21%';
    ok.style.width = on ? '32%' : '79%';
    badL.textContent = on ? '68%' : '21%';
    okL.textContent = on ? '32%' : '79%';
    acc.textContent = 'Global accuracy: ' + (on ? '50.0%' : '79.8%');
  });

  // Threat tabs
  var threats = [
    { id: 'poison', name: 'Poisoning', body: [
      'A malicious client submits updates built to bias the global model. It can corrupt its local data, for example by flipping diagnostic labels, or alter the update itself, for example by scaling it up to dominate the average (a model-replacement attack).',
      'Because FedAvg weights clients by self-reported dataset size, an attacker can also gain influence just by misreporting how much data it has.'] },
    { id: 'backdoor', name: 'Backdoors', body: [
      'A backdoor is a targeted poisoning attack. The model keeps normal accuracy but misclassifies any image that carries an attacker-chosen trigger pattern.',
      'In imaging, that could be a model that behaves correctly on nearly every scan yet fails on images with a specific visual artifact. Overall validation accuracy does not reveal it, which makes it hard to detect.'] },
    { id: 'byzantine', name: 'Byzantine clients', body: [
      'A Byzantine client can send arbitrary, even coordinated, updates with no link to real training. Robust aggregation rules bound its influence, assuming a limit on how many such clients exist.',
      'In hospital data these rules can fail in both directions: they can miss a well-disguised attacker, or penalize an honest hospital whose patients differ from the majority.'] },
    { id: 'leak', name: 'Inference and leakage', body: [
      'Even without poisoning, shared updates can leak information. Membership inference tries to tell whether a specific patient record was used in training. Gradient inversion and feature leakage try to reconstruct approximate inputs or properties of the training population.',
      'An honest-but-curious aggregator or an eavesdropper could learn which hospital treated certain cases or approximate image content.'] }
  ];
  var tabs = document.getElementById('threat-tabs');
  var panel = document.getElementById('threat-panel');
  function showThreat(i) {
    threats.forEach(function (t, j) {
      var b = document.getElementById('tab-' + t.id);
      b.setAttribute('aria-selected', String(i === j));
      b.tabIndex = i === j ? 0 : -1;
    });
    var t = threats[i];
    panel.setAttribute('aria-labelledby', 'tab-' + t.id);
    panel.innerHTML = '<h3>' + t.name + '</h3>' + t.body.map(function (p) { return '<p>' + p + '</p>'; }).join('');
  }
  threats.forEach(function (t, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'tab-' + t.id; b.textContent = t.name;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', function () { showThreat(i); });
    b.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (n === null) return;
      n = (n + threats.length) % threats.length;
      showThreat(n); document.getElementById('tab-' + threats[n].id).focus();
    });
    tabs.appendChild(b);
  });
  showThreat(0);

  // Results chart (values from Table 1 of the paper)
  var results = [
    { name: 'FedAvg, no attack', v: 79.8, cls: 'base', note: 'Baseline: five honest hospitals, standard averaging. Stabilizes by round 2.' },
    { name: 'FedAvg, poisoned', v: 50.0, cls: 'bad', note: 'One malicious hospital collapses the model to chance level immediately, by round 2.' },
    { name: 'Krum', v: 83.0, cls: '', note: 'Best result, slightly above the unattacked baseline. It keeps one client update per round, so it converges slowest, around round 7.' },
    { name: 'Trimmed mean', v: 82.8, cls: '', note: 'Nearly matches Krum and stabilizes by round 3. It averages what remains after dropping extremes at each coordinate.' },
    { name: 'Median', v: 75.0, cls: '', note: 'Recovers most accuracy but ends below baseline. The authors attribute this to discarding more usable information per coordinate under non-IID data.' }
  ];
  var chart = document.getElementById('chart');
  var note = document.getElementById('chart-note');
  function pick(i) {
    chart.querySelectorAll('.row').forEach(function (r, j) { r.setAttribute('aria-pressed', String(i === j)); });
    note.textContent = results[i].note;
  }
  results.forEach(function (r, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'row ' + r.cls; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="name">' + r.name + '</span><span class="track"><span class="bar" style="display:block;width:' + r.v + '%"></span></span><span class="val">' + r.v.toFixed(1) + '%</span>';
    b.addEventListener('click', function () { pick(i); });
    chart.appendChild(b);
  });
  pick(2);

  // Contents highlight
  var links = document.querySelectorAll('.toc a');
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('active'); });
        map[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });

  // Copy citation
  var copy = document.getElementById('copy-cite');
  copy.addEventListener('click', function () {
    var text = document.getElementById('cite-text').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { copy.textContent = 'Copied'; });
  });
})();
