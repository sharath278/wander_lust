const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner } = require("../middleware");

// Index
router.get("/", async (req,res,next)=>{
  try{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
  }catch(err){ next(err) }
});

// New
router.get("/new", isLoggedIn, (req,res)=>{
  res.render("listings/new.ejs");
});

// Create
router.post("/", isLoggedIn, async (req,res,next)=>{
  try{
    const { title, description, imageurl, price, location, country } = req.body;
    const newListing = new Listing({
      title, description, image:{ url:imageurl },
      price, location, country, owner:req.user._id
    });
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
  }catch(err){ next(err) }
});

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, async (req,res,next)=>{
  try{
    const { id } = req.params;
    const oldlisting = await Listing.findById(id);
    if(!oldlisting) throw new Error("Listing not found");
    res.render("listings/edit.ejs",{ oldlisting });
  }catch(err){ next(err) }
});

// Update
router.put("/:id", isLoggedIn, isOwner, async (req,res,next)=>{
  try{
    const { id } = req.params;
    const { title, description, imageurl, price, location, country } = req.body;
    const updated = await Listing.findByIdAndUpdate(id,{
      title, description, image:{ url:imageurl },
      price, location, country
    },{ new:true });
    if(!updated) throw new Error("Listing not found");
    req.flash("success","Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  }catch(err){ next(err) }
});

// Delete
router.delete("/:id", isLoggedIn, isOwner, async (req,res,next)=>{
  try{
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
      req.flash("error","Invalid listing ID");
      return res.redirect("/listings");
    }
    const deleted = await Listing.findByIdAndDelete(id);
    if(!deleted) throw new Error("Listing not found");
    req.flash("success","Listing deleted successfully!");
    res.redirect("/listings");
  }catch(err){ next(err) }
});

// Show
router.get("/:id", async (req,res,next)=>{
  try{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path : "reviews",populate : { path : "author",},}).populate("owner");
    if(!listing) throw new Error("Listing not found");
    res.render("listings/show.ejs",{ listing });
  }catch(err){ next(err) }
});

module.exports = router;
