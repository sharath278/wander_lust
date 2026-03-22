const express = require("express");
const router = express.Router();
const Review = require("../models/review"); // ✅ make sure path is correct
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// POST review
router.post("/:listingId", isLoggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) throw new Error("Listing not found");

    const newReview = new Review(req.body);
    newReview.author = req.user._id;
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    req.flash("success", "New review submitted!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while submitting the review.");
  }
});

// DELETE review
router.delete("/:reviewId", isLoggedIn, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) throw new Error("Review not found");

    if (!review.author.equals(req.user._id)) {
      req.flash("error", "You don't have permission to delete this review.");
      return res.redirect("back");
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    const listing = await Listing.findOne({ reviews: req.params.reviewId });
    if (listing) {
      listing.reviews.pull(req.params.reviewId);
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
