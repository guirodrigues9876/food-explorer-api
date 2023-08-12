const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class DishesController{
    async create(request, response){
        const { name, description, category, price, ingredients } = request.body;
        const user_id = request.user.id;
        
        if (!name || !category || !price || !description || !ingredients) {
            throw new AppError("Preencha todos os campos!");
        }
        
        const user = await knex("users").where({ id: user_id }).first();
        const isAdmin = user.isAdmin === 1;
        
        if(!isAdmin){
            throw new AppError("Usuário não autorizado!");
        } else {
            
            if (request.file) {
                const image = request.file.filename;
                const diskStorage = new DiskStorage();
                filename = await diskStorage.saveFile(image);
            }

            const [ dish_id ] = await knex("dishes").insert({
                name,
                category,
                price,
                description,
                // image: image ? filename : null,
                created_by: user_id,
                updated_by: user_id,
            });

            const ingredientsInsert = ingredients.map(name => {
                return {
                    dish_id,
                    name
                }
            });

            await knex("ingredients").insert(ingredientsInsert);
        }

        return response.status(201).json();    
    }
}

module.exports = DishesController;