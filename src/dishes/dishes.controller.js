const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// Validations

// dishExist
const dishExist = (req, res, next) => {
      const { dishId } = req.params;
      const foundDishId = dishes.find((dish) => dish.id === dishId);
      //console.log(foundDishId);
      if (foundDishId) {
            res.locals.dishId = dishId;
            res.locals.foundDishId = foundDishId;
            //console.log(dishId, foundDishId);
            return next();
      }
      next({
            status: 404,
            message: `Dish doesn't exists: ${dishId}`,
      });
};

// isDishValid
const isDishValid = (req, res, next) => {
      const dishId = res.locals.dishId;
      //console.log(dishId);
      //destructure to validate each one
      const {
            name = "",
            description = "",
            price = 0,
            image_url = "",
      } = req.body.data;

      //console.log(res.locals.foundDishId)
      //console.log(req.body.data)
      if (!name.length) {
            next({
                  status: 400,
                  message: "Dish must include a name",
            });
      }
      if (!description.length) {
            next({
                  status: 400,
                  message: "Dish must include a description",
            });
      }
      if (price === undefined || price <= 0) {
            next({
                  status: 400,
                  message: "Dish must include a price greater than 0",
            });
      }
      if (!Number.isInteger(price)) {
            next({
                  status: 400,
                  message: "Dish must have a price that is an integer greater than 0",
            });
      }
      if (!image_url) {
            next({
                  status: 400,
                  message: "Dish must include a image_url",
            });
      }
      if (dishId && req.body.data.id && req.body.data.id !== dishId) {
            next({
                  status: 400,
                  message: `${req.body.data.id} does not match route id`,
            });
      }

      // console.log({
      //        id,
      //       name,
      //       description,
      //       price,
      //       image_url,
      // });
      res.locals.dishIsValid = req.body.data;
      //console.log(req.body.data);
      next();
};
// LIST
const list = (req, res, next) => {
      //console.log(dishes);
      res.json({ data: dishes });
};
// CREATE
const create = (req, res, next) => {
      const { name, description, price, image_url } = res.locals.dishIsValid;
      //   console.log(res.locals.foundId)
      //   console.log(res.locals.dishIsValid)
      //console.log(name, description, price, image_url);
      const newDish = {
            id: nextId(),
            name,
            description,
            price,
            image_url,
      };
      //console.log(newDish);
      dishes.push(newDish);
      //console.log(dishes);
      res.status(201).json({ data: newDish });
};
// READ
const read = (req, res, next) => {
      res.json({ data: res.locals.foundDishId });
      //console.log(res.locals.foundDishId);
};
// UPDATE
const update = (req, res, next) => {
      //   console.log(res.locals.dishId)
      //   console.log(res.locals.dishIsValid)
      const dishId = res.locals.dishId;
      const foundDishId = dishes.find((dish) => dish.id === dishId);
      // body that will be replaced
      //console.log(foundDishId);
      // The body that will replace the current body.
      const { name, price, description, image_url } = res.locals.dishIsValid;
      //console.log({ data: { name, price, description, image_url } });
      // Replacing the old body with new body.
      foundDishId.name = name;
      foundDishId.price = price;
      foundDishId.description = description;
      foundDishId.image_url = image_url;
      //console.log(foundDishId);
      res.json({ data: foundDishId });
};
module.exports = {
      update: [dishExist, isDishValid, update],
      read: [dishExist, read],
      create: [isDishValid, create],
      list,
};
