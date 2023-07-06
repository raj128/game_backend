// gameRoutes.js (Express API routes)
// const express = require('express');
import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();
import Game from "../models/game.model.js";
import User from "../models/user.model.js";

// Route for fetching all games
router.get("/games", async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route for fetching games by category
router.get("/games/category/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const games = await Game.find({ categories: category });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route for fetching a game by name
router.get("/games/name/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const game = await Game.findOne({ name });
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ error: "Game not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route for adding a new game
router.post("/games", async (req, res) => {
    // console.log(req.body);
  const {name,image,link,categories} = req.body;

  try {
    const game = new Game({ name:name, link:link, image:image, categories:categories });
    const savedGame = await game.save();
    res.status(201).json({success:true});
  } catch (err) {
    res.status(400).json({ error: "Bad request" });
  }
});

// Assuming you have a User model and a Game model defined
router.get('/favgames', async (req, res) => {
  try {
    // Fetch the user's favorite games from the user database and populate the 'favoriteGames' field
    const { cookie } = req.headers;

    if (!cookie) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Access token is missing',
      });
    }

    try {
      const cookieParts = cookie.split(';');
      const decodedCookie = {};

      // Loop through cookie parts and extract key-value pairs
      for (let i = 0; i < cookieParts.length; i++) {
        const [key, value] = cookieParts[i].split('=');
        decodedCookie[key.trim()] = value;
      }

      const decodedToken = jwt.verify(decodedCookie.access_token, process.env.JWT_SECRET);
      req.userId = decodedToken._id;
      req.isAdmin = decodedToken.isAdmin === 'true';
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid access token',
      });
    }

    const user = await User.findById(req.userId).populate('favoriteGames');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Extract the favorite games from the user object
    const favoriteGames = user.favoriteGames;

    res.status(200).json({
      success: true,
      favoriteGames: favoriteGames,
    });
  } catch (error) {
    console.error('Error fetching favorite games:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorite games',
    });
  }
});

// Route for adding a game to the user's favorite games
router.post("/favoriteGames/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const { cookie } = req.headers;

  try {
    // Check if the cookie is present
    if (!cookie) {
      return res.json({ success: false,error: "Unauthorized" });
    }

    // Extract the access token from the cookie
    const cookieParts = cookie.split(";");
    const decodedCookie = {};

    // Loop through cookie parts and extract key-value pairs
    for (let i = 0; i < cookieParts.length; i++) {
      const [key, value] = cookieParts[i].split("=");
      decodedCookie[key.trim()] = value;
    }

    // Verify the access token and extract the userId
    const decodedToken = jwt.verify(decodedCookie.access_token, process.env.JWT_SECRET);
    const userId = decodedToken._id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false,error: "User not found" });
    }

    // Check if the game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.json({ success: false,error: "Game not found" });
    }

    if (user.favoriteGames.includes(gameId)) {
      return res.json({success: false, error: "Game already in favorites" });
    }
    // Add the game to the user's favoriteGames array
    if (!user.favoriteGames.includes(gameId)) {
      user.favoriteGames.push(gameId);
    }

    // Save the updated user object
    const updatedUser = await user.save();
    
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error adding game to favorite games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Route for deleting a game from the user's favorite games
router.delete("/favoriteGames/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const { cookie } = req.headers;

  try {
    // Check if the cookie is present
    if (!cookie) {
      return res.json({ success: false, error: "Unauthorized" });
    }

    // Extract the access token from the cookie
    const cookieParts = cookie.split(";");
    const decodedCookie = {};

    // Loop through cookie parts and extract key-value pairs
    for (let i = 0; i < cookieParts.length; i++) {
      const [key, value] = cookieParts[i].split("=");
      decodedCookie[key.trim()] = value;
    }

    // Verify the access token and extract the userId
    const decodedToken = jwt.verify(decodedCookie.access_token, process.env.JWT_SECRET);
    const userId = decodedToken._id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, error: "User not found" });
    }

    // Check if the game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.json({ success: false, error: "Game not found" });
    }

    // Check if the game is in the user's favoriteGames array
    if (!user.favoriteGames.includes(gameId)) {
      return res.json({ success: false, error: "Game not in favorites" });
    }

    // Remove the game from the user's favoriteGames array
    user.favoriteGames = user.favoriteGames.filter((game) => game.toString() !== gameId);

    // Save the updated user object
    const updatedUser = await user.save();

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error deleting game from favorite games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



export default router;
