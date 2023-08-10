const { hash, compare } = require("bcryptjs");
// const AppError = require("../utils/AppError");
const knex = require("../database/knex");


class UsersController {
    async create(request, response){
        const { name, email, password, isAdmin } = request.body;

        const hashedPassword = await hash(password, 8);


        await knex('users').insert({
            name,
            email,
            password: hashedPassword,
            isAdmin
        });

        return response.status(201).json();

    }

}

module.exports = UsersController;