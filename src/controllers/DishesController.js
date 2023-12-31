const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class DishesController{
    async create(request, response){
        const { name, description, category, price, ingredients } = request.body;
        const user_id = request.user.id;
        let image = null;
        let filename = null;
        
        const diskStorage = new DiskStorage();

        if (!name || !category || !price || !description || !ingredients) {
            throw new AppError("Preencha todos os campos!");
        }
        
        const user = await knex("users").where({ id: user_id }).first();
        const isAdmin = user.isAdmin === 1;
        
        if(!isAdmin){
            throw new AppError("Usuário não autorizado!");
        } else {
            
            if (request.file) {
                image = request.file.filename;
                filename = await diskStorage.saveFile(image);
                console.log(image)
            }

            const [ dish_id ] = await knex("dishes").insert({
                name,
                category,
                price,
                description,
                image: image ? filename : null,
                created_by: user_id,
                updated_by: user_id,
            });

            const ingredientsInsert = JSON.parse(ingredients).map(name => {
                return {
                    dish_id,
                    name
                };
            });

            await knex("ingredients").insert(ingredientsInsert);
        }

        return response.status(201).json();    
    }

    async update(request, response){
        const user_id = request.user.id;
        const { name, description, category, price, ingredients } = request.body;
        const { id } = request.params;
        let image = null;
        let filename = null;

        const diskStorage = new DiskStorage()

        if (!name || !category || !price || !description || !ingredients) {
            throw new AppError("Preencha todos os campos!");
        }

        const user = await knex("users").where({ id: user_id }).first();
        const isAdmin = user.isAdmin === 1;

        if (!isAdmin) {
            throw new AppError("Usuário não autorizado");
          } else {

            const dish = await knex("dishes").where({ id }).first();

            filename = dish.image

            if (request.file) {
              if (dish.image) {
                await diskStorage.deleteFile(dish.image)
              }
      
              image = request.file.filename
              filename = await diskStorage.saveFile(image)
            }

            await knex("dishes").where({ id }).update({
                name,
                category,
                price,
                description,
                image: filename,
                updated_at: knex.fn.now()
            });

            const IngredientsInsert = JSON.parse(ingredients).map(name => {
                return {
                  dish_id: id,
                  name,
                };
              });
        
              await knex("ingredients").where({ dish_id: id }).delete();
        
              await knex('ingredients').insert(IngredientsInsert);
            }

          return response.status(200).json();
    }

    async index(request, response){
        const { search } = request.query;

        const dishes = await knex.select("dishes.*")
          .from("dishes")
          .innerJoin("ingredients", "dishes.id", "=", "ingredients.dish_id")
          .whereLike("dishes.name", `%${search}%`)
          .orWhereLike("ingredients.name", `%${search}%`)
          .groupBy('dishes.name');
    
        
          return response.status(200).json(dishes);
    }

    async show(request, response){
        const { id } = request.params;

        const dish = await knex("dishes").where({ id }).first();

        if(!dish){
            throw new AppError("Prato não encontrado");
        }

        const ingredients = await knex("ingredients").where({ dish_id: id}).orderBy("name");

        return response.json({
            ...dish,
            ingredients
        });
    }


    async delete(request, response){
        const { id } = request.params;
        const user_id = request.user.id;

        const user = await knex("users").where({ id: user_id}).first();
        const isAdmin = user.isAdmin === 1;
        console.log(isAdmin);
        
        if(!isAdmin) {
            throw new AppError("Usuário não autorizado.");
        } else {
            await knex("dishes").where({ id }).delete();
        }

        return response.json();
    }
}

module.exports = DishesController;