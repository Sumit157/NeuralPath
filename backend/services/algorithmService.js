/**
 * algorithmService.js
 * All core algorithm logic: DAG, topological sort, DP path, greedy selection,
 * Ebbinghaus forgetting curve, greedy resource ranking.
 */

// ══════════════════════════════════════════════════
//  KNOWLEDGE GRAPH  (Directed Acyclic Graph)
// ══════════════════════════════════════════════════
const KNOWLEDGE_GRAPH = [
  { id:'py',     name:'Python Basics',         diff:1, time:8,  imp:10, tags:['Python'],         prereqs:[],                    desc:'Variables, control flow, OOP, file I/O' },
  { id:'py2',    name:'Python Advanced',       diff:2, time:6,  imp:8,  tags:['Python'],         prereqs:['py'],                desc:'Decorators, generators, context managers, async/await' },
  { id:'git',    name:'Git & Version Control', diff:1, time:3,  imp:7,  tags:['Tools'],          prereqs:[],                    desc:'Branching, merging, GitHub workflows, PRs' },
  { id:'math',   name:'Linear Algebra',        diff:3, time:10, imp:9,  tags:['Math'],           prereqs:['py'],                desc:'Vectors, matrices, eigenvalues, PCA foundations' },
  { id:'stats',  name:'Statistics & Prob.',    diff:2, time:8,  imp:9,  tags:['Math'],           prereqs:['py'],                desc:'Distributions, hypothesis testing, Bayesian basics' },
  { id:'pandas', name:'Pandas & NumPy',        diff:2, time:5,  imp:8,  tags:['Python','Data'],  prereqs:['py'],                desc:'DataFrames, array ops, data wrangling pipelines' },
  { id:'viz',    name:'Data Visualisation',    diff:1, time:4,  imp:6,  tags:['Data'],           prereqs:['pandas'],            desc:'Matplotlib, Seaborn, Plotly, storytelling with data' },
  { id:'sql',    name:'SQL & Databases',       diff:2, time:6,  imp:7,  tags:['Data'],           prereqs:['py'],                desc:'Queries, joins, window functions, indexing' },
  { id:'ml',     name:'Machine Learning Core', diff:3, time:12, imp:10, tags:['ML'],             prereqs:['math','stats','pandas'], desc:'Regression, classification, clustering, validation' },
  { id:'fe',     name:'Feature Engineering',   diff:3, time:7,  imp:8,  tags:['ML','Data'],      prereqs:['ml'],                desc:'Selection, encoding, scaling, feature creation' },
  { id:'dl',     name:'Deep Learning',         diff:4, time:15, imp:9,  tags:['ML','DL'],        prereqs:['ml'],                desc:'Neural nets, backprop, CNNs, RNNs, PyTorch' },
  { id:'nlp',    name:'NLP & Transformers',    diff:4, time:10, imp:8,  tags:['ML','NLP'],       prereqs:['dl'],                desc:'Tokenisation, BERT, GPT fine-tuning, RAG' },
  { id:'cv',     name:'Computer Vision',       diff:4, time:10, imp:8,  tags:['ML','CV'],        prereqs:['dl'],                desc:'CNN architectures, YOLO, object detection, segmentation' },
  { id:'mlops',  name:'MLOps & Deployment',    diff:3, time:8,  imp:8,  tags:['Ops'],            prereqs:['ml'],                desc:'Docker, FastAPI, CI/CD, model monitoring, serving' },
];

const NODE_MAP = {};
KNOWLEDGE_GRAPH.forEach(n => (NODE_MAP[n.id] = n));

// ══════════════════════════════════════════════════
//  TOPOLOGICAL SORT  (Kahn's BFS)
// ══════════════════════════════════════════════════
function topoSort(nodes) {
  const inDeg = {}, adj = {};
  nodes.forEach(n => { inDeg[n.id] = 0; adj[n.id] = []; });
  nodes.forEach(n => n.prereqs.forEach(p => {
    if (adj[p]) adj[p].push(n.id);
    inDeg[n.id]++;
  }));
  const queue  = nodes.filter(n => inDeg[n.id] === 0).map(n => n.id);
  const order  = [];
  while (queue.length) {
    const cur = queue.shift();
    order.push(cur);
    (adj[cur] || []).forEach(nx => { if (--inDeg[nx] === 0) queue.push(nx); });
  }
  return order;
}

// ══════════════════════════════════════════════════
//  DP SCORING  — mode-weighted optimal path
// ══════════════════════════════════════════════════
const MODE_WEIGHTS = {
  fast:     { t: 0.6, i: 0.3, d: 0.1 },
  deep:     { t: 0.1, i: 0.5, d: 0.4 },
  balanced: { t: 0.3, i: 0.4, d: 0.3 },
};

function dpPath(completedSet, mode, level) {
  const W     = MODE_WEIGHTS[mode] || MODE_WEIGHTS.balanced;
  const order = topoSort(KNOWLEDGE_GRAPH);

  // Available: not completed, all prereqs met
  const available = order
    .filter(id => !completedSet.includes(id) && NODE_MAP[id]?.prereqs.every(p => completedSet.includes(p)))
    .map(id => {
      const n      = NODE_MAP[id];
      const tScore = 1 - n.time / 20;                          // time efficiency
      const iScore = n.imp / 10;                               // importance
      const targetDiff = level === 'beginner' ? 2 : level === 'advanced' ? 4 : 3;
      const dScore = 1 - Math.abs(n.diff - targetDiff) / 4;   // difficulty match
      return { ...n, score: W.t * tScore + W.i * iScore + W.d * dScore };
    })
    .sort((a, b) => b.score - a.score);

  return available;
}

// ══════════════════════════════════════════════════
//  GREEDY NEXT  — boost weak-area topics
// ══════════════════════════════════════════════════
function greedyNext(path, scores) {
  const weakIds = Object.entries(scores || {})
    .filter(([, s]) => s < 75)
    .map(([id]) => id);

  return path
    .map(n => ({ ...n, score: weakIds.includes(n.id) ? n.score * 1.25 : n.score }))
    .sort((a, b) => b.score - a.score)[0] || null;
}

// ══════════════════════════════════════════════════
//  EBBINGHAUS RETENTION
// ══════════════════════════════════════════════════
function retention(daysAgo, score) {
  return Math.round(Math.exp(-0.1 * daysAgo) * (score / 100) * 100);
}

// ══════════════════════════════════════════════════
//  COMPLETION ESTIMATE
// ══════════════════════════════════════════════════
function estimateCompletion(path, dailyHours) {
  const totalHours = path.reduce((s, n) => s + n.time, 0);
  const days       = Math.ceil(totalHours / (dailyHours || 2));
  const date       = new Date(Date.now() + days * 86400000);
  return {
    days,
    totalHours,
    label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
}

// ══════════════════════════════════════════════════
//  GREEDY RESOURCE RANKING
// ══════════════════════════════════════════════════
function rankResources(topicName) {
  const pool = [
    { type: 'video',   title: `${topicName} — Full Course`,        dur: '3h 20min', rating: 4.9, rel: 10 },
    { type: 'article', title: `Deep Dive: ${topicName}`,           dur: '25 min',   rating: 4.7, rel: 8  },
    { type: 'quiz',    title: 'Practice Problem Set',              dur: '40 min',   rating: 4.8, rel: 9  },
    { type: 'video',   title: `${topicName} — Quick Reference`,    dur: '48 min',   rating: 4.5, rel: 7  },
  ];
  return pool.sort((a, b) => b.rating * b.rel - a.rating * a.rel).slice(0, 3);
}

// ══════════════════════════════════════════════════
//  SPACED REVISION SCHEDULER
// ══════════════════════════════════════════════════
function buildRevisionSchedule(completedTopics, scores) {
  return completedTopics
    .filter(id => NODE_MAP[id] && scores[id] !== undefined)
    .map(id => {
      const score     = scores[id] || 0;
      const daysLeft  = score >= 80 ? 14 : score >= 60 ? 7 : 3;
      return {
        topicId:  id,
        name:     NODE_MAP[id].name,
        daysLeft,
        score,
        scheduledAt: new Date(Date.now() + daysLeft * 86400000),
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

// ══════════════════════════════════════════════════
//  BURNOUT DETECTION
// ══════════════════════════════════════════════════
function calcBurnout(weeklyHours, scores) {
  const avg      = weeklyHours.reduce((a, b) => a + b, 0) / 7;
  const scoreArr = Object.values(scores || {});
  const avgScore = scoreArr.length ? scoreArr.reduce((a, b) => a + b, 0) / scoreArr.length : 75;
  // High hours + dropping scores → burnout
  const hoursFactor = Math.min(avg / 8, 1) * 50;
  const scoreFactor = Math.max(0, (75 - avgScore) / 75) * 50;
  return Math.round(hoursFactor + scoreFactor);
}

// ══════════════════════════════════════════════════
//  EXPLANATION GENERATOR
// ══════════════════════════════════════════════════
function explainDecision(nextTopic, mode, scores) {
  if (!nextTopic) return 'All topics completed! Great job.';
  const weakIds  = Object.entries(scores || {}).filter(([, s]) => s < 75).map(([id]) => id);
  const isWeak   = weakIds.includes(nextTopic.id);
  const W        = MODE_WEIGHTS[mode] || MODE_WEIGHTS.balanced;
  const formula  = `${W.t}×time_efficiency + ${W.i}×importance + ${W.d}×difficulty_match`;
  let reason     = `"${nextTopic.name}" was selected by the DP + Greedy engine with score ${nextTopic.score?.toFixed(3)}.`;
  if (isWeak) reason += ` Score boosted ×1.25 because you previously scored below 75% on related prerequisites.`;
  reason += ` Scoring formula (${mode} mode): ${formula}. Importance: ${nextTopic.imp}/10, Difficulty: ${nextTopic.diff}/5, Est. time: ${nextTopic.time}h.`;
  return reason;
}

module.exports = {
  KNOWLEDGE_GRAPH,
  NODE_MAP,
  topoSort,
  dpPath,
  greedyNext,
  retention,
  estimateCompletion,
  rankResources,
  buildRevisionSchedule,
  calcBurnout,
  explainDecision,
};
