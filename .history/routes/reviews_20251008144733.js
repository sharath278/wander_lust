const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const Review = require("../models/review");

// POST review for a listing
router.post("/:listingId", isLoggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) throw new Error("Listing not found");

    // Create review
    const newReview = new Review(req.body);
    newReview.author = req.user._id;
    await newReview.save();

    // Add to listing
    listing.reviews.push(newReview);
    await listing.save();

    req.flash("success", "New review submitted!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    if (err.name === "ValidationError") {
      console.log("Validation failed:", err.message);
      return res
        .status(400)
        .send("⚠️ Please fill in all required fields before submitting.");
    }
    console.error(err);
    res.status(500).send("Something went wrong while submitting the review.");
  }
});

// DELETE a review (only author can delete)
router.delete("/:reviewId", isLoggedIn, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    // Only the author can delete
    if (!review.author.equals(req.user._id)) {
      req.flash("error", "You don't have permission to delete this review.");
      return res.redirect("back");
    }

    await Review.findByIdAndDelete(reviewId);

    // Remove reference from listing
    const listing = await Listing.findOne({ reviews: reviewId });
    if (listing) {
      listing.reviews.pull(reviewId);
      await listing.save();
    }

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while deleting the review.");
  }
});

module.exports = router;
