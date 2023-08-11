const { Router } = require("express");

const dishesRoutes = Router();


const DishesController = require("../controllers/DishesController");
const dishesController = new DishesController();

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

dishesRoutes.use(ensureAuthenticated);
dishesRoutes.post("/", dishesController.create);
dishesRoutes.put("/", dishesController.update);
dishesRoutes.get("/", dishesController.index);
dishesRoutes.get("/:id", dishesController.show);
dishesRoutes.delete("/:id", dishesController.delete);

module.exports = dishesRoutes;