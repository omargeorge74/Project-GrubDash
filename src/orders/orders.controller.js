const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// VALIDATIONS

// orderExist
const orderExist = (req, res, next) => {
      const { orderId } = req.params;
      const foundOrder = orders.find((order) => order.id === orderId);
      //console.log(orderId);
      //console.log("thsi is orderExist", foundOrder);
      if (foundOrder) {
            res.locals.orderId = orderId;
            res.locals.foundOrder = foundOrder;
            return next();
      }
      next({
            status: 404,
            message: `Order does not exist: ${req.params.orderId}`,
      });
};

// isOrderValid
const isOrderValid = (req, res, next) => {
      const { deliverTo = "", mobileNumber = "", dishes = [] } = req.body.data;
      //console.log(req.body.data);
      //console.log(deliverTo, mobileNumber, dishes, quantity);
      if (!deliverTo.length) {
            next({
                  status: 400,
                  message: "Order must include a deliverTo",
            });
      }
      if (!mobileNumber.length) {
            next({
                  status: 400,
                  message: "Order must include a mobileNumber",
            });
      }
      if (!dishes.length || !Array.isArray(dishes)) {
            next({
                  status: 400,
                  message: "Order must include at least one dish",
            });
      }
      // loop through to find index
      for (let dish of dishes) {
            const index = dishes.findIndex((dishId) => dishId.id === dish.id);
            // destructure to take out the quanity
            const { quantity } = dish;
            //console.log(quantity);
            if (!quantity || !Number.isInteger(dish.quantity)) {
                  next({
                        status: 400,
                        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
                  });
            }
      }
      res.locals.orderValid = req.body.data;
      //console.log(res.locals.orderValid);
      next();
};

// orderStatus
const orderStatus = (req, res, next) => {
      const orderId = res.locals.orderId;
      //   console.log(res.locals.orderId)
      //             console.log(res.locals.foundOrder)
      //console.log(orderId);
      const { orderValid } = res.locals;
      //console.log("this is from orderStatus ", orderValid);
      const { status = "" } = orderValid;
      //console.log(orderValid.status);
      if (orderValid.id) {
            if (orderValid.id !== orderId) {
                  next({
                        status: 400,
                        message: `Order id does not match route id. Order: ${orderValid.id}, Route: ${orderId}.`,
                  });
            }
      }
      if (status === "" || status === undefined || status === "invalid") {
            next({
                  status: 400,
                  message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
            });
      }
      if (status === "delivered") {
            next({
                  status: 400,
                  message: "A delivered order cannot be changed",
            });
      }
      res.locals.orderId = orderId;
      next();
};

// CRUD/(LIST) operations

// LIST
const list = (req, res, next) => {
      //console.log({ data: orders });
      res.json({ data: orders });
};

// READ
const read = (req, res, next) => {
      res.status(200).json({ data: res.locals.foundOrder });
};

// CREATE
const create = (req, res, next) => {
      const { deliverTo, mobileNumber, status, dishes } = res.locals.orderValid;
      console.log(req.body.data);
      //   res.locals.orderId
      //             res.locals.foundOrder
      // create new order
      const newOrder = {
            id: nextId(),
            deliverTo,
            mobileNumber,
            status,
            dishes,
      };
      orders.push(newOrder);
      res.status(201).json({ data: newOrder });
};

// UPDATE
const update = (req, res, next) => {
      const { foundOrder } = res.locals;
      //console.log(foundOrder);
      // get all propertys from req.body
      const { deliverTo, mobileNumber, dishes } = res.locals.orderValid;
      // replace variables
      foundOrder.deliverTo = deliverTo;
      foundOrder.mobileNumber = mobileNumber;
      foundOrder.dishes = dishes;

      res.json({ data: foundOrder });
};

// DELETE
const destroy = (req, res, next) => {
      const { orderId } = res.locals;
      const { foundOrder } = res.locals;
      const index = orders.findIndex((order) => order.id === orderId);

      if (foundOrder.status === "pending") {
            orders.splice(index, 1);
            res.sendStatus(204);
      }
      next({
            status: 400,
            message: "Only pending orders can be deleted",
      });
};
module.exports = {
      create: [isOrderValid, create],
      read: [orderExist, read],
      update: [orderExist, isOrderValid, orderStatus, update],
      delete: [orderExist, destroy],
      list,
};
