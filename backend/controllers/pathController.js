const {
  dpPath, greedyNext, estimateCompletion,
  rankResources, explainDecision, KNOWLEDGE_GRAPH, NODE_MAP,
} = require('../services/algorithmService');

// POST /api/path/generate
exports.generatePath = async (req, res) => {
  try {
    const user           = req.user;
    const completedArray = user.completedTopics || [];
    const scoresObj      = Object.fromEntries(user.scores || new Map());

    const path      = dpPath(completedArray, user.mode, user.level);
    const nextTopic = greedyNext(path, scoresObj);
    const estimate  = estimateCompletion(path, user.dailyHours);
    const explain   = explainDecision(nextTopic, user.mode, scoresObj);

    // Attach resources to each topic in path
    const pathWithResources = path.map(n => ({
      ...n,
      resources: rankResources(n.name),
    }));

    res.json({
      path: pathWithResources,
      nextTopic: nextTopic ? { ...nextTopic, resources: rankResources(nextTopic.name) } : null,
      estimate,
      explanation: explain,
      allTopics: KNOWLEDGE_GRAPH,
      completedTopics: completedArray,
      totalTopics: KNOWLEDGE_GRAPH.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/path/topics  — returns full knowledge graph
exports.getAllTopics = async (req, res) => {
  res.json({ topics: KNOWLEDGE_GRAPH });
};

// GET /api/path/topic/:id
exports.getTopic = async (req, res) => {
  const node = NODE_MAP[req.params.id];
  if (!node) return res.status(404).json({ message: 'Topic not found' });
  res.json({ topic: { ...node, resources: rankResources(node.name) } });
};
