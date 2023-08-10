const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const knex = require("../database/knex");


class UsersController {
    async create(request, response){
        const { name, email, password, isAdmin } = request.body;

        if(!name || !email || !password){
            throw new AppError("Preencha todos os campos");
        };

        const checkUserExist =  await knex("users").where({ email }).first();

        if(checkUserExist){
            throw new AppError("Este e-mail já está em uso");
        }


        const hashedPassword = await hash(password, 8);

        await knex('users').insert({
            name,
            email,
            password: hashedPassword,
            isAdmin: isAdmin ? 1 : 0,
        });

        return response.status(201).json();

    }

}

module.exports = UsersController;