const express = require("express");
const mongoose = require("mongoose");
const ArticlesSchema = require("./schema");
const ArticlesRouter = express.Router();

// Only articles
ArticlesRouter.get("/", async (req, res, next) => {
  try {
    const articles = await ArticlesSchema.find().populate("user");
    res.send(articles);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const article = await ArticlesSchema.findById(id);
    if (article) {
      res.send(article);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("Article not found!");
  }
});

ArticlesRouter.post("/", async (req, res, next) => {
  try {
    const newArticle = new ArticlesSchema(req.body);
    const { _id } = await newArticle.save();

    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.put("/:id", async (req, res, next) => {
  try {
    const article = await ArticlesSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (article) {
      res.send(article);
    } else {
      const error = new Error(`Article with id:${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.delete("/:id", async (req, res, next) => {
  try {
    const article = await ArticlesSchema.findByIdAndDelete(req.params.id);
    if (article) {
      res.send("Deleted");
    } else {
      const error = new Error(`Article with id:${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

//Reviews Sub-Routers

ArticlesRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const id = req.params.id;
    const article = await ArticlesSchema.findById(id);
    if (article) {
      res.send(article.reviews);
    } else {
      res.send(article.reviews);
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("Article not found!");
  }
});
ArticlesRouter.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await ArticlesSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );

    if (reviews && reviews.length > 0) {
      res.send(reviews[0]);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

ArticlesRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    const article = await ArticlesSchema.findById(id);
    if (article) {
      const article = await ArticlesSchema.findByIdAndUpdate(
        id,
        {
          $push: { reviews: req.body },
        },
        { new: true }
      );
      res.send(article);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("Article not found!");
  }
});

ArticlesRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    const article = await ArticlesSchema.findById(id);
    if (article) {
      const article = await ArticlesSchema.findByIdAndUpdate(
        id,
        { $pull: { reviews: { _id: mongoose.Types.ObjectId(reviewId) } } },
        {
          new: true,
        }
      );
      res.send(article);
    } else {
      const error = new Error(`Article with this ${id} does not exist`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.put("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await ArticlesSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );

    if (reviews && reviews.length > 0) {
      const reviewToReplace = { ...reviews[0].toObject(), ...req.body };

      const modifiedReview = await ArticlesSchema.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "reviews._id": mongoose.Types.ObjectId(req.params.reviewId),
        },
        { $set: { "reviews.$": reviewToReplace } },
        {
          runValidators: true,
          new: true,
        }
      );
      res.send(modifiedReview);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = ArticlesRouter;
