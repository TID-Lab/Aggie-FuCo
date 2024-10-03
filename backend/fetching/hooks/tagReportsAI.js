// Adds AI-generated tags to the report

module.exports = async function tagReportsAI(report, next) {
  const axios = require("axios");

  try {
    console.log("PreAPI Report", JSON.parse(JSON.stringify(report)));
    const response = await axios.post(
      "http://localhost:8080/twoshotextract",
      JSON.parse(JSON.stringify(report))
    );
    const data = response.data;

    const aiTags = {};
    const tagNames = [];

    for (const key in data) {
      if (!key.endsWith("_rationale")) {
        const rationaleKey = `${key}_rationale`;
        aiTags[key] = {
          value: data[key],
          rationale: data[rationaleKey] || null,
        };
        tagNames.push(key);
      }
    }
    console.log(aiTags);
    console.log(tagNames);
    report.tags = aiTags;
    report.tagNames = tagNames;
  } catch (error) {
    console.error("Error fetching AI tags:", error);
    const aiTags = {
      key1: { value: true, rationale: "Default rationale for key1" },
      key2: {
        value: "default string",
        rationale: "Default rationale for key2",
      },
    };
    report.tags = aiTags;
    report.tagNames = Object.keys(aiTags);
  }
  console.log(report);

  await next();
};
