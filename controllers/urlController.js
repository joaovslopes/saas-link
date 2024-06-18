const shortid = require("shortid");
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
  try {
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: "url is required" });
    if (!body.title) return res.status(400).json({ error: "title is required" });

    const shortID = body.id || shortid.generate();

    console.log(`Generated/Provided shortID: ${shortID}`); 

    const existingURL = await URL.findOne({ shortId: shortID });
    if (existingURL) {
      return res.status(400).json({ error: "ID already exists" });
    }

    await URL.create({
      title: body.title,
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [],
    });

    return res.json({ id: shortID });
  } catch (error) {
    console.error("Error generating new short URL:", error); 
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGetAnalytics(req, res) {
  try {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    if (!result) {
      return res.status(404).json({ error: "ID not found" });
    }
    return res.json({
      title: result.title,
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });
  } catch (error) {
    console.error("Error getting analytics:", error); 
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};
