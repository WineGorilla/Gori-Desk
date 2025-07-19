const path = require("path");
const rcedit = require("rcedit");

module.exports = async function (context) {
  const exePath = path.join(context.appOutDir, "GoriDesk.exe");

  try {
    await rcedit(exePath, {
      icon: path.join(__dirname, "goriicon.ico")
    });
    console.log("Icon has been embedded in GoriDesk.exe");
  } catch (err) {
    console.error("Fail to embedd", err);
  }
};
