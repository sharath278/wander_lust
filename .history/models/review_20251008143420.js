const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: [true, "Comment cannot be empty"]
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});



module.exports = mongoose.model("Review",reviewSchema);