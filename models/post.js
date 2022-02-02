const mongoose = require("mongoose");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 1000 },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, required: true },
});

PostSchema.virtual("timestring").get(function () {
  dayjs.extend(relativeTime);
  return dayjs(this.timestamp).fromNow();
});

module.exports = mongoose.model("Post", PostSchema);
